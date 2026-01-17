import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Spinner, Row, Col, Badge, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI, reviewsAPI, friendsAPI, blocksAPI } from '../services/api';
import { useFriends } from '../contexts/FriendsContext';

const API_BASE_URL = 'http://localhost:5096';

function UserPublicProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const { refreshRequests } = useFriends();
  const [friendStatus, setFriendStatus] = useState('None');
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileRes, reviewsRes] = await Promise.all([
        usersAPI.getPublicProfile(id),
        reviewsAPI.getByUser(id)
      ]);
      
      setUserProfile(profileRes.data);
      setReviews(reviewsRes.data);

      if (user && user.id !== parseInt(id)) {
         const statusRes = await friendsAPI.checkStatus(id);
         setFriendStatus(statusRes.data.status);

         const blockRes = await blocksAPI.check(id);
         setIsBlocked(blockRes.data.isBlocked);
      }

    } catch (error) {
      console.error("Помилка:", error);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

const handleFriendAction = async () => {
    try {
        if (friendStatus === 'None') {
            await friendsAPI.add(id);
            setFriendStatus('PendingOutgoing');
        } else if (friendStatus === 'PendingOutgoing') {
            await friendsAPI.remove(id);
            setFriendStatus('None');
        } else if (friendStatus === 'Friend') {
            if(!window.confirm("Видалити з друзів?")) return;
            await friendsAPI.remove(id);
            setFriendStatus('None');
        }
        
        if (refreshRequests) refreshRequests(); 
        
    } catch (error) {
        console.error("Деталі помилки:", error);
        if (error.response && error.response.status === 400) {
            alert(error.response.data);
        } else {
            alert("Помилка дії з друзями");
        }
        loadData();
    }
  };

  const handleBlockAction = async () => {
      if (isBlocked) {
          if (!window.confirm("Розблокувати цього користувача?")) return;
          try {
              await blocksAPI.unblock(id);
              setIsBlocked(false);
          } catch (e) { alert("Помилка розблокування"); }
      } else {
          if (!window.confirm("Заблокувати користувача? Ви більше не будете бачити його активність, а він буде видалений з друзів.")) return;
          try {
              await blocksAPI.block(id);
              setIsBlocked(true);
              setFriendStatus('None');
          } catch (e) { alert("Помилка блокування"); }
      }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
  if (!userProfile) return <Container className="mt-5 text-center"><h3>Користувача не знайдено</h3></Container>;

  return (
    <Container className="mt-4 mb-5">
      <Card className="shadow-sm border-0 mb-4 p-5 text-center">
        <div className="d-flex justify-content-center mb-3">
          {userProfile.avatarUrl ? (
            <img
              src={`${API_BASE_URL}${userProfile.avatarUrl}`}
              alt={userProfile.username}
              className="rounded-circle border"
              style={{ width: 120, height: 120, objectFit: 'cover' }}
            />
          ) : (
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
              style={{ width: 120, height: 120, fontSize: '3.5rem' }}
            >
              {userProfile.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <h2 className="fw-bold mb-1">{userProfile.username}</h2>
        
        {user && user.id !== parseInt(id) && (
            <div className="mt-3 d-flex flex-column align-items-center gap-2">
                
                {isBlocked ? (
                    <Button variant="dark" onClick={handleBlockAction}>🔓 Розблокувати</Button>
                ) : (
                    <>
                        {friendStatus === 'None' && (
                            <Button variant="primary" onClick={handleFriendAction}>➕ Додати в друзі</Button>
                        )}
                        {friendStatus === 'PendingOutgoing' && (
                            <Button variant="secondary" onClick={handleFriendAction}>🕒 Запит надіслано (Скасувати)</Button>
                        )}
                        {friendStatus === 'PendingIncoming' && (
                            <Badge bg="info" className="p-2 fs-6">
                                📩 Вам надіслано запит (Перевірте сповіщення 🔔)
                            </Badge>
                        )}
                        {friendStatus === 'Friend' && (
                            <Button variant="outline-danger" onClick={handleFriendAction}>🗑️ Видалити з друзів</Button>
                        )}

                        <Button 
                            variant="link" 
                            className="text-danger text-decoration-none mt-1" 
                            size="sm"
                            onClick={handleBlockAction}
                            style={{ fontSize: '0.9rem' }}
                        >
                            🚫 Заблокувати
                        </Button>
                    </>
                )}
            </div>
        )}

        <p className="mb-0 mt-3" style={{ opacity: 0.7 }}>
          На сайті з {new Date(userProfile.createdAt).toLocaleDateString('uk-UA')}
        </p>
      </Card>

      {isBlocked ? (
          <div className="text-center p-5 text-muted border rounded" style={{ backgroundColor: 'var(--bg-card)' }}>
              <h4>🚫 Користувач заблокований</h4>
              <p>Ви обмежили доступ до контенту цього користувача.</p>
          </div>
      ) : (
          <>
            <h4 className="mb-4 ps-2 border-start border-4 border-primary">Відгуки користувача ({reviews.length})</h4>

            {reviews.length === 0 ? (
                <p style={{ opacity: 0.7 }}>Цей користувач ще не залишив жодного відгуку.</p>
            ) : (
                <Row>
                    {reviews.map(review => (
                        <Col md={12} key={review.id} className="mb-3">
                            <Card className="shadow-sm border-0">
                                <Card.Body>
                                    <div className="d-flex gap-3">
                                        <Link to={`/movie/${review.movieId}`} className="flex-shrink-0">
                                        <img 
                                            src={review.moviePosterUrl || 'https://via.placeholder.com/60x90'} 
                                            alt="Poster" 
                                            className="rounded"
                                            style={{width: 60, height: 90, objectFit: 'cover'}}
                                        />
                                        </Link>

                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6 className="mb-1">
                                                        <Link to={`/movie/${review.movieId}`} className="text-decoration-none fw-bold" style={{ color: 'var(--text-main)' }}>
                                                            {review.movieTitle || 'Фільм'}
                                                        </Link>
                                                    </h6>
                                                    <small style={{ opacity: 0.6 }}>{formatDate(review.createdAt)}</small>
                                                </div>
                                                <Badge bg={review.rating >= 8 ? 'success' : review.rating >= 5 ? 'warning' : 'danger'}>
                                                    ⭐ {review.rating}/10
                                                </Badge>
                                            </div>
                                            
                                            <p className="mt-2 mb-2" style={{whiteSpace: 'pre-wrap', opacity: 0.9}}>
                                                {review.comment}
                                            </p>

                                            <div className="d-flex gap-2 small" style={{ opacity: 0.7 }}>
                                                <span>👍 {review.likesCount}</span>
                                                <span>👎 {review.dislikesCount}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
          </>
      )}
    </Container>
  );
}

export default UserPublicProfilePage;