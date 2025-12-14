import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Spinner, Button } from 'react-bootstrap';
import { moviesAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import AdminMovieModal from '../components/AdminMovieModal';

function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadMovieData();
  }, [id]);

  const loadMovieData = async () => {
    try {
      setLoading(true);
      const [movieRes, reviewsRes] = await Promise.all([
        moviesAPI.getById(id),
        reviewsAPI.getByMovie(id)
      ]);
      setMovie(movieRes.data);
      setReviews(reviewsRes.data);
    } catch (error) {
      console.error('Error loading movie data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewChange = async () => {
    await loadMovieData();
  };

  const handleDeleteMovie = async () => {
    if (window.confirm(`Ви точно хочете видалити фільм "${movie.title}"? Це незворотна дія!`)) {
      try {
        await moviesAPI.delete(movie.id);
        alert('Фільм успішно видалено');
        navigate('/');
      } catch (error) {
        alert('Помилка при видаленні фільму');
        console.error(error);
      }
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return "success"; 
    if (rating >= 5) return "warning"; 
    return "danger";                   
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!movie) {
    return <Container className="mt-5 text-center"><h2>Фільм не знайдено</h2></Container>;
  }

  return (
    <Container className="mt-4">
      
      {user && isAdmin() && (
        <div className="alert alert-secondary d-flex justify-content-between align-items-center mb-4 shadow-sm">
          <span>🛠️ <strong>Панель адміністратора</strong></span>
          <div>
            <Button variant="primary" size="sm" className="me-2" onClick={() => setShowEditModal(true)}>
              ✏️ Редагувати фільм
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteMovie}>
              🗑️ Видалити фільм
            </Button>
          </div>
        </div>
      )}

      <Row>
        <Col md={4} className="mb-4">
          <img 
            src={movie.posterUrl || 'https://via.placeholder.com/400x600'} 
            alt={movie.title}
            className="img-fluid rounded shadow"
            style={{ width: '100%', objectFit: 'cover' }}
          />
        </Col>

        <Col md={8}>
          <h1 className="mb-3">{movie.title}</h1>
          
          <div className="mb-4">
            <Badge bg={getRatingColor(movie.averageRating)} className="me-2 fs-5 p-2">
              ⭐ {movie.averageRating.toFixed(1)}
            </Badge>
            <Badge bg="secondary" className="me-2 fs-5 p-2">{movie.year}</Badge>
            <Badge bg="info" className="fs-5 p-2">{movie.genre}</Badge>
          </div>
          
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body>
              <h5 className="text-muted mb-3">Про фільм</h5>
              <p className="lead" style={{ fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>
                {movie.description}
              </p>
              <hr />
              <p><strong>Режисер:</strong> {movie.director}</p>
              <p><strong>Всього відгуків:</strong> {movie.totalReviews}</p>
            </Card.Body>
          </Card>

          {movie.trailerUrl && (
            <div className="mb-4">
              <h5>Трейлер</h5>
              <div className="ratio ratio-16x9 shadow-sm rounded overflow-hidden">
                <iframe 
                  src={movie.trailerUrl} 
                  title="Movie Trailer"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <h3 className="mb-4 border-bottom pb-2">Відгуки глядачів</h3>
          
          <ReviewForm movieId={movie.id} onSubmit={handleReviewChange} />
          
          <ReviewList reviews={reviews} onReviewUpdated={handleReviewChange} />
        </Col>
      </Row>

      <AdminMovieModal 
        show={showEditModal} 
        onHide={() => setShowEditModal(false)} 
        movieToEdit={movie} 
        onSuccess={loadMovieData} 
      />

    </Container>
  );
}

export default MovieDetailPage;