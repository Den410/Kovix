import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminMovieModal from './AdminMovieModal';
import ThemeSettings from './ThemeSettings';
import { useFriends } from '../contexts/FriendsContext';
import { authAPI } from '../services/api';

const API_BASE_URL = 'http://localhost:5096';

function Navigation() {
  const { user, logout, isAdmin } = useAuth();
  const { requestCount } = useFriends();
  const navigate = useNavigate();
  const location = useLocation(); 

  const [showAddModal, setShowAddModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  
  const [userAvatar, setUserAvatar] = useState(null);

  useEffect(() => {
    if (user) {
        if (user.avatarUrl) setUserAvatar(user.avatarUrl);

        authAPI.getProfile()
            .then(res => {
                setUserAvatar(res.data.avatarUrl);
            })
            .catch(err => console.error("Не вдалося завантажити аватар", err));
    }
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 sticky-top shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold text-warning">
              🎬 Kovix
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            
            <Nav className="me-auto">
              {user && (
                <Nav.Link as={Link} to="/my-lists" className="fw-bold text-white">
                  🗂️ Мої списки
                </Nav.Link>
              )}
            </Nav>

            <Link 
              to="/chat" 
              className="text-decoration-none me-3" 
              title="Повідомлення"
              style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.7)' }}
            >
              💬
            </Link>

            <Nav className="align-items-center">
              
              {user && (
                  <Link 
                    to="/profile" 
                    className="position-relative text-decoration-none me-3 d-flex align-items-center"
                    title={requestCount > 0 ? `У вас ${requestCount} нових запитів` : "Сповіщення"}
                    style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s' }}
                  >
                      <span style={{ fontSize: '1.4rem' }}>🔔</span>
                      
                      {requestCount > 0 && (
                          <span 
                            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                            style={{ fontSize: '0.6rem', border: '1px solid #343a40' }}
                          >
                              {requestCount}
                          </span>
                      )}
                  </Link>
              )}

              <Button 
                variant="link" 
                className="text-decoration-none me-3 p-0 border-0" 
                style={{ fontSize: '1.2rem' }}
                onClick={() => setShowThemeModal(true)}
                title="Змінити тему"
              >
                🎨
              </Button>

              {user ? (
                <>
                  {isAdmin() && (
                    <Button 
                      variant="success" 
                      size="sm" 
                      className="me-3 d-flex align-items-center gap-1"
                      onClick={() => setShowAddModal(true)}
                    >
                      <span>➕</span> Додати фільм
                    </Button>
                  )}

                  <Nav.Link as={Link} to="/profile" className="fw-bold text-light me-2 d-flex align-items-center gap-2">
                    {userAvatar ? (
                        <img 
                            src={`${API_BASE_URL}${userAvatar}`} 
                            alt="Avatar" 
                            className="rounded-circle"
                            style={{ width: 30, height: 30, objectFit: 'cover' }}
                        />
                    ) : (
                        <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center" style={{width: 30, height: 30, fontSize: '0.8rem'}}>
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                    )}

                    <span className="d-none d-sm-inline">{user.username}</span>
                  </Nav.Link>

                  <Button variant="outline-secondary" size="sm" onClick={handleLogout}>Вихід</Button>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">Вхід</Nav.Link>
                  <Button as={Link} to="/register" variant="primary" size="sm" className="ms-2">Реєстрація</Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <AdminMovieModal 
        show={showAddModal} 
        onHide={() => setShowAddModal(false)} 
        onSuccess={() => window.location.reload()} 
      />
      
      <ThemeSettings 
        show={showThemeModal} 
        onHide={() => setShowThemeModal(false)} 
      />
    </>
  );
}

export default Navigation;