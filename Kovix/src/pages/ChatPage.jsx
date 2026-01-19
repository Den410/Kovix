import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup, Modal, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { chatAPI, friendsAPI } from '../services/api';
import { useSearchParams } from 'react-router-dom';
import { HubConnectionState } from '@microsoft/signalr';
import { useChatConnection } from '../hooks/useChatConnection';
import '../style/App.css';
import { usersAPI } from '../services/api';

const API_BASE_URL = 'http://localhost:5096';

const formatMessageDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = now - date;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;

  if (date >= startOfToday) return date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  if (diffTime < oneWeek) return date.toLocaleDateString('uk-UA', { weekday: 'short' });
  return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
};

function ChatPage() {
  const { user } = useAuth();
  const [isBlocked, setIsBlocked] = useState(false);

const checkIfAccountBlocked = async () => {
  try {
    const res = await usersAPI.getPublicProfile(user.id);
    setIsBlocked(res.data.isBlocked);
  } catch (e) {
    console.error(e);}};

  useEffect(() => {
    checkIfAccountBlocked();
  }, []);
  

  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [friends, setFriends] = useState([]);
  
  const [generalChat, setGeneralChat] = useState({
      lastMessage: '',
      lastMessageTime: null,
      unreadCount: 0
  });

  const [editingId, setEditingId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null); 
  const messagesEndRef = useRef(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [targetMessage, setTargetMessage] = useState(null);

  const [searchParams] = useSearchParams();
  const forcedChatId = searchParams.get('activeChat');

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    let currentActiveId = null;
    if (forcedChatId) {
        currentActiveId = parseInt(forcedChatId);
        setActiveChat(currentActiveId);
        chatAPI.markAsRead(currentActiveId).catch(console.error);
    } else {
        chatAPI.markGeneralAsRead().catch(console.error);
    }

    friendsAPI.getMyFriends()
      .then(res => {
          const processedFriends = res.data.map(f => {
              if (currentActiveId && f.id === currentActiveId) {
                  return { ...f, unreadCount: 0 };
              }
              return f;
          });
          
          setFriends(processedFriends);
      })
      .catch(console.error);
    
    chatAPI.getGeneralChatInfo()
      .then(res => {
          if (res.data) {
              setGeneralChat(prev => ({
                  ...prev,
                  lastMessage: res.data.lastMessage || '',
                  lastMessageTime: res.data.lastMessageTime,
                  unreadCount: (currentActiveId === null) ? 0 : (res.data.unreadCount || 0)
              }));
          }
      })
      .catch(console.error);
  }, []); 

  const showBlockedSystemMessage = () => {
  setIsBlocked(true);
  setMessages([
    {
      id: 'blocked-' + Date.now(),
      senderId: 0,
      senderName: 'СИСТЕМА',
      content: '⛔ Ваш акаунт заблоковано. Ви не можете користуватись чатом.',
      timestamp: new Date().toISOString(),
      isSystem: true
    }
    
  ]);};

  const connection = useChatConnection((conn) => {
      
      conn.on('ReceiveMessage', (senderId, senderName, message, receiverId, timestamp, id) => {
          const isGeneralMessage = receiverId === null;
          
          const isCurrentChatOpen = (activeChat === null && isGeneralMessage) || 
                                    (String(activeChat) === String(senderId)) || 
                                    (String(activeChat) === String(receiverId));

          if (isCurrentChatOpen) {
              setMessages(prev => [...prev, { id, senderId, senderName, content: message, receiverId, timestamp }]);
          }

          if (isGeneralMessage) {
              setGeneralChat(prev => ({
                  lastMessage: `${senderName}: ${message}`,
                  lastMessageTime: timestamp,
                  unreadCount: activeChat !== null ? prev.unreadCount + 1 : 0
              }));
          } else {
              setFriends(prev => {
                  const updatedFriends = prev.map(f => {
                      if (String(f.id) === String(senderId) || String(f.id) === String(receiverId)) {
                          const isIncoming = String(f.id) === String(senderId);
                          const isChatClosed = String(activeChat) !== String(senderId);
                          
                          return { 
                              ...f, 
                              lastMessage: message, 
                              lastMessageTime: timestamp,
                              unreadCount: (isIncoming && isChatClosed) ? (f.unreadCount || 0) + 1 : f.unreadCount
                          };
                      }
                      return f;
                  });
                  return updatedFriends.sort((a, b) => new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0));
              });
          }
      });

      conn.on('MessageEdited', (id, newContent) => {
          setMessages(prev => prev.map(m => m.id === id ? { ...m, content: newContent, isEdited: true } : m));
      });
      conn.on('MessageDeleted', (id) => setMessages(prev => prev.filter(m => m.id !== id)));
      conn.on('MessageDeletedForMe', (id) => setMessages(prev => prev.filter(m => m.id !== id)));
      conn.on('UserStatusChanged', (userId, isOnline, lastActive) => {
          setFriends(prev => prev.map(f => String(f.id) === String(userId) ? { ...f, isOnline, lastActive } : f));
      });

      if (conn.state === HubConnectionState.Connected) {
          conn.invoke("GetFriendsStatus").catch(console.error);
      }
  });

  useEffect(() => {
    setMessages([]);
    setEditingId(null);
    setMessageInput('');

    if (activeChat === null) {
      setGeneralChat(prev => ({ ...prev, unreadCount: 0 }));
      chatAPI.markGeneralAsRead().catch(console.error);
      chatAPI.getGeneralHistory()
        .then(res => setMessages(res.data))
        .catch(err => {
            if (err.response?.status === 403) {
            showBlockedSystemMessage();
            } else {
            console.error(err);
            }
        });

    } else {
      setFriends(prev => prev.map(f => f.id === activeChat ? { ...f, unreadCount: 0 } : f));
      chatAPI.markAsRead(activeChat).catch(console.error);
      chatAPI.getPrivateHistory(activeChat)
        .then(res => setMessages(res.data))
        .catch(err => {
            if (err.response?.status === 403) {
            showBlockedSystemMessage();
            } else {
            console.error(err);
            }
        });

    }
  }, [activeChat]); 

  useEffect(scrollToBottom, [messages]);
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleSendOrSave = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !connection) return;
    const originalMessage = messageInput;

    try {
      if (editingId) {
          await connection.invoke('EditMessage', editingId, messageInput);
          setEditingId(null);
      } else {
        const now = new Date().toISOString();
        const tempId = 'temp-' + Date.now();
        if (activeChat !== null) {
            setMessages(prev => [...prev, {
                id: tempId,
                senderId: user.id,
                senderName: user.username,
                receiverId: activeChat,
                content: messageInput,
                timestamp: now
            }]);
        } else {
            setGeneralChat(prev => ({ ...prev, lastMessage: `Ви: ${messageInput}`, lastMessageTime: now }));
        }
        setMessageInput('');
        await connection.invoke('SendMessage', messageInput, activeChat);
      }
    } catch (err) {
      console.error("Помилка відправки:", err);
      if (err.toString().includes("BLOCK_ERROR") || err.toString().includes("заблоковано")) {
          const errorMessage = {
              id: 'error-' + Date.now(),
              senderId: 0, 
              senderName: "СИСТЕМА",
              content: "⛔ ВАШ АКАУНТ ЗАБЛОКОВАНО. Ви не можете надсилати повідомлення.",
              timestamp: new Date().toISOString(),
              isSystem: true 
          };
          setMessages(prev => [...prev, errorMessage]);
          setMessageInput(originalMessage);
      } else {
          alert("Помилка з'єднання: " + err.message);
      }
    }
  };


  const handleContextMenu = (e, msg) => { e.preventDefault(); setContextMenu({ x: e.pageX, y: e.pageY, message: msg }); };
  const openReportModal = (msg) => { setTargetMessage(msg); setReportReason(''); setShowReportModal(true); };
  const submitReport = async () => {
      if (!reportReason || !targetMessage) return;
      try {
          await fetch(`${API_BASE_URL}/api/reports`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
              body: JSON.stringify({ reportedUserId: String(targetMessage.senderId), messageId: targetMessage.id, content: targetMessage.content, reason: reportReason })
          });
          alert("Скаргу надіслано"); setShowReportModal(false);
      } catch (e) { console.error(e); }
  };
  const startEditing = (msg) => { setEditingId(msg.id); setMessageInput(msg.content); };
  const cancelEditing = () => { setEditingId(null); setMessageInput(''); };
  const deleteForEveryone = async (id) => { if(window.confirm("Видалити для всіх?")) await connection.invoke('DeleteMessageForEveryone', id); };
  const deleteForMe = async (id) => { await connection.invoke('DeleteMessageForMe', id); };
  const filteredMessages = messages;

  return (
    <Container className="mt-4 mb-5" style={{ height: 'calc(100vh - 100px)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
      <Row className="h-100">
        <Col md={4} className="h-100 d-flex flex-column">
          <ListGroup className="flex-grow-1 overflow-auto shadow-sm" style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-color)', borderRadius: '10px' }}>
            <ListGroup.Item 
                action 
                active={activeChat === null} 
                onClick={() => setActiveChat(null)} 
                className="p-2 border-bottom"
                style={{ 
                    border: 'none', 
                    borderBottom: '1px solid var(--border-color)', 
                    backgroundColor: activeChat === null ? 'var(--bg-hover)' : 'transparent',
                    cursor: 'pointer' 
                }}
            >
               <div className="d-flex w-100 justify-content-between align-items-center">
                    <div className="d-flex align-items-center overflow-hidden" style={{ flex: 1 }}>
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 45, height: 45 }}>#</div>
                        <div className="ms-3 overflow-hidden d-flex flex-column justify-content-center">
                            <span className="fw-bold">🌍 Загальний чат</span>
                            <span className="text-muted text-truncate small" style={{ fontSize: '0.85rem' }}>
                                {generalChat.lastMessage || <em style={{opacity:0.6}}>Спілкуйтеся тут</em>}
                            </span>
                        </div>
                    </div>
                    <div className="ms-2 d-flex flex-column align-items-end" style={{ minWidth: '50px' }}>
                        <span className="text-muted small mb-1" style={{ fontSize: '0.75rem' }}>
                            {formatMessageDate(generalChat.lastMessageTime)}
                        </span>
                        {generalChat.unreadCount > 0 && (
                            <Badge bg="danger" pill style={{ fontSize: '0.75em' }}>
                                {generalChat.unreadCount}
                            </Badge>
                        )}
                    </div>
               </div>
            </ListGroup.Item>

            {friends.length > 0 && <div className="text-muted small mt-3 mb-2 px-3">ДРУЗІ</div>}

            {friends.map(friend => {
              const isOnline = friend.isOnline === true;
              const borderColor = isOnline ? '#57cbde' : 'transparent';
              
              return (
                <ListGroup.Item
                  key={friend.id}
                  action
                  active={activeChat === friend.id}
                  onClick={() => setActiveChat(friend.id)}
                  className="p-2 border-bottom"
                  style={{ 
                    border: 'none', 
                    borderBottom: '1px solid var(--border-color)', 
                    backgroundColor: activeChat === friend.id ? 'var(--bg-hover)' : 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <div className="d-flex align-items-center overflow-hidden" style={{ flex: 1 }}>
                        <div className="position-relative flex-shrink-0">
                            <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" 
                                 style={{ width: 45, height: 45, border: `2px solid ${borderColor}`, overflow: 'hidden' }}>
                                {friend.avatarUrl ? (
                                    <img src={`${API_BASE_URL}${friend.avatarUrl}`} alt="" style={{width: '100%', height:'100%', objectFit: 'cover'}}/>
                                ) : ( friend.username[0].toUpperCase() )}
                            </div>
                        </div>
                        <div className="ms-3 overflow-hidden d-flex flex-column justify-content-center">
                            <span className="fw-bold text-truncate" style={{ fontSize: '0.95rem' }}>{friend.username}</span>
                            <span className="text-muted text-truncate small" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                {friend.lastMessage || <em style={{opacity: 0.6}}>Немає повідомлень</em>}
                            </span>
                        </div>
                    </div>
                    <div className="ms-2 d-flex flex-column align-items-end" style={{ minWidth: '50px' }}>
                        <span className="text-muted small mb-1" style={{ fontSize: '0.75rem' }}>
                            {formatMessageDate(friend.lastMessageTime)}
                        </span>
                        {friend.unreadCount > 0 && (
                            <Badge bg="danger" pill style={{ fontSize: '0.75em' }}>
                                {friend.unreadCount}
                            </Badge>
                        )}
                    </div>
                  </div>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        </Col>

        <Col md={8} className="h-100">
          <Card className="h-100 shadow-sm" style={{ backgroundColor: 'var(--bg-chat)', borderColor: 'var(--border-color)', display: 'flex', flexDirection: 'column' }}>
            <Card.Header className="fw-bold py-3" style={{ backgroundColor: 'var(--bg-panel)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
              {activeChat === null ? '🌍 Загальний чат' : friends.find(f => f.id === activeChat)?.username || '💬 Чат'}
            </Card.Header>

            <Card.Body className="d-flex flex-column p-0" style={{ overflow: 'hidden' }}>
                <div className="flex-grow-1 p-3" style={{ backgroundColor: 'var(--bg-main)', overflowY: 'auto' }}>
                    {filteredMessages.map((msg, idx) => {
                        const myId = String(user?.id || '');
                        const sender = String(msg.senderId || '');
                        const isMe = sender === myId;
                        if (msg.senderId === 0 || msg.senderName === "СИСТЕМА") {
                            return (
                                <div key={idx} className="d-flex justify-content-center mb-3">
                                    <Badge bg="danger" className="p-2 text-wrap" style={{ maxWidth: '80%' }}>
                                        {msg.content}
                                    </Badge>
                                </div>
                            );
                        }
                        
                        return (
                            <div key={idx} className={`d-flex mb-3 ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>
                                <div className={`message-bubble ${isMe ? 'my-message' : 'other-message'}`} 
                                     onContextMenu={(e) => handleContextMenu(e, msg)} style={{ maxWidth: '75%' }}>
                                    {!isMe && <div className="message-sender">{msg.senderName}</div>}
                                    <div className="d-flex align-items-center flex-wrap">
                                        <span style={{ wordBreak: 'break-word' }}>
                                            {msg.content}
                                            {msg.isEdited && <small className="text-muted ms-1" style={{fontSize: '0.7em'}}>(ред.)</small>}
                                        </span>
                                    </div>
                                    <div className="message-time text-end mt-1">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-3" style={{ backgroundColor: 'var(--bg-panel)', borderTop: '1px solid var(--border-color)' }}>
                    {editingId && <div className="d-flex justify-content-between small text-primary mb-2"><span>✏️ Редагування...</span><span onClick={cancelEditing} style={{cursor:'pointer'}}>✖</span></div>}
                    <Form onSubmit={handleSendOrSave} className="d-flex gap-2">
                    <Form.Control
                        type="text"
                        value={messageInput}
                        onChange={e => setMessageInput(e.target.value)}
                        autoComplete="off"
                        disabled={isBlocked}
                        placeholder={isBlocked ? "⛔ Акаунт заблоковано" : "Напишіть повідомлення..."}
                        style={{
                        backgroundColor: 'var(--bg-chat)',
                        color: 'var(--text-main)',
                        borderColor: 'var(--border-color)'
                        }}
                    />

                    <Button
                        type="submit"
                        variant={editingId ? "success" : "primary"}
                        disabled={
                        isBlocked ||
                        !connection ||
                        connection.state !== HubConnectionState.Connected
                        }
                    >
                        {editingId ? "Save" : "Send"}
                    </Button>
                    </Form>
                </div>
            </Card.Body>
          </Card>
          
          {contextMenu && (
             <div style={{ position: 'absolute', top: contextMenu.y, left: contextMenu.x, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', zIndex: 9999, borderRadius: '5px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                 {String(contextMenu.message.senderId) !== String(user?.id) && (
                    <div onClick={() => {openReportModal(contextMenu.message); setContextMenu(null);}} className="p-2 text-warning" style={{cursor:'pointer'}}>⚠️ Поскаржитися</div>
                 )}
                 {(String(contextMenu.message.senderId) === String(user?.id) || user?.role === 'Admin') && (
                    <div onClick={() => {deleteForEveryone(contextMenu.message.id); setContextMenu(null);}} className="p-2 text-danger" style={{cursor:'pointer', borderTop: '1px solid var(--border-color)'}}>🗑️ Видалити для всіх</div>
                 )}
                 {String(contextMenu.message.senderId) === String(user?.id) && (
                    <div onClick={() => {startEditing(contextMenu.message); setContextMenu(null);}} className="p-2" style={{cursor:'pointer', borderTop: '1px solid var(--border-color)'}}>✏️ Редагувати</div>
                 )}
                 <div onClick={() => {deleteForMe(contextMenu.message.id); setContextMenu(null);}} className="p-2" style={{cursor:'pointer', borderTop: '1px solid var(--border-color)'}}>❌ Видалити для мене</div>
             </div>
          )}
          
          <Modal show={showReportModal} onHide={() => setShowReportModal(false)} centered>
             <Modal.Header closeButton><Modal.Title className="text-danger">⚠️ Поскаржитися</Modal.Title></Modal.Header>
             <Modal.Body>
                 <p className="small text-muted">Повідомлення: "{targetMessage?.content}"</p>
                 <Form.Control as="textarea" rows={3} placeholder="Причина..." value={reportReason} onChange={e => setReportReason(e.target.value)} />
             </Modal.Body>
             <Modal.Footer>
                 <Button variant="secondary" onClick={() => setShowReportModal(false)}>Скасувати</Button>
                 <Button variant="danger" onClick={submitReport}>Відправити</Button>
             </Modal.Footer>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
}

export default ChatPage;