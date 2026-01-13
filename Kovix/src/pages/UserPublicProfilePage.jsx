import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { usersAPI, reviewsAPI } from '../services/api';

const API_BASE_URL = 'http://localhost:5096';

function UserPublicProfilePage() {
  const { id } = useParams();
  const [userProfile, setUserProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error("Помилка:", error);
      setUserProfile(null);
    } finally {
      setLoading(false);
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
        
        <p className="mb-0" style={{ opacity: 0.7 }}>
          На сайті з {new Date(userProfile.createdAt).toLocaleDateString('uk-UA')}
        </p>
      </Card>

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
    </Container>
  );
}

export default UserPublicProfilePage;