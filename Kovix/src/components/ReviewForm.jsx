import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { reviewsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function ReviewForm({ movieId, onSubmit }) {
  const [rating, setRating] = useState(10); 
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!comment.trim()) {
      setError('Будь ласка, напишіть коментар');
      return;
    }

    try {
      setLoading(true);
      await reviewsAPI.create({
        movieId: parseInt(movieId),
        rating: parseInt(rating),
        comment: comment.trim()
      });
      
      setComment('');
      setRating(10);
      
      if (onSubmit) onSubmit(); 
      
    } catch (error) {
      setError(error.response?.data || 'Помилка при додаванні відгуку. Можливо, ви вже залишили відгук.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="mb-4 text-center p-4">
        <Card.Body>
          <h5>Хочете залишити відгук?</h5>
          <p className="text-muted">Тільки зареєстровані користувачі можуть писати рецензії.</p>
          <Link to="/login" className="btn btn-primary">Увійти в акаунт</Link>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <h5>✍️ Додати відгук</h5>
        {error && <Alert variant="danger" className="mt-2">{error}</Alert>}
        
        <Form onSubmit={handleSubmit} className="mt-3">
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Ваша оцінка: <span className="text-warning h5">{rating}/10</span></Form.Label>
            <Form.Range
              min="1"
              max="10"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Коментар</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Що ви думаєте про цей фільм?"
              disabled={loading}
              required
            />
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button type="submit" variant="success" disabled={loading}>
              {loading ? 'Публікація...' : 'Опублікувати відгук'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default ReviewForm;