import { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { authAPI } from '../services/api';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await authAPI.forgotPassword(email);
      setMessage('Перевірте вашу пошту. Ми відправили інструкції.');
    } catch (err) {
      setError(err.response?.data || 'Щось пішло не так.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '400px', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
        <Card.Body>
          <h3 className="text-center mb-4">Відновлення паролю</h3>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Ваш Email</Form.Label>
              <Form.Control 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}
              />
            </Form.Group>
            
            <Button disabled={loading} className="w-100" type="submit" variant="primary">
              {loading ? 'Відправка...' : 'Відновити пароль'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ForgotPasswordPage;