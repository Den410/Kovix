import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Button, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
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
    setPreviewUrl(profile.avatarUrl ? `${API_BASE_URL}${profile.avatarUrl}` : null);
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
    } catch {
      alert('Не вдалося оновити профіль');
    }
  };

  const getAvatarUrl = () =>
    profile?.avatarUrl ? `${API_BASE_URL}${profile.avatarUrl}` : null;

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container className="mt-5 text-center">
        <h2>Помилка завантаження профілю</h2>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm text-center p-3">
            <Card.Body>
              <div className="mb-3 d-flex justify-content-center">
                {getAvatarUrl() ? (
                  <img
                    src={getAvatarUrl()}
                    alt="Avatar"
                    className="rounded-circle border"
                    style={{ width: 120, height: 120, objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white"
                    style={{ width: 120, height: 120, fontSize: '3rem' }}
                  >
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <h3>{profile.username}</h3>
              <p className="text-muted">{profile.email}</p>

              <Badge bg={profile.role === 'Admin' ? 'danger' : 'info'} className="p-2 fs-6 mb-3">
                {profile.role === 'Admin' ? '👑 Адміністратор' : '👤 Користувач'}
              </Badge>

              <div className="d-grid gap-2">
                <Button variant="outline-primary" onClick={handleOpenEdit}>
                  ✏️ Редагувати профіль
                </Button>
                <Button variant="outline-danger" onClick={handleLogout}>
                  Вийти
                </Button>
              </div>
            </Card.Body>
          </Card>
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
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Фото профілю</Form.Label>

              <div className="d-flex align-items-center gap-3 mb-3">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="rounded-circle border d-flex align-items-center justify-content-center"
                       style={{ width: 60, height: 60 }}>
                    —
                  </div>
                )}

                {previewUrl && (
                  <Button size="sm" variant="outline-danger" onClick={handleDeletePhoto}>
                    🗑️ Видалити
                  </Button>
                )}
              </div>

              <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>Скасувати</Button>
          <Button variant="primary" onClick={handleSaveChanges}>Зберегти</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ProfilePage;