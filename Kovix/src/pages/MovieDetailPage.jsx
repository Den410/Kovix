import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Spinner } from 'react-bootstrap';
import { moviesAPI, reviewsAPI } from '../services/api';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';

function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleReviewSubmit = async () => {
    await loadMovieData();
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!movie) {
    return <Container className="mt-5"><h2>Фільм не знайдено</h2></Container>;
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col md={4}>
          <img 
            src={movie.posterUrl || 'https://via.placeholder.com/400x600'} 
            alt={movie.title}
            className="img-fluid rounded shadow"
          />
        </Col>
        <Col md={8}>
          <h1>{movie.title}</h1>
          <div className="mb-3">
            <Badge bg="warning" className="me-2">
              ⭐ {movie.averageRating.toFixed(1)}
            </Badge>
            <Badge bg="secondary" className="me-2">{movie.year}</Badge>
            <Badge bg="info">{movie.genre}</Badge>
          </div>
          
          <Card className="mb-3">
            <Card.Body>
              <h5>Опис</h5>
              <p>{movie.description}</p>
              <p><strong>Режисер:</strong> {movie.director}</p>
              <p><strong>Всього відгуків:</strong> {movie.totalReviews}</p>
            </Card.Body>
          </Card>

          {movie.trailerUrl && (
            <Card className="mb-3">
              <Card.Body>
                <h5>Трейлер</h5>
                <div className="ratio ratio-16x9">
                  <iframe 
                    src={movie.trailerUrl} 
                    title="Movie Trailer"
                    allowFullScreen
                  ></iframe>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      <Row className="mt-5">
        <Col>
          <h3 className="mb-4">Відгуки</h3>
          <ReviewForm movieId={movie.id} onSubmit={handleReviewSubmit} />
          <ReviewList reviews={reviews} />
        </Col>
      </Row>
    </Container>
  );
}

export default MovieDetailPage;