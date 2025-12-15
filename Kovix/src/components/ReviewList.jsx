import React, { useState } from 'react';
import { Card, Badge, Button, Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { reviewsAPI } from '../services/api';

const API_BASE_URL = 'http://localhost:5096'; 

function ReviewList({ reviews, onReviewUpdated }) {
  const { user } = useAuth();
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 10, comment: '' });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const handleVote = async (reviewId, isLike) => {
    if (!user) {
      alert("Будь ласка, увійдіть, щоб голосувати!");
      return;
    }
    try {
      await reviewsAPI.vote(reviewId, isLike);
      if (onReviewUpdated) onReviewUpdated();
    } catch (error) {
      console.error("Помилка голосування", error);
    }
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
        const isAuthor = user && user.username === review.userName;
        const isAdmin = user && user.role === 'Admin';
        const isEditing = editingId === review.id;
        
        const likeVariant = review.currentUserVote === 1 ? "success" : "outline-secondary";
        const dislikeVariant = review.currentUserVote === -1 ? "danger" : "outline-secondary";

        return (
          <Card key={review.id} className="mb-3 shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center">
                   <div className="me-2 rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white" 
                        style={{width: 40, height: 40, overflow: 'hidden'}}>
                      {review.userAvatar ? (
                        <img src={`${API_BASE_URL}${review.userAvatar}`} alt="Ava" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                      ) : (
                        <span>{review.userName?.charAt(0).toUpperCase()}</span>
                      )}
                   </div>
                   <div>
                      <h6 className="mb-0 fw-bold">{review.userName || 'Користувач'}</h6>
                      <small className="text-muted">{formatDate(review.createdAt)}</small>
                   </div>
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

              <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                
                <div className="d-flex gap-2">
                  <Button 
                    variant={likeVariant} 
                    size="sm" 
                    onClick={() => handleVote(review.id, true)}
                    style={{borderRadius: '20px'}}
                  >
                    👍 {review.likesCount}
                  </Button>
                  <Button 
                    variant={dislikeVariant} 
                    size="sm" 
                    onClick={() => handleVote(review.id, false)}
                    style={{borderRadius: '20px'}}
                  >
                    👎 {review.dislikesCount}
                  </Button>
                </div>

                {!isEditing && (isAuthor || isAdmin) && (
                  <div>
                    {isAuthor && (
                      <Button variant="link" size="sm" className="text-decoration-none me-2" onClick={() => startEditing(review)}>
                        ✏️
                      </Button>
                    )}
                    <Button variant="link" size="sm" className="text-danger text-decoration-none" onClick={() => handleDelete(review.id)}>
                      🗑️
                    </Button>
                  </div>
                )}
              </div>

            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
}

export default ReviewList;