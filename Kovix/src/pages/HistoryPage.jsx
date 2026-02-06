import { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Button, Card, ButtonGroup, Badge } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { moviesAPI } from '../services/api';
import MovieCard from '../components/MovieCard';
import { FiGrid, FiList } from 'react-icons/fi';

import defaultPosterImg from '../assets/NotFoundPoster.webp'; 

const API_BASE_URL = 'http://localhost:5096';
const PLACEHOLDER_IMG = defaultPosterImg;

function getPoster(movie) {
  const poster =
    movie.posterUrl ||
    movie.posterPath ||
    movie.poster ||
    movie.image ||
    movie.cover ||
    movie.posterImage;

  if (!poster) return PLACEHOLDER_IMG;

  return poster.startsWith('http')
    ? poster
    : `${API_BASE_URL}${poster}`;
}


function HistoryPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); 
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
    const savedMode = localStorage.getItem('historyViewMode');
    if (savedMode) setViewMode(savedMode);
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

  const handleViewChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('historyViewMode', mode);
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h2 className="mb-0">🕰️ Історія переглядів</h2>

        <div className="d-flex gap-3">
          <ButtonGroup>
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline-secondary'}
              onClick={() => handleViewChange('grid')}
            >
              <FiGrid />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline-secondary'}
              onClick={() => handleViewChange('list')}
            >
              <FiList />
            </Button>
          </ButtonGroup>

          <Button variant="outline-primary" onClick={() => navigate('/movies')}>
            До каталогу
          </Button>
        </div>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-5 rounded border">
          <h4>Ваша історія порожня 🕸️</h4>
          <p>Ви ще не переглядали сторінки фільмів.</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' && (
            <Row>
              {movies.map(movie => (
                <Col key={movie.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                  <MovieCard movie={movie} />
                </Col>
              ))}
            </Row>
          )}

          {viewMode === 'list' && (
            <div className="d-flex flex-column gap-3">
              {movies.map(movie => (
                <Card
                  key={movie.id}
                  className="shadow-sm border-0 overflow-hidden flex-row"
                  style={{ height: '180px' }}
                >
                  <div style={{ width: '120px', minWidth: '120px' }}>
                    <img
                      src={getPoster(movie)}
                      alt={movie.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => (e.target.src = PLACEHOLDER_IMG)}
                    />
                  </div>

                  <Card.Body className="d-flex flex-column justify-content-center py-2 px-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <h5 className="mb-1 fw-bold text-truncate pe-2">
                        <Link
                          to={`/movie/${movie.id}`}
                          className="text-decoration-none text-reset stretched-link"
                        >
                          {movie.title}
                        </Link>
                      </h5>

                      {movie.rating > 0 && (
                        <Badge bg="warning" text="dark">
                          ★ {movie.rating}
                        </Badge>
                      )}
                    </div>

                    <div className="text-muted small mb-2">
                      {movie.year} {movie.genre ? `• ${movie.genre}` : ''}
                    </div>

                    <p
                      className="text-secondary small mb-0"
                      style={{
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: '1.4em',
                      }}
                    >
                      {movie.description || 'Опис відсутній.'}
                    </p>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </Container>
  );
}

export default HistoryPage;