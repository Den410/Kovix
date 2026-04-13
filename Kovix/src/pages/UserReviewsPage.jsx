import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { reviewsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import defaultPosterImg from '../assets/NotFoundPoster.webp';
import { API_BASE_URL } from '../utils/apiConfig';

function UserReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 10, comment: '' });

  useEffect(() => {
    if (user) {
      loadReviews();
    }
  }, [user]);

  const loadReviews = async () => {
    try {
      const response = await reviewsAPI.getByUser(user.id);
      setReviews(response.data);
    } catch (error) {
      console.error("Помилка завантаження відгуків:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Видалити цей відгук?')) {
      try {
        await reviewsAPI.delete(reviewId);
        setReviews(prev => prev.filter(r => r.id !== reviewId));
      } catch (error) {
        alert('Помилка видалення');
      }
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
        comment: editForm.comment,
      });
      
      setReviews(prev => prev.map(r => 
        r.id === reviewId 
          ? { ...r, rating: parseInt(editForm.rating), comment: editForm.comment } 
          : r
      ));
      
      setEditingId(null);
    } catch (error) {
      alert('Помилка при оновленні: ' + (error.response?.data || error.message));
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getPosterUrl = (url) => {
      if (!url) return defaultPosterImg;
      if (url.startsWith('http')) return url;
      
      const cleanPath = url.replace(/\\/g, '/');
      const separator = cleanPath.startsWith('/') ? '' : '/';
      return `${API_BASE_URL}${separator}${cleanPath}`;
  };

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;

  if (!user) return <Container className="mt-5 text-center"><h2>Увійдіть, щоб бачити свої відгуки</h2></Container>;

  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-white">Мої відгуки та рецензії</h2>

      {reviews.length === 0 ? (
        <div className="text-center p-5 rounded border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
          <h4>Ви ще не залишили жодного відгуку.</h4>
          <Link to="/" className="btn btn-primary mt-3">Знайти цікавий фільм</Link>
        </div>
      ) : (
        <Row>
          {reviews.map((review) => {
            const posterSrc = getPosterUrl(review.moviePosterUrl || review.posterUrl);
            const isEditing = editingId === review.id;

            return (
            <Col xs={12} key={review.id} className="mb-3">
              <Card 
                className="shadow-sm"
                style={{ 
                    backgroundColor: 'var(--bg-card)', 
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)'
                }}
              >
                <Card.Body>
                  <Row>
                    <Col md={2} sm={3} xs={4}>
                        <Link to={`/movie/${review.movieId}`}>
                            <div style={{ width: "120px" }}>
                                <img
                                    src={posterSrc}
                                    alt={review.movieTitle}
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </Link>
                    </Col>

                    <Col md={10} sm={9} xs={8}>
                        <div className="d-flex justify-content-between align-items-start">
                            <div>
                                <Link 
                                    to={`/movie/${review.movieId}`} 
                                    className="h5 text-decoration-none fw-bold hover-primary"
                                    style={{ color: 'var(--text-main)' }}
                                >
                                    {review.movieTitle || `Фільм #${review.movieId}`}
                                </Link>
                                <div className="text-muted small mt-1">
                                    {formatDate(review.createdAt)}
                                </div>
                            </div>
                            
                            {!isEditing && (
                                <Badge 
                                    bg={review.rating >= 8 ? 'success' : review.rating >= 5 ? 'warning' : 'danger'}
                                    className="fs-6"
                                >
                                    ⭐ {review.rating}/10
                                </Badge>
                            )}
                        </div>

                        <hr style={{ borderColor: 'var(--border-color)' }} />

                        {isEditing ? (
                            <div className="mt-3 p-3 rounded" style={{ border: '1px solid var(--border-color)' }}>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                    Змінити оцінку: <strong>{editForm.rating}/10</strong>
                                    </Form.Label>
                                    <Form.Range
                                    min="1"
                                    max="10"
                                    value={editForm.rating}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, rating: e.target.value })
                                    }
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={editForm.comment}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, comment: e.target.value })
                                    }
                                    style={{ 
                                        backgroundColor: 'var(--bg-main)', 
                                        color: 'var(--text-main)',
                                        borderColor: 'var(--border-color)'
                                    }}
                                    />
                                </Form.Group>

                                <div className="d-flex gap-2">
                                    <Button size="sm" variant="success" onClick={() => handleUpdate(review.id)}>
                                    Зберегти
                                    </Button>
                                    <Button size="sm" variant="secondary" onClick={cancelEditing}>
                                    Скасувати
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p style={{ whiteSpace: 'pre-wrap' }}>
                                    {review.comment}
                                </p>

                                <div className="d-flex justify-content-end mt-2 gap-2">
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm" 
                                        onClick={() => startEditing(review)}
                                    >
                                        ✏️ Редагувати
                                    </Button>
                                    <Button 
                                        variant="outline-danger" 
                                        size="sm" 
                                        onClick={() => handleDelete(review.id)}
                                    >
                                        🗑️ Видалити
                                    </Button>
                                </div>
                            </>
                        )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          );
         })}
        </Row>
      )}
    </Container>
  );
}

export default UserReviewsPage;