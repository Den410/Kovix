import { useState, useEffect } from 'react';
import { Container, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { moviesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import MovieCard from '../components/MovieCard';
import SlickSlider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../style/HomePage.css';
import closeIcon from '../assets/closeIcon.png';

const Slider = SlickSlider.default ? SlickSlider.default : SlickSlider;

function HomePage() {
  const { user } = useAuth();
  const [showTrailer, setShowTrailer] = useState(false);
  const [activeTrailer, setActiveTrailer] = useState(null);
  const [newMovies, setNewMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [newRes, topRes, trendingRes] = await Promise.all([
        moviesAPI.getNew(45, 12),
        moviesAPI.getTopRated(),
        moviesAPI.getTrending() 
      ]);
      
      setNewMovies(newRes.data);
      setTopRatedMovies(topRes.data);
      setTrendingMovies(trendingRes.data);
    } catch (error) {
      console.error(error);
      setError('Не вдалося завантажити дані.');
    } finally {
      setLoading(false);
    }
  };

  const sliderSettings = {
    dots: false,       
    infinite: true, 
    speed: 500,          
    slidesToShow: 4, 
    slidesToScroll: 1,  
    autoplay: true,    
    autoplaySpeed: 3000,
    responsive: [      
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } }
    ]
  };

  const trailerSliderSettings = {
    ...sliderSettings,
    slidesToShow: 2,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } }
    ]
  };


  const getYouTubeId = (url) => {
    if (!url) return null;

    try {
      const u = new URL(url);

      if (u.hostname.includes('youtu.be')) {
        return u.pathname.replace('/', '') || null;
      }

      if (u.searchParams.get('v')) {
        return u.searchParams.get('v');
      }

      const parts = u.pathname.split('/');
      const embedIndex = parts.indexOf('embed');
      if (embedIndex !== -1 && parts[embedIndex + 1]) {
        return parts[embedIndex + 1];
      }

        return null;
      } catch {
        return null;
      }
  };

  const getYouTubeEmbedUrl = (trailerUrl) => {
    const id = getYouTubeId(trailerUrl);
    return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : null;
  };

  const openTrailer = (movie) => {
    if (!movie.trailerUrl) return;
    setActiveTrailer(movie.trailerUrl);
    setShowTrailer(true);
  };

  const closeTrailer = () => {
    setShowTrailer(false);
    setActiveTrailer(null);
  };


  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;

  return (
    <Container className="mt-4 pb-5">
      
      {user && user.isBlocked && (
        <Alert variant="danger" className="text-center shadow mb-4">
            <h4 className="alert-heading">⛔ Увага! Ваш акаунт заблоковано адміністратором.</h4>
            <p className="mb-0">Вам обмежено доступ до соціальних функцій (чат, коментарі, друзі).</p>
        </Alert>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      <section className="mb-5 slider-section">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="mb-3 border-start border-4 border-warning ps-2">🔥 Новинки</h3>
            <Link to="/movies" className="text-decoration-none small">Дивитися всі &rarr;</Link>
        </div>
        {newMovies.length > 0 ? (
          <Slider {...sliderSettings}>
            {newMovies.map((movie) => (
              <div key={movie.id} className="p-2"> 
                <MovieCard movie={movie} isNew={true} />
              </div>
            ))}
          </Slider>
        ) : (
          <p className="text-muted">Немає нових фільмів</p>
        )}
      </section>

      <section className="mb-5 slider-section">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="mb-3 border-start border-4 border-success ps-2">⭐ Найкращі за рейтингом</h3>
            <Link to="/movies" className="text-decoration-none small">Дивитися всі &rarr;</Link>
        </div>
        
        {topRatedMovies.length > 0 ? (
          <Slider {...sliderSettings}>
            {topRatedMovies.map((movie) => (
              <div key={movie.id} className="p-2">
                <MovieCard movie={movie} />
              </div>
            ))}
          </Slider>
        ) : (
          <p className="text-muted">Немає рейтингів</p>
        )}
      </section>

      <section className="mb-5 slider-section">
        <div className="d-flex justify-content-between align-items-center mb-3 border-start border-4 border-danger ps-2">
            <h3 className="mb-0">🎬 Найкращі трейлери</h3>
            <Link to="/movies" className="text-decoration-none small">Дивитися всі &rarr;</Link>
        </div>
        
        {trendingMovies.length > 0 ? (
          <Slider {...trailerSliderSettings}>
            {trendingMovies.map((movie) => {
              const embedUrl = getYouTubeEmbedUrl(movie.trailerUrl);

              return (
                <div key={movie.id} className="p-2">
                  <div
                    className="trailer-slide-card"
                    onClick={() => openTrailer(movie)}
                    style={{ cursor: movie.trailerUrl ? 'pointer' : 'default' }}
                  >
                   {embedUrl ? (
                      <div className="position-relative">
                        <div className="ratio ratio-16x9 rounded overflow-hidden shadow-sm">
                          <iframe
                            src={embedUrl}
                            title={`Trailer ${movie.title}`}
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                          />
                        </div>

                        <div
                          className="position-absolute top-0 start-0 w-100 h-100"
                          style={{ background: 'transparent' }}
                        />
                      </div>
                    ) : (
                      <MovieCard movie={movie} disableLink={true} hideMeta={true} />
                    )}

                    <div className="mt-2 small text-truncate trailer-title">
                      {movie.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </Slider>
        ) : (
          <p className="text-muted">Трейлери відсутні</p>
        )}
      </section>

      <div 
        className="text-center mt-5 p-5 rounded shadow-sm"
        style={{
            backgroundColor: 'var(--bg-card)', 
            color: 'var(--text-main)',         
            border: '1px solid var(--border-color)'
        }}
      >
        <h2>🎥 Шукаєте щось конкретне?</h2>
        <p className="lead" style={{ color: 'var(--text-secondary)' }}>Перегляньте повний каталог фільмів з пошуком.</p>
        <Link to="/movies">
          <Button variant="primary" size="lg">Відкрити каталог фільмів</Button>
        </Link>
      </div>
      
      <Modal
        show={showTrailer}
        onHide={closeTrailer}
        size="lg"
        centered
        contentClassName="bg-black border-0"
      >
        <Modal.Body className="p-0 position-relative">
          <button
            onClick={closeTrailer}
            className="trailer-close-btn"
          >
            <img src={closeIcon} alt="Close" />
          </button>

          {activeTrailer && (
            <div className="ratio ratio-16x9">
              <iframe
                src={activeTrailer}
                title="Movie Trailer"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default HomePage;