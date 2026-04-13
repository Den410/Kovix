import { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert, Badge, Pagination, Button, Card } from 'react-bootstrap';
import { moviesAPI } from '../services/api';
import MovieCard from '../components/MovieCard';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import defaultPosterImg from '../assets/NotFoundPoster.webp';
import { API_BASE_URL } from '../utils/apiConfig';
const PLACEHOLDER_IMG = defaultPosterImg;

function TopMoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); 
  
  const pageSize = 12;

  const { themeMode } = useTheme();
  const isDark = themeMode === 'dark';

  useEffect(() => {
    loadTopMovies();
    window.scrollTo(0, 0);
  }, [page]);

  const loadTopMovies = async () => {
    setLoading(true);
    try {
      const response = await moviesAPI.getAll(page, pageSize, '', '', '', 'ratingDesc');
      setMovies(response.data.items || []);
      setTotalPages(Math.ceil(response.data.totalCount / pageSize));
    } catch (error) {
      console.error("Помилка завантаження топу:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankStyle = (index) => {
    const rank = (page - 1) * pageSize + index + 1;
    
    if (rank === 1) return { bg: 'warning', text: '🥇', color: '#000', border: '2px solid #FFD700', rank };
    if (rank === 2) return { bg: 'secondary', text: '🥈', color: '#fff', border: '2px solid #C0C0C0', rank };
    if (rank === 3) return { bg: 'danger', text: '🥉', color: '#fff', border: '2px solid #CD7F32', rank };
    
    return { 
        bg: isDark ? 'dark' : 'light', 
        text: `#${rank}`, 
        color: isDark ? '#fff' : '#000', 
        border: '1px solid gray', 
        rank 
    };
  };

  const renderListView = (movie, index) => {
    const rankStyle = getRankStyle(index);

    let imageUrl = PLACEHOLDER_IMG;
    let rawPoster = movie.posterUrl || movie.PosterUrl;
    if (rawPoster) {
        rawPoster = rawPoster.replace(/\\/g, '/');
        if (rawPoster.startsWith('http')) {
            imageUrl = rawPoster;
        } else {
            const separator = rawPoster.startsWith('/') ? '' : '/';
            imageUrl = `${API_BASE_URL}${separator}${rawPoster}`;
        }
    }

    const ratingValue = movie.averageRating || movie.rating || 0;

    return (
        <Col key={movie.id} xs={12} className="mb-3">
          <Card className="flex-row shadow-sm h-100 overflow-hidden" style={{ minHeight: '180px' }}>
            
            <div 
                className="d-flex align-items-center justify-content-center p-2"
                style={{ 
                    width: '60px', 
                    minWidth: '60px',
                    backgroundColor: isDark ? '#212529' : '#f8f9fa',
                    borderRight: '1px solid #dee2e6',
                    fontSize: rankStyle.rank <= 3 ? '2rem' : '1.2rem',
                    fontWeight: 'bold',
                    color: rankStyle.color
                }}
            >
                {rankStyle.rank <= 3 ? rankStyle.text : rankStyle.rank}
            </div>

            <div style={{ width: '120px', minWidth: '120px', position: 'relative', backgroundColor: '#eee' }}>
              <img 
                src={imageUrl} 
                alt={movie.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={(e) => { if (e.target.src !== PLACEHOLDER_IMG) e.target.src = PLACEHOLDER_IMG; }} 
              />
            </div>
            
            <Card.Body className="d-flex flex-column py-2">
              <div className="d-flex justify-content-between align-items-start">
                 <div>
                    <h5 className="mb-1">
                        <Link to={`/movie/${movie.id}`} className="text-decoration-none text-dark fw-bold">
                            {movie.title}
                        </Link>
                    </h5>
                    {movie.director && <small className="text-muted d-block">Режисер: {movie.director}</small>}
                 </div>
                 
                 <Badge bg="success" text="white" className="fs-6 shadow-sm">
                    ★ {ratingValue.toFixed(1)}
                 </Badge>
              </div>
              
              <div className="mt-2 mb-2">
                <Badge bg="secondary" className="me-2">{movie.year}</Badge>
                <span className="text-muted small">
                    {Array.isArray(movie.genres) ? movie.genres.join(', ') : movie.genres || movie.genre}
                </span>
              </div>

              <Card.Text className="text-muted small flex-grow-1" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
              }}>
                {movie.description || "Опис відсутній..."}
              </Card.Text>

              <div className="mt-auto text-end">
                <Link to={`/movie/${movie.id}`}>
                     <Button variant="outline-primary" size="sm">Детальніше</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
    );
  };

  let paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item key={number} active={number === page} onClick={() => setPage(number)}>
        {number}
      </Pagination.Item>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      <div className="text-center mb-4">
        <h1 className="fw-bold display-5">🏆 Топ найкращих фільмів</h1>
        <p className={`lead ${isDark ? 'text-secondary' : 'text-muted'}`}>
           Рейтинг базується на оцінках наших глядачів
        </p>
      </div>

      <div className="d-flex justify-content-end mb-4">
            <div className="btn-group">
                <Button 
                    variant={viewMode === 'grid' ? (isDark ? 'light' : 'secondary') : (isDark ? 'outline-light' : 'outline-secondary')} 
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    title="Плитка"
                >
                    <i className="bi bi-grid-fill"></i> 
                    <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>⊞</span> 
                </Button>
                <Button 
                    variant={viewMode === 'list' ? (isDark ? 'light' : 'secondary') : (isDark ? 'outline-light' : 'outline-secondary')} 
                    size="sm"
                    onClick={() => setViewMode('list')}
                    title="Список"
                >
                     <i className="bi bi-list"></i>
                     <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>☰</span>
                </Button>
            </div>
      </div>

      {loading ? (
        <div className="text-center mt-5"><Spinner animation="border" variant="warning" /></div>
      ) : (
        <>
          <Row>
            {movies.map((movie, index) => {
              if (viewMode === 'list') {
                  return renderListView(movie, index);
              }

              const rankStyle = getRankStyle(index);
              return (
                <Col key={movie.id} xs={12} sm={6} md={4} lg={3} className="mb-5 position-relative">
                  <div 
                    className="position-absolute shadow"
                    style={{
                        zIndex: 10,
                        top: '-15px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: rankStyle.bg === 'warning' ? '#FFD700' : (rankStyle.bg === 'secondary' ? '#C0C0C0' : (rankStyle.bg === 'danger' ? '#CD7F32' : (isDark ? '#212529' : '#f8f9fa'))),
                        color: rankStyle.color,
                        border: rankStyle.border,
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                    }}
                  >
                    {rankStyle.text}
                  </div>

                  <div style={{ paddingTop: '20px' }}>
                     <MovieCard movie={movie} />
                  </div>
                </Col>
              );
            })}
          </Row>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>{paginationItems}</Pagination>
            </div>
          )}
        </>
      )}
    </Container>
  );
}

export default TopMoviesPage;