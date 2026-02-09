import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Spinner, Row, Col, Badge, Button, Modal, ListGroup } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI, reviewsAPI, friendsAPI } from '../services/api'; 
import { useFriends } from '../contexts/FriendsContext';
import { formatLastSeen } from '../utils/dateUtils';
import defaultPosterImg from '../assets/NotFoundPoster.webp';

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
  const [isOnline, setIsOnline] = useState(false);
  const [lastActive, setLastActive] = useState(null);

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalUsers, setModalUsers] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const isAdmin = user?.role === 'Admin'; 

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
      
      const p = profileRes.data;
      setUserProfile(p);
      setIsBlocked(p.isBlocked); 
      setIsOnline(p.isOnline);
      setLastActive(p.lastActive);
      
      setFollowersCount(p.followersCount || 0);
      setFollowingCount(p.followingCount || 0);
      setIsFollowing(p.isFollowingByMe || false);

      setReviews(reviewsRes.data);

      if (user && user.id !== parseInt(id)) {
         const statusRes = await friendsAPI.checkStatus(id);
         setFriendStatus(statusRes.data.status);
      }

    } catch (error) {
      console.error("Помилка:", error);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url, fallback = defaultPosterImg) => {
      if (!url) return fallback;
      if (url.startsWith('http')) return url;
      
      const cleanPath = url.replace(/\\/g, '/');
      const separator = cleanPath.startsWith('/') ? '' : '/';
      return `${API_BASE_URL}${separator}${cleanPath}`;
  };

  const handleFollowToggle = async () => {
      if (!user) return alert("Увійдіть, щоб підписатися");
      try {
          if (isFollowing) {
              await usersAPI.unfollow(id);
              setIsFollowing(false);
              setFollowersCount(prev => prev - 1);
          } else {
              await usersAPI.follow(id);
              setIsFollowing(true);
              setFollowersCount(prev => prev + 1);
          }
      } catch (error) {
          console.error(error);
          const errorMsg = error.response?.data || "Не вдалося змінити підписку";
          alert(errorMsg);
          loadData(); 
      }
  };

  const openUsersModal = async (type) => {
      setModalTitle(type === 'followers' ? 'Підписники' : 'Підписки');
      setShowModal(true);
      setModalLoading(true);
      setModalUsers([]);

      try {
          const res = type === 'followers' 
            ? await usersAPI.getFollowers(id) 
            : await usersAPI.getFollowing(id);
          setModalUsers(res.data);
      } catch (error) {
          console.error(error);
      } finally {
          setModalLoading(false);
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
        console.error(error);
        loadData();
    }
  };

  const handleAccept = async () => {
      try {
          await friendsAPI.accept(id); 
          setFriendStatus('Friend');
          
          if (refreshRequests) refreshRequests();
      } catch (e) { 
          console.error(e); 
          alert("Не вдалося прийняти запит");
      }
  };

  const handleReject = async () => {
      try {
          await friendsAPI.remove(id); 
          setFriendStatus('None');
          
          if (refreshRequests) refreshRequests();
      } catch (e) { 
          console.error(e); 
          alert("Не вдалося відхилити запит");
      }
  };

  const handleBlockAction = async () => {
    if (!isAdmin) return;
    if (!window.confirm("Змінити статус блокування?")) return;

    try {
        await usersAPI.toggleBlock(id);
        await loadData();
    } catch (e) {
        alert("Помилка блокування");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
  if (!userProfile) return <Container className="mt-5 text-center"><h3>Користувача не знайдено</h3></Container>;

  const isMe = user && user.id === parseInt(id);

  return (
    <Container className="mt-4 mb-5">
      <Card 
        className="shadow-sm border-0 mb-4 p-4 text-center"
        style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
      >
        <div className="d-flex justify-content-center mb-3">
          {userProfile.avatarUrl ? (
            <img
              src={getImageUrl(userProfile.avatarUrl)}
              alt={userProfile.username}
              className="rounded-circle border"
              style={{ width: 120, height: 120, objectFit: 'cover', borderColor: 'var(--border-color)' }}
              onError={(e) => {e.target.src = 'https://via.placeholder.com/120'}}
            />
          ) : (
            <div
              className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
              style={{ 
                  width: 120, height: 120, fontSize: '3.5rem',
                  backgroundColor: 'var(--primary-color)',
                  color: 'var(--btn-text)'
              }}
            >
              {userProfile.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <h2 className="fw-bold mb-1">{userProfile.username}</h2>

        <div className="small fw-bold mb-3" style={{ color: isOnline ? '#57cbde' : 'var(--text-secondary)' }}>
          {formatLastSeen(lastActive, isOnline)}
        </div>

        <div className="d-flex justify-content-center gap-4 mb-4">
            <div 
                className="text-center" 
                style={{ cursor: 'pointer' }}
                onClick={() => openUsersModal('followers')}
            >
                <div className="fw-bold fs-5">{followersCount}</div>
                <div className="small" style={{ color: 'var(--text-secondary)' }}>Підписників</div>
            </div>
            <div 
                className="text-center" 
                style={{ cursor: 'pointer' }}
                onClick={() => openUsersModal('following')}
            >
                <div className="fw-bold fs-5">{followingCount}</div>
                <div className="small" style={{ color: 'var(--text-secondary)' }}>Підписок</div>
            </div>
        </div>
        
        {!isMe && user && (
            <div className="d-flex justify-content-center gap-2 mb-3 flex-wrap">
                {!isBlocked && (
                    <Button 
                        variant={isFollowing ? "outline-secondary" : "primary"}
                        onClick={handleFollowToggle}
                        style={isFollowing ? { color: 'var(--text-main)', borderColor: 'var(--border-color)' } : {}}
                    >
                        {isFollowing ? "Ви підписані" : "Підписатися"}
                    </Button>
                )}

                {!isBlocked && (
                    <>
                        {friendStatus === 'None' && (
                            <Button variant="outline-primary" onClick={handleFriendAction}>Додати в друзі</Button>
                        )}
                        {friendStatus === 'PendingOutgoing' && (
                            <Button variant="secondary" onClick={handleFriendAction}>Запит надіслано</Button>
                        )}
                        
                        {friendStatus === 'PendingIncoming' && (
                            <div className="d-flex gap-2">
                                <Button variant="success" onClick={handleAccept}>✅ Прийняти</Button>
                                <Button variant="outline-danger" onClick={handleReject}>❌ Відхилити</Button>
                            </div>
                        )}

                        {friendStatus === 'Friend' && (
                            <Button variant="outline-danger" onClick={handleFriendAction}>Видалити з друзів</Button>
                        )}
                    </>
                )}

                {isAdmin && (
                    <Button variant={isBlocked ? "dark" : "link"} className={!isBlocked ? "text-danger" : ""} onClick={handleBlockAction}>
                        {isBlocked ? "🔓 Розблокувати" : "🚫 Заблокувати"}
                    </Button>
                )}
            </div>
        )}

        {isBlocked && <Badge bg="danger" className="align-self-center p-2">⛔ Цей акаунт заблоковано</Badge>}

        <p className="mb-0 mt-2 small" style={{ color: 'var(--text-secondary)' }}>
          На сайті з {new Date(userProfile.createdAt).toLocaleDateString('uk-UA')}
        </p>
      </Card>

      {!isBlocked && (
          <>
            <h4 
                className="mb-4 ps-2 border-start border-4" 
                style={{ borderColor: 'var(--primary-color)', color: 'var(--text-main)' }}
            >
                Відгуки користувача ({reviews.length})
            </h4>

            {reviews.length === 0 ? (
                <p style={{ opacity: 0.7, color: 'var(--text-secondary)' }}>Немає відгуків.</p>
            ) : (
                <Row>
                    {reviews.map(review => (
                        <Col md={12} key={review.id} className="mb-3">
                            <Card className="shadow-sm border-0" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                                <Card.Body>
                                    <div className="d-flex gap-3">
                                            <Link to={`/movie/${review.movieId}`} className="flex-shrink-0">
                                                <img 
                                                    src={getImageUrl(review.moviePosterUrl || review.posterUrl)} 
                                                    alt="Poster" 
                                                    className="rounded" 
                                                    style={{width: 60, height: 90, objectFit: 'cover'}}
                                                    onError={(e) => {e.target.src = defaultPosterImg}}
                                                />
                                            </Link>
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between">
                                                    <h6 className="mb-1"><Link to={`/movie/${review.movieId}`} className="text-decoration-none fw-bold" style={{ color: 'var(--text-main)' }}>{review.movieTitle}</Link></h6>
                                                    <Badge bg={review.rating >= 8 ? 'success' : 'warning'}>{review.rating}/10</Badge>
                                                </div>
                                                <small style={{ color: 'var(--text-secondary)' }}>{formatDate(review.createdAt)}</small>
                                                <p className="mt-2 mb-2" style={{ whiteSpace: 'pre-wrap', opacity: 0.9 }}>{review.comment}</p>
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

      <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="bg-card text-main">
        <Modal.Header closeButton style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}>
            <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'var(--bg-main)', maxHeight: '60vh', overflowY: 'auto' }}>
            {modalLoading ? (
                <div className="text-center p-3"><Spinner animation="border" size="sm" /></div>
            ) : (
                <ListGroup variant="flush">
                    {modalUsers.length > 0 ? (
                        modalUsers.map(u => (
                            <ListGroup.Item 
                                key={u.id} 
                                className="d-flex align-items-center justify-content-between"
                                style={{ backgroundColor: 'transparent', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}
                            >
                                <div className="d-flex align-items-center gap-2">
                                    <img 
                                            src={getImageUrl(u.avatarUrl, 'https://via.placeholder.com/40')} 
                                            style={{width: 40, height: 40, borderRadius: '50%', objectFit: 'cover'}}
                                            onError={(e)=>{e.target.src='https://via.placeholder.com/40'}}
                                    />
                                    <Link 
                                        to={`/users/${u.id}`} 
                                        className="text-decoration-none fw-bold" 
                                        style={{ color: 'var(--text-main)' }}
                                        onClick={() => setShowModal(false)}
                                    >
                                        {u.username}
                                    </Link>
                                </div>
                            </ListGroup.Item>
                        ))
                    ) : (
                        <p className="text-center text-muted mt-3">Список порожній</p>
                    )}
                </ListGroup>
            )}
        </Modal.Body>
      </Modal>

    </Container>
  );
}

export default UserPublicProfilePage;