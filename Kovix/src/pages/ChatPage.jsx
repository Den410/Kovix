import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup, Modal} from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { chatAPI, friendsAPI } from '../services/api';
import { useSearchParams } from 'react-router-dom';
import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import '../style/App.css';
const API_BASE_URL = 'http://localhost:5096';

function ChatPage() {
  const { user } = useAuth();

  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [friends, setFriends] = useState([]);
  
  const [editingId, setEditingId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null); 

  const messagesEndRef = useRef(null);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [targetMessage, setTargetMessage] = useState(null);

  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const forcedChatId = searchParams.get('activeChat');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (forcedChatId) {
      setActiveChat(forcedChatId);
    }
  }, [forcedChatId]);


  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    friendsAPI.getMyFriends()
      .then(res => setFriends(res.data.filter(f => f.status === 'Friend')))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const conn = new HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/chatHub`, {
        accessTokenFactory: () => localStorage.getItem('token')
      })
      .withAutomaticReconnect()
      .build();

    setConnection(conn);
  }, []);

  useEffect(() => {
    if (!connection) return;

    if (connection.state === HubConnectionState.Disconnected) {
      connection.start()
        .then(() => console.log('Connected to SignalR'))
        .catch(err => console.error('SignalR error:', err));
    }

    connection.off('ReceiveMessage');
    connection.on('ReceiveMessage', (senderId, senderName, message, receiverId, timestamp, id) => {
      setMessages(prev => [
        ...prev,
        { id, senderId, senderName, content: message, receiverId, timestamp }
      ]);
    });

    connection.off('MessageEdited');
    connection.on('MessageEdited', (id, newContent) => {
        setMessages(prev => prev.map(m => 
            m.id === id ? { ...m, content: newContent, isEdited: true } : m
        ));
    });

    connection.off('MessageDeleted');
    connection.on('MessageDeleted', (id) => {
        setMessages(prev => prev.filter(m => m.id !== id));
    });

    connection.off('MessageDeletedForMe');
    connection.on('MessageDeletedForMe', (id) => {
        setMessages(prev => prev.filter(m => m.id !== id));
    });

  }, [connection]);

  useEffect(() => {
    if (forcedChatId) {
      setActiveChat(forcedChatId); 
    }
  }, [forcedChatId]);

  useEffect(() => {
    setMessages([]);
    setEditingId(null);
    setMessageInput('');

    if (activeChat === null) {
      chatAPI.getGeneralHistory()
        .then(res => setMessages(res.data))
        .catch(console.error);
    } else {
      chatAPI.getPrivateHistory(activeChat)
        .then(res => setMessages(res.data))
        .catch(console.error);
    }
  }, [activeChat]);

  const handleSendOrSave = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    if (!connection || connection.state !== HubConnectionState.Connected) return;

    try {
      if (editingId) {
          await connection.invoke('EditMessage', editingId, messageInput);
          setEditingId(null);
      } else {
          await connection.invoke('SendMessage', messageInput, activeChat);
      }
      setMessageInput('');
    } catch (err) {
      console.error(err);
      alert('Помилка відправки/редагування');
    }
  };

  const handleContextMenu = (e, msg) => {
      e.preventDefault();
      setContextMenu({
          x: e.pageX,
          y: e.pageY,
          message: msg
      });
  };

  const openReportModal = (msg) => {
    setTargetMessage(msg); 
    setReportReason('');  
    setShowReportModal(true); 
  };


 const submitReport = async () => {
    if (!reportReason.trim()) return alert("Будь ласка, вкажіть причину.");
    if (!targetMessage?.senderId) return alert("Неможливо визначити користувача.");

    const payload = {
        reportedUserId: String(targetMessage.senderId), 
        messageId: targetMessage.id || null, 
        content: targetMessage.content,
        reason: reportReason
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/reports`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
          const err = await res.json();
          console.error("Server validation error details:", err.errors);
      }

      alert("Скаргу успішно відправлено адміністратору.");
      setShowReportModal(false);
    } catch (error) {
      console.error("Помилка при відправці скарги:", error);
      alert("Сталася помилка.");
    }
};

  const startEditing = (msg) => {
      setEditingId(msg.id);
      setMessageInput(msg.content);
  };

  const cancelEditing = () => {
      setEditingId(null);
      setMessageInput('');
  };

  const deleteForEveryone = async (id) => {
      if(window.confirm("Видалити це повідомлення для всіх?")) {
          try {
              await connection.invoke('DeleteMessageForEveryone', id);
          } catch(e) { console.error(e); }
      }
  };

  const deleteForMe = async (id) => {
      try {
          await connection.invoke('DeleteMessageForMe', id);
      } catch(e) { console.error(e); }
  };

  const filteredMessages = messages.filter(m => {
    if (activeChat === null) return m.receiverId === null;

    const myId = String(user?.id || ''); 
    const chatId = String(activeChat || '');
    const msgSender = String(m.senderId || '');
    const msgReceiver = m.receiverId ? String(m.receiverId) : '';

    return (
      (msgSender === myId && msgReceiver === chatId) || 
      (msgSender === chatId && msgReceiver === myId)    
    );
  });

  return (
    <Container
      className="mt-4 mb-5"
      style={{
        height: 'calc(100vh - 100px)',
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-main)'
      }}
    >
      <Row className="h-100">
        <Col md={4} className="h-100 d-flex flex-column">
          <ListGroup
            className="flex-grow-1 overflow-auto shadow-sm"
            style={{
              backgroundColor: 'var(--bg-panel)',
              borderColor: 'var(--border-color)',
              borderRadius: '10px',
              maxHeight: '100%'
            }}
          >
            <ListGroup.Item
              action
              active={activeChat === null}
              onClick={() => setActiveChat(null)}
              className="d-flex align-items-center gap-2 py-3"
            >
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>#</div>
              <strong>🌍 Загальний чат</strong>
            </ListGroup.Item>

            {friends.length > 0 && (
              <div className="text-muted small mt-3 mb-2 px-3">ДРУЗІ</div>
            )}

            {friends.map(friend => (
              <ListGroup.Item
                key={friend.id}
                action
                active={activeChat === friend.id}
                onClick={() => setActiveChat(friend.id)}
                className="d-flex align-items-center gap-2"
              >
                <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 35, height: 35 }}>
                  {friend.username[0].toUpperCase()}
                </div>
                {friend.username}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>

        <Col md={8} className="h-100">
          <Card
            className="h-100 shadow-sm"
            style={{
              backgroundColor: 'var(--bg-chat)',
              borderColor: 'var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}
          >
            <Card.Header
              className="fw-bold py-3"
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderBottom: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                flexShrink: 0
              }}
            >
              {activeChat === null ? '🌍 Загальний чат' : '💬 Приватний чат'}
            </Card.Header>

            <Card.Body className="d-flex flex-column p-0" style={{ overflow: 'hidden' }}>
              <div
                className="flex-grow-1 p-3"
                style={{
                  backgroundColor: 'var(--bg-main)',
                  overflowY: 'auto',
                  minHeight: 0
                }}
              >
                {filteredMessages.map((msg, idx) => {
                  const myId = String(user?.id || '');
                  const sender = String(msg.senderId || '');
                  const isMe = sender === myId;
                  const isHighlighted = String(msg.id) === String(highlightId);

                  return (
                    <div
                      key={idx}
                      className={`d-flex mb-3 ${isMe ? 'justify-content-end' : 'justify-content-start'}`}
                    >
                    <div
                      className={`message-bubble ${isMe ? 'my-message' : 'other-message'}`}
                      
                      onContextMenu={(e) => handleContextMenu(e, msg)} 

                      style={{
                        maxWidth: '75%',
                        border: isHighlighted ? '3px solid #dc3545' : undefined,
                        backgroundColor: isHighlighted ? '#ffe5e5' : undefined,
                        color: isHighlighted ? '#000000' : undefined, 
                        fontWeight: isHighlighted ? 'bold' : undefined
                      }}
                    >
                        {!isMe && (
                          <div className="message-sender">
                            {msg.senderName}
                          </div>
                        )}
                        <div className="d-flex align-items-center">
                          <span>
                            {msg.content}
                            {msg.isEdited && (
                              <span className="text-muted ms-1" style={{ fontSize: '0.7em' }}>
                                (ред.)
                              </span>
                            )}
                          </span>
                        </div>

                        <div className="message-time text-end">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div
                className="p-3"
                style={{
                  backgroundColor: 'var(--bg-panel)',
                  borderTop: '1px solid var(--border-color)',
                  flexShrink: 0
                }}
              >
                {editingId && (
                    <div className="d-flex justify-content-between align-items-center mb-2 px-2 small text-primary">
                        <span>✏️ Редагування повідомлення...</span>
                        <span style={{cursor: 'pointer'}} onClick={cancelEditing}>✖ Скасувати</span>
                    </div>
                )}

                <Form onSubmit={handleSendOrSave} className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    placeholder="Напишіть повідомлення..."
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    autoComplete="off"
                    style={{
                      backgroundColor: 'var(--bg-chat)',
                      color: 'var(--text-main)',
                      borderColor: 'var(--border-color)'
                    }}
                  />
                  <Button
                    type="submit"
                    variant={editingId ? "success" : "primary"}
                    disabled={!connection || connection.state !== HubConnectionState.Connected}
                  >
                    {editingId ? "Save" : "Send"}
                  </Button>
                </Form>
              </div>
            </Card.Body>
          </Card>

          {contextMenu && (
              <div 
                className="shadow-lg rounded"
                style={{
                    position: 'absolute',
                    top: contextMenu.y,
                    left: contextMenu.x,
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    zIndex: 9999,
                    minWidth: '160px',
                    overflow: 'hidden'
                }}
              >
                  {String(contextMenu.message.senderId) === String(user?.id) && (
                      <div 
                        className="px-3 py-2 text-start" 
                        style={{cursor: 'pointer', borderBottom: '1px solid var(--border-color)'}}
                        onClick={() => startEditing(contextMenu.message)}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-secondary)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                          ✏️ Редагувати
                      </div>
                  )}

                  {String(contextMenu.message.senderId) !== String(user?.id) && activeChat === null && (
                      <div 
                        className="px-3 py-2 text-start text-warning" 
                        style={{cursor: 'pointer', borderBottom: '1px solid var(--border-color)'}}
                        onClick={() => {
                            openReportModal(contextMenu.message);
                            setContextMenu(null); 
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-secondary)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                          ⚠️ Поскаржитися
                      </div>
                  )}

                  {(() => {
                      const isMe = String(contextMenu.message.senderId) === String(user?.id);
                      const isAdmin = user?.role === 'Admin';
                      const canDeleteEveryone = isMe || isAdmin; 

                      if (canDeleteEveryone) {
                          return (
                              <div 
                                className="px-3 py-2 text-start text-danger" 
                                style={{cursor: 'pointer', borderBottom: '1px solid var(--border-color)'}}
                                onClick={() => deleteForEveryone(contextMenu.message.id)}
                                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-secondary)'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                              >
                                  🗑️ Видалити для всіх
                              </div>
                          );
                      }
                  })()}

                  {activeChat !== null && (
                      <div 
                        className="px-3 py-2 text-start" 
                        style={{cursor: 'pointer'}}
                        onClick={() => deleteForMe(contextMenu.message.id)}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-secondary)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                           ❌ Видалити для мене
                      </div>
                  )}
              </div>
          )}
        </Col>
      </Row>
      <Modal
        show={showReportModal}
        onHide={() => setShowReportModal(false)}
        centered
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="text-danger">
            ⚠️ Поскаржитися на користувача
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="small text-muted mb-2">
            Ви скаржитесь на повідомлення від користувача{" "}
            <strong>{targetMessage?.senderName}</strong>:
          </p>

          <div className="p-2 bg-secondary bg-opacity-10 rounded mb-3 fst-italic border-start border-4 border-danger">
            "{targetMessage?.content}"
          </div>

          <Form.Group>
            <Form.Label>Вкажіть причину скарги:</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Наприклад: спам, образи, неприйнятний контент..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              autoFocus
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReportModal(false)}>
            Скасувати
          </Button>
          <Button variant="danger" onClick={submitReport}>
            Відправити скаргу
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ChatPage;