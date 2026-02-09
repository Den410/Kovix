import { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminMovieModal from './AdminMovieModal';
import ThemeSettings from './ThemeSettings';
import { authAPI, moviesAPI } from '../services/api';
import NotificationBell from './NotificationBell';
import { useTheme } from '../contexts/ThemeContext';
import '../style/App.css';
import defaultAvatarImg from '../assets/NotFoundAvatar.png';

const API_BASE_URL = 'http://localhost:5096';
const DEFAULT_AVATAR = defaultAvatarImg

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

        <Navbar.Toggle />

        <Navbar.Collapse>
          <Nav className="me-auto">
              <Nav.Link as={Link} to="/movies" className="fw-semibold">
                  🎥 Каталог
              </Nav.Link>
              
              <Nav.Link as={Link} to="/top" className="fw-bold text-warning">
                  🏆 Топ-100
              </Nav.Link>
          </Nav>
          <Nav className="align-items-center gap-2">

            {user && <NotificationBell />}

            {user && (
              <Nav.Link
                as={Link}
                to="/chat"
                title="Чат"
                className="fs-5"
              >
                💬
              </Nav.Link>
            )}

            <Button
              variant={isDark ? "outline-warning" : "warning"}
              size="sm"
              onClick={handleRandomMovie}
              disabled={randomLoading}
              className="d-flex align-items-center gap-1"
            >
              {randomLoading
                ? <span className="spinner-border spinner-border-sm" />
                : <>🎲 <span className="d-none d-md-inline">Рандом</span></>
              }
            </Button>

            <Button
              variant="link"
              className="fs-5 text-decoration-none"
              onClick={() => setShowThemeModal(true)}
              title="Тема"
            >
              🎨
            </Button>

            {user ? (
              <>
                {isAdmin() && (
                  <Button
                    variant="success"
                    size="sm"
                    className="d-none d-lg-inline"
                    onClick={() => setShowAddModal(true)}
                  >
                    ➕
                  </Button>
                )}

                <NavDropdown
                  align="end"
                  id="profile-dropdown"
                  title={
                    <div className="d-flex align-items-center gap-2">
                      
                      <img
                        src={userAvatar ? `${API_BASE_URL}${userAvatar}` : DEFAULT_AVATAR}
                        alt="avatar"
                        className="rounded-circle border border-secondary"
                        style={{ width: 32, height: 32, objectFit: 'cover' }}
                        onError={(e) => { e.target.src = DEFAULT_AVATAR; }} 
                      />
                      <span className="d-none d-md-inline fw-semibold">
                        {user.username}
                      </span>
                    </div>
                  }
                >
                  <NavDropdown.Header>
                    Привіт, {user.username} 👋
                  </NavDropdown.Header>

                  <NavDropdown.Item as={Link} to="/profile">
                    👤 Профіль
                  </NavDropdown.Item>

                  <NavDropdown.Item as={Link} to="/my-lists">
                    🗂️ Мої списки
                  </NavDropdown.Item>

                  <NavDropdown.Item as={Link} to="/history">
                    🕰️ Історія
                  </NavDropdown.Item>

                  {isAdmin() && (
                    <>
                      <NavDropdown.Divider />

                      <NavDropdown.Item
                        onClick={() => setShowAddModal(true)}
                        className="d-lg-none"
                      >
                        ➕ Додати фільм
                      </NavDropdown.Item>

                      <NavDropdown.Item
                        as={Link}
                        to="/admin/reports"
                        className="text-warning"
                      >
                        🛡️ Скарги
                      </NavDropdown.Item>
                    </>
                  )}

                  <NavDropdown.Item as={Link} to="/my-reviews">📝 Мої відгуки</NavDropdown.Item>

                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout} className="text-danger">
                    🚪 Вийти
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Button as={Link} to="/login" size="sm" variant="outline-primary">
                  Вхід
                </Button>
                <Button as={Link} to="/register" size="sm">
                  Реєстрація
                </Button>
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