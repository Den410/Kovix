import React from 'react';
import { Card, Badge } from 'react-bootstrap';

function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
      <Card className="text-center p-4">
        <p className="text-muted">Ще немає відгуків. Будьте першим!</p>
      </Card>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div>
      {reviews.map((review) => (
        <Card key={review.id} className="mb-3">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 className="mb-1">{review.user?.username || 'Користувач'}</h6>
                <small className="text-muted">{formatDate(review.createdAt)}</small>
              </div>
              <Badge bg="warning" text="dark">
                ⭐ {review.rating}/10
              </Badge>
            </div>
            <Card.Text>{review.comment}</Card.Text>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

export default ReviewList;