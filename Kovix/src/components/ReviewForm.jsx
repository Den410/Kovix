import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { reviewsAPI } from '../services/api';

function ReviewForm({ movieId, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!comment.trim()) {
      setError('Будь ласка, напишіть коментар');
      return;
    }

    try {
      setLoading(true);
      await reviewsAPI.create({
        movieId: parseInt(movieId),
        userId: 1, // TODO: Get from auth context
        rating: parseInt(rating),
        comment: comment.trim()
      });
      
      setSuccess('Відгук успішно додано!');
      setComment('');
      setRating(5);
      
      setTimeout(() => {
        setSuccess('');
        if (onSubmit) onSubmit();
      }, 2000);
    } catch (error) {
      setError(error.response?.data || 'Помилка при додаванні відгуку');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <h5>Додати відгук</h5>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Оцінка: {rating}/10</Form.Label>
            <Form.Range
              min="1"
              max="10"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
            <div className="text-center">
              {'⭐'.repeat(Math.round(rating / 2))}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Коментар</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Напишіть ваш відгук про фільм..."
              disabled={loading}
            />
          </Form.Group>

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Додавання...' : 'Додати відгук'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default ReviewForm;