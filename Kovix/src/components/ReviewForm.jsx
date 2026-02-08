import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { reviewsAPI } from '../services/api'; 
import { useAuth } from '../contexts/AuthContext';

function ReviewForm({ movieId, onSubmit }) {
  const { user } = useAuth();
  
  const [comment, setComment] = useState(''); 
  const [rating, setRating] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);
    setError('');

    try {
      await reviewsAPI.create({
        movieId,
        comment: comment, 
        rating: parseInt(rating)
      });

      setComment('');
      setRating(10);

      if (onSubmit) {
        await onSubmit(); 
      }

    } catch (err) {
      console.error(err);
      
      if (err.response && err.response.data) {
          setError(typeof err.response.data === 'string' ? err.response.data : 'Помилка збереження');
      } else {
          setError('Не вдалося додати відгук. Спробуйте пізніше.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
        <div className="p-3 mb-4 rounded text-center border" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
            <span className="text-muted">Увійдіть, щоб залишити відгук.</span>
        </div>
    );
  }

  return (
    <div className="mb-4">
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Ваша оцінка</Form.Label>
          <Form.Select 
            value={rating} 
            onChange={(e) => setRating(e.target.value)}
            style={{ 
                maxWidth: '150px',
                backgroundColor: 'var(--bg-main)', 
                color: 'var(--text-main)',
                borderColor: 'var(--border-color)',
                cursor: 'pointer'
            }}
          >
            {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(num => (
              <option key={num} value={num}>{num} ⭐</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Ваш відгук</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Поділіться враженнями..."
            required
            style={{ 
                backgroundColor: 'var(--bg-main)', 
                color: 'var(--text-main)',
                borderColor: 'var(--border-color)'
            }}
          />
        </Form.Group>

        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Відправка...' : 'Залишити відгук'}
        </Button>
      </Form>
    </div>
  );
}

export default ReviewForm;