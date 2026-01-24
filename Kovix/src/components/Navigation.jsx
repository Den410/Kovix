import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminMovieModal from './AdminMovieModal';
import ThemeSettings from './ThemeSettings';
import { authAPI, moviesAPI } from '../services/api';
import NotificationBell from './NotificationBell';
import { useTheme } from '../contexts/ThemeContext';
import '../style/App.css';

const API_BASE_URL = 'http://localhost:5096';

function Navigation() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); 
  const [randomLoading, setRandomLoading] = useState(false);

  const { themeMode } = useTheme();
  
  const isDark = themeMode === 'dark';

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
  const handleRandomMovie = async () => {
    if (randomLoading) return; 

    try {
      setRandomLoading(true);
      const response = await moviesAPI.getRandom();
      const randomId = response.data.id;
      
      navigate(`/movie/${randomId}`);
    } catch (error) {
      console.error("Не вдалося знайти випадковий фільм", error);
      alert("Не вдалося підібрати фільм. Можливо, ваші фільтри занадто суворі.");
    } finally {
      setRandomLoading(false);
    }
  };

  return (
    <>
        <Navbar
          bg={isDark ? 'dark' : 'light'}
          variant={isDark ? 'dark' : 'light'}
          expand="lg"
          className="mb-4 sticky-top shadow-sm"
        >

        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold text-warning">
              🎬 Kovix
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            
            <Nav className="me-auto">
              {user && (
                <Nav.Link
                  as={Link}
                  to="/my-lists"
                  className="fw-bold nav-text"
                >
                  🗂️ Мої списки
                </Nav.Link>

              )}
            </Nav>

            <div className="d-flex align-items-center gap-3">
                {user && <NotificationBell />}
            </div>

            <Link 
              to="/chat" 
              className="text-decoration-none me-3 text-body" 
              title="Повідомлення"
              style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.7)' }}
            >
              💬
            </Link>

            <Nav className="align-items-center">
              <Button
                variant={isDark ? "outline-warning" : "warning"}
                size="sm"
                className="me-3 d-flex align-items-center gap-1"
                onClick={handleRandomMovie}
                disabled={randomLoading}
                title="Випадковий фільм"
              >
                {randomLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" />
                  </>
                ) : (
                  <>
                    🎲 <span className="d-none d-md-inline">Рандом</span>
                  </>
                )}
              </Button>

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

                  <Nav.Link as={Link} to="/profile" className="fw-bold text-body me-2 d-flex align-items-center gap-2">
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