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

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

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
    connection.on('ReceiveMessage', (senderId, senderName, message, receiverId, timestamp) => {
      setMessages(prev => [
        ...prev,
        { senderId, senderName, content: message, receiverId, timestamp }
      ]);
    });

  }, [connection]);

  useEffect(() => {
    setMessages([]);

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

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    if (!connection || connection.state !== HubConnectionState.Connected) return;

    try {
      await connection.invoke('SendMessage', messageInput, activeChat);
      setMessageInput('');
    } catch (err) {
      console.error(err);
      alert('Не вдалося відправити повідомлення');
    }
  };

  const filteredMessages = messages.filter(m => {
    if (activeChat === null) return m.receiverId === null;
    return (
      (m.senderId === user.id && m.receiverId === activeChat) ||
      (m.senderId === activeChat && m.receiverId === user.id)
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
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                #
              </div>
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
              flexDirection: 'column' 
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

            <Card.Body 
                className="d-flex flex-column p-0" 
                style={{ overflow: 'hidden' }} 
            >
              
              <div
                className="flex-grow-1 p-3"
                style={{
                  backgroundColor: 'var(--bg-main)',
                  overflowY: 'auto', 
                  minHeight: 0      
                }}
              >
                {filteredMessages.map((msg, idx) => {
                const isMe = (user.id && String(msg.senderId) === String(user.id)) || 
                    (user.username && msg.senderName === user.username);

                  return (
                      <div
                       key={idx}
                       className={`d-flex mb-3 ${isMe ? 'justify-content-end' : 'justify-content-start'}`}
                      >

                      <div
                        className={`message-bubble ${isMe ? 'my-message' : 'other-message'}`}
                        style={{ maxWidth: '75%' }}
                      >
                        {!isMe && (
                          <div className="message-sender">
                            {msg.senderName}
                          </div>
                        )}

                        <div>{msg.content}</div>

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
                <Form onSubmit={sendMessage} className="d-flex gap-2">
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
                    variant="primary"
                    disabled={!connection || connection.state !== HubConnectionState.Connected}
                  >
                    Send
                  </Button>
                </Form>
              </div>
            </Card.Body>
          </Card>
        </Col>

      </Row>
    </Container>
  );
}

export default ChatPage;