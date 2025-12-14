import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Button, Modal, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:5096'; 

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState('');
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [shouldDeleteAvatar, setShouldDeleteAvatar] = useState(false);

  const { logout, login } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Помилка завантаження профілю', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();    
    navigate('/');
  };

  const handleOpenEdit = () => {
    setEditName(profile.username);
    setSelectedFile(null);
    setShouldDeleteAvatar(false);
    if (profile.avatarUrl) {
      setPreviewUrl(`${API_BASE_URL}${profile.avatarUrl}`);
    } else {
      setPreviewUrl(null);
    }
    setShowEdit(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); 
      setShouldDeleteAvatar(false); 
    }
  };

  const handleDeletePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null); 
    setShouldDeleteAvatar(true); 
  };

  const handleSaveChanges = async () => {
    try {
      const formData = new FormData();
      formData.append('Username', editName);
      if (selectedFile) formData.append('Avatar', selectedFile);
      formData.append('DeleteAvatar', shouldDeleteAvatar);

      const response = await authAPI.updateProfile(formData);
      setProfile(response.data);
      
      const token = localStorage.getItem('token');
      login(token, response.data.username, response.data.role);

      setShowEdit(false);
    } catch (error) {
      alert('Не вдалося оновити профіль. Спробуйте ще раз.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей відгук?')) {
      try {
        await reviewsAPI.delete(reviewId);
        loadProfile(); 
      } catch (error) {
        alert('Помилка видалення відгуку');
      }
    }
  };

  const getAvatarUrl = () => {
    if (profile && profile.avatarUrl) {
      return `${API_BASE_URL}${profile.avatarUrl}`;
    }
    return null;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
  if (!profile) return <Container className="mt-5 text-center"><h2>Помилка завантаження профілю</h2></Container>;

  return (
    <Container className="mt-4">
      <Row>
        <Col md={4} className="mb-4">
          <Card className="shadow-sm text-center p-3">
            <Card.Body>
              <div className="mb-3 d-flex justify-content-center">
                {getAvatarUrl() ? (
                  <img 
                    src={getAvatarUrl()} 
                    alt="Avatar" 
                    className="rounded-circle border"
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white" 
                    style={{ width: '120px', height: '120px', fontSize: '3rem' }}
                  >
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              <h3>{profile.username}</h3>
              <p className="text-muted">{profile.email}</p>
              
              <div className="mb-3">
                <Badge bg={profile.role === 'Admin' ? 'danger' : 'info'} className="p-2 fs-6">
                  {profile.role === 'Admin' ? '👑 Адміністратор' : '👤 Користувач'}
                </Badge>
              </div>

              <div className="d-grid gap-2">
                <Button variant="outline-primary" size="sm" onClick={handleOpenEdit}>
                  ✏️ Редагувати профіль
                </Button>
                <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                  Вихід з акаунту
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <h3 className="mb-4">📜 Мої рецензії</h3>
          
          {profile.reviews && profile.reviews.length > 0 ? (
            profile.reviews.map((review) => (
              <Card key={review.id} className="mb-3 shadow-sm border-0">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted me-2">Фільм:</span>
                    <Link to={`/movie/${review.movieId}`} className="fw-bold text-decoration-none">
                      {review.movie?.title || 'Невідомий фільм'}
                    </Link>
                  </div>
                  <Badge bg={review.rating >= 8 ? 'success' : review.rating >= 5 ? 'warning' : 'danger'}>
                    ⭐ {review.rating}/10
                  </Badge>
                </Card.Header>
                <Card.Body>
                  <Card.Text style={{ whiteSpace: 'pre-wrap' }}>{review.comment}</Card.Text>
                </Card.Body>
                <Card.Footer className="bg-white text-muted small d-flex justify-content-between align-items-center">
                  <span>📅 {formatDate(review.createdAt)}</span>
                  <Button variant="link" size="sm" className="text-danger p-0 text-decoration-none" onClick={() => handleDeleteReview(review.id)}>
                    Видалити
                  </Button>
                </Card.Footer>
              </Card>
            ))
          ) : (
            <Card className="text-center p-5 bg-light border-0">
              <h5 className="text-muted">Ви ще не написали жодного відгуку.</h5>
              <Link to="/" className="btn btn-primary mt-3">Знайти фільм</Link>
            </Card>
          )}
        </Col>
      </Row>

      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Редагування профілю</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Ім'я користувача</Form.Label>
              <Form.Control 
                type="text" 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)} 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Фото профілю</Form.Label>
              <div className="d-flex align-items-center gap-3 mb-3 p-2 border rounded bg-light">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                ) : (
                   <div className="rounded-circle d-flex align-items-center justify-content-center text-muted bg-white border" 
                        style={{ width: '60px', height: '60px' }}>
                     Немає
                   </div>
                )}
                
                {previewUrl && (
                  <Button variant="outline-danger" size="sm" onClick={handleDeletePhoto}>
                    🗑️ Видалити фото
                  </Button>
                )}
              </div>

              <Form.Control 
                type="file" 
                accept="image/*"
                onChange={handleFileChange} 
              />
              <Form.Text className="text-muted">
                Завантажте нове фото, щоб замінити поточне.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>Скасувати</Button>
          <Button variant="primary" onClick={handleSaveChanges}>Зберегти зміни</Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
}

export default ProfilePage;