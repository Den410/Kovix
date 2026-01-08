import React, { useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminMovieModal from './AdminMovieModal';

function Navigation() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);

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

            <Nav className="align-items-center">
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
                    <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center" style={{width: 30, height: 30, fontSize: '0.8rem'}}>
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    {user.username}
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
    </>
  );
}

export default Navigation;