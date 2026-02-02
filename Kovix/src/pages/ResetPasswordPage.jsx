import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError('Паролі не співпадають');
    }
    
    setLoading(true);
    setError('');

    try {
      await authAPI.resetPassword({
        email,
        token,
        newPassword
      });
      setMessage('Пароль успішно змінено! Перенаправлення на вхід...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Невірний або застарілий токен.');
    } finally {
      setLoading(false);
    }
  };

  if (!email || !token) {
    return (
        <Container className="mt-5 text-center">
            <Alert variant="danger">Невірне посилання для скидання паролю.</Alert>
        </Container>
    );
  }

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '400px', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
        <Card.Body>
          <h3 className="text-center mb-4">Новий пароль</h3>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Введіть новий пароль</Form.Label>
              <Form.Control 
                type="password" 
                required 
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Підтвердіть пароль</Form.Label>
              <Form.Control 
                type="password" 
                required 
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}
              />
            </Form.Group>
            
            <Button disabled={loading} className="w-100" type="submit" variant="success">
              {loading ? 'Збереження...' : 'Змінити пароль'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ResetPasswordPage;