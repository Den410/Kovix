import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { moviesAPI } from '../services/api';
import MovieCard from '../components/MovieCard';

function HistoryPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await moviesAPI.getHistory();
      setMovies(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;

  return (
    <Container className="mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🕰️ Історія переглядів</h2>
        <Button variant="outline-primary" onClick={() => navigate('/movies')}>
            До каталогу
        </Button>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-5 text-muted">
            <h4>Ваша історія порожня 🕸️</h4>
            <p>Ви ще не переглядали сторінки фільмів.</p>
        </div>
      ) : (
        <Row>
          {movies.map(movie => (
            <Col key={movie.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <MovieCard movie={movie} /> 
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default HistoryPage;