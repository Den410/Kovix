import React, { useState } from 'react';
import { Card, Badge, Button, Form, Modal } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { reviewsAPI } from '../services/api';

function ReviewList({ reviews, onReviewUpdated }) {
  const { user } = useAuth();
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 10, comment: '' });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const startEditing = (review) => {
    setEditingId(review.id);
    setEditForm({ rating: review.rating, comment: review.comment });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ rating: 10, comment: '' });
  };

  const handleUpdate = async (reviewId) => {
    try {
      await reviewsAPI.update(reviewId, {
        rating: parseInt(editForm.rating),
        comment: editForm.comment
      });
      setEditingId(null);
      if (onReviewUpdated) onReviewUpdated();
    } catch (error) {
      alert('Помилка при оновленні: ' + (error.response?.data || error.message));
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей відгук?')) {
      try {
        await reviewsAPI.delete(reviewId);
        if (onReviewUpdated) onReviewUpdated();
      } catch (error) {
        alert('Помилка видалення');
      }
    }
  };

  if (!reviews || reviews.length === 0) {
    return (
      <Card className="text-center p-4 shadow-sm border-0 bg-light">
        <p className="text-muted mb-0">Ще немає відгуків. Будьте першим!</p>
      </Card>
    );
  }

  return (
    <div>
      {reviews.map((review) => {
        const isAuthor = user && user.username === review.user?.username;
        const isAdmin = user && user.role === 'Admin';
        const isEditing = editingId === review.id;

        return (
          <Card key={review.id} className="mb-3 shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h6 className="mb-1 fw-bold">{review.user?.username || 'Користувач'}</h6>
                  <small className="text-muted">{formatDate(review.createdAt)}</small>
                </div>
                
                {!isEditing && (
                  <Badge bg={review.rating >= 8 ? 'success' : review.rating >= 5 ? 'warning' : 'danger'}>
                    ⭐ {review.rating}/10
                  </Badge>
                )}
              </div>

              {isEditing ? (
                <div className="mt-3 p-3 bg-light rounded">
                  <Form.Group className="mb-3">
                    <Form.Label>Змінити оцінку: <strong>{editForm.rating}/10</strong></Form.Label>
                    <Form.Range 
                      min="1" max="10" 
                      value={editForm.rating}
                      onChange={(e) => setEditForm({...editForm, rating: e.target.value})}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Control 
                      as="textarea" rows={3}
                      value={editForm.comment}
                      onChange={(e) => setEditForm({...editForm, comment: e.target.value})}
                    />
                  </Form.Group>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant="success" onClick={() => handleUpdate(review.id)}>Зберегти</Button>
                    <Button size="sm" variant="secondary" onClick={cancelEditing}>Скасувати</Button>
                  </div>
                </div>
              ) : (
                <Card.Text className="mt-2" style={{ whiteSpace: 'pre-wrap' }}>
                  {review.comment}
                </Card.Text>
              )}

              {!isEditing && (isAuthor || isAdmin) && (
                <div className="mt-3 pt-2 border-top d-flex gap-2 justify-content-end">
                  {isAuthor && (
                    <Button variant="link" size="sm" className="text-decoration-none p-0 me-2" onClick={() => startEditing(review)}>
                      ✏️ Редагувати
                    </Button>
                  )}
                  <Button variant="link" size="sm" className="text-danger text-decoration-none p-0" onClick={() => handleDelete(review.id)}>
                    🗑️ Видалити
                  </Button>
                </div>
              )}

            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
}

export default ReviewList;