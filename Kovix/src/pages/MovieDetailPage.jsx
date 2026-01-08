import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Spinner, Button } from 'react-bootstrap';
import { moviesAPI, reviewsAPI, watchlistAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import AdminMovieModal from '../components/AdminMovieModal';
import '../style/App.css'; 

const LIKE_ID = 6;
const DISLIKE_ID = 7;

const EMOTIONS = [
  { id: 1, label: 'Супер', icon: '❤️', key: 'Love' },
  { id: 2, label: 'Смішно', icon: '😂', key: 'Funny' },
  { id: 3, label: 'Вау', icon: '😲', key: 'Wow' },
  { id: 4, label: 'Сумно', icon: '😢', key: 'Sad' },
  { id: 5, label: 'Злить', icon: '😡', key: 'Angry' },
];

const WATCH_STATUSES = [
  { id: 0, label: '+ Додати в список' },
  { id: 1, label: '📅 Заплановано' },
  { id: 2, label: '👀 Переглядаю' },
  { id: 3, label: '✅ Переглянуто' },
  { id: 4, label: '❌ Закинуто' },
];

function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [watchStatus, setWatchStatus] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showReactionPopup, setShowReactionPopup] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    loadMovieData();
  }, [id]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowReactionPopup(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadMovieData = async () => {
    try {
      const [movieRes, reviewsRes] = await Promise.all([
        moviesAPI.getById(id),
        reviewsAPI.getByMovie(id)
      ]);
      setMovie(movieRes.data);
      setReviews(reviewsRes.data);

      if (user) {
        try {
          const watchlistRes = await watchlistAPI.getStatus(id);
          setWatchStatus(watchlistRes.data.status);
          setIsFavorite(watchlistRes.data.isFavorite);
        } catch (err) {
          console.error("Помилка завантаження списку", err);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewChange = async () => {
    const reviewsRes = await reviewsAPI.getByMovie(id);
    setReviews(reviewsRes.data);
  };

  const handleReaction = async (typeId) => {
    if (!user) return alert("Будь ласка, увійдіть, щоб оцінити фільм!");
    try {
      setShowReactionPopup(false);
      await moviesAPI.react(id, typeId);
      const movieRes = await moviesAPI.getById(id);
      setMovie(movieRes.data);
    } catch (error) {
      console.error("Помилка реакції:", error);
    }
  };

  const handleWatchlistUpdate = async (newStatus, newFavorite) => {
    if (!user) return alert("Будь ласка, увійдіть!");

    const prevStatus = watchStatus;
    const prevFav = isFavorite;

    setWatchStatus(parseInt(newStatus));
    setIsFavorite(newFavorite);

    try {
      await watchlistAPI.update(id, {
        status: parseInt(newStatus),
        isFavorite: newFavorite
      });
    } catch (error) {
      setWatchStatus(prevStatus);
      setIsFavorite(prevFav);
      console.error(error);
    }
  };

  const handleDeleteMovie = async () => {
    if (window.confirm(`Видалити фільм "${movie.title}"?`)) {
      try {
        await moviesAPI.delete(movie.id);
        navigate('/');
      } catch (error) { alert('Помилка видалення'); }
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return "success"; 
    if (rating >= 5) return "warning"; 
    return "danger";                   
  };

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
  if (!movie) return <Container className="mt-5 text-center"><h2>Фільм не знайдено</h2></Container>;

  const likesCount = movie.reactionCounts['Like'] || 0;
  const dislikesCount = movie.reactionCounts['Dislike'] || 0; 

  return (
    <Container className="mt-4">
      {user && isAdmin() && (
        <div className="alert alert-secondary d-flex justify-content-between align-items-center mb-4 shadow-sm">
          <span>🛠️ Адмін-панель</span>
          <div>
            <Button variant="primary" size="sm" className="me-2" onClick={() => setShowEditModal(true)}>✏️ Редагувати</Button>
            <Button variant="danger" size="sm" onClick={handleDeleteMovie}>🗑️ Видалити</Button>
          </div>
        </div>
      )}

      <Row>
        <Col md={4} className="mb-4">
          <img src={movie.posterUrl} alt={movie.title} className="img-fluid rounded shadow w-100" style={{objectFit: 'cover'}} />
        </Col>

        <Col md={8}>
          <h1 className="mb-3">{movie.title}</h1>
          <div className="mb-4">
            <Badge bg={getRatingColor(movie.averageRating)} className="me-2 fs-5 p-2">⭐ {movie.averageRating.toFixed(1)}</Badge>
            <Badge bg="secondary" className="me-2 fs-5 p-2">{movie.year}</Badge>
            <Badge bg="info" className="fs-5 p-2">{movie.genre}</Badge>
          </div>
          <p className="lead">{movie.description}</p>
          <hr />
          
          {movie.trailerUrl && (
            <div className="mb-4">
              <div className="ratio ratio-16x9 shadow-sm rounded overflow-hidden">
                <iframe src={movie.trailerUrl} title="Trailer" allowFullScreen></iframe>
              </div>
            </div>
          )}

          <div className="movie-actions-bar shadow-sm mb-5">
            
            <div className="like-dislike-group">
                <button 
                    className={`action-btn ${movie.currentUserVote === LIKE_ID ? 'active' : ''}`}
                    onClick={() => handleReaction(LIKE_ID)}
                    title="Мені подобається"
                >
                    👍 <span className="ms-1">{likesCount > 0 ? likesCount : 'Лайк'}</span>
                </button>
                <div style={{width: 1, height: 20, background: '#ccc'}}></div> 
                <button 
                    className={`action-btn ${movie.currentUserVote === DISLIKE_ID ? 'active-dislike' : ''}`}
                    onClick={() => handleReaction(DISLIKE_ID)}
                    title="Не подобається"
                >
                    👎 <span className="ms-1">{dislikesCount > 0 ? dislikesCount : ''}</span>
                </button>
            </div>

            <div className="vertical-divider"></div>

            <div className="watchlist-group">
                <select 
                  className="status-select"
                  value={watchStatus}
                  onChange={(e) => handleWatchlistUpdate(e.target.value, isFavorite)}
                >
                  {WATCH_STATUSES.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>

                <button 
                  className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                  onClick={() => handleWatchlistUpdate(watchStatus, !isFavorite)}
                  title={isFavorite ? "Видалити з улюблених" : "Додати в улюблене"}
                >
                  ★
                </button>
            </div>

            <div className="vertical-divider"></div>

            <div className="reaction-btn-wrapper" ref={popupRef}>
               {(() => {
                 const activeEmotion = EMOTIONS.find(e => e.id === movie.currentUserEmotion);
                 return (
                   <button 
                      className="reaction-toggle-btn"
                      onClick={() => setShowReactionPopup(!showReactionPopup)}
                      style={activeEmotion ? {color: '#e2264d', background: 'rgba(226, 38, 77, 0.1)'} : {}}
                   >
                      {activeEmotion 
                        ? <>{activeEmotion.icon} {activeEmotion.label}</> 
                        : <>☺ Реакція</>
                      }
                   </button>
                 );
               })()}

               {showReactionPopup && (
                 <div className="reaction-popup">
                    {EMOTIONS.map((emo) => (
                      <div key={emo.id} className="reaction-option" onClick={() => handleReaction(emo.id)}>
                        <span className="reaction-option-icon">{emo.icon}</span>
                        <span className="reaction-option-label">{emo.label}</span>
                      </div>
                    ))}
                 </div>
               )}
            </div>

            <div className="reactions-list">
                {Object.entries(movie.reactionCounts).map(([key, count]) => {
                    if (key === 'Like' || key === 'Dislike' || count === 0) return null;
                    const emo = EMOTIONS.find(e => e.key === key);
                    if (!emo) return null;
                    const isActive = movie.currentUserEmotion === emo.id;

                    return (
                        <div 
                           key={key} 
                           onClick={() => handleReaction(emo.id)}
                           className={`reaction-badge ${isActive ? 'active' : ''}`} 
                           title={emo.label}
                        >
                            <span style={{fontSize: '18px'}}>{emo.icon}</span>
                            <span className="reaction-count">{count}</span>
                        </div>
                    );
                })}
            </div>

          </div>

        </Col>
      </Row>

      <Row>
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