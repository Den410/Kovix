import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { chatAPI, friendsAPI } from '../services/api';
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

                  return (
                    <div
                      key={idx}
                      className={`d-flex mb-3 ${isMe ? 'justify-content-end' : 'justify-content-start'}`}
                    >
                      <div
                        className={`message-bubble ${isMe ? 'my-message' : 'other-message'}`}
                        style={{ 
                            maxWidth: '75%', 
                            cursor: 'context-menu'
                        }}
                        onContextMenu={(e) => handleContextMenu(e, msg)}
                      >
                        {!isMe && (
                          <div className="message-sender">
                            {msg.senderName}
                          </div>
                        )}
                        <div>
                            {msg.content}
                            {msg.isEdited && <span className="text-muted ms-1" style={{fontSize: '0.7em'}}>(ред.)</span>}
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

                  {(() => {
                      const isGeneral = activeChat === null;
                      const isMe = String(contextMenu.message.senderId) === String(user?.id);
                      const isAdmin = user?.role === 'Admin';

                      const canDeleteEveryone = isGeneral 
                          ? isAdmin 
                          : (isMe || isAdmin); 

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
    </Container>
  );
}

export default ChatPage;