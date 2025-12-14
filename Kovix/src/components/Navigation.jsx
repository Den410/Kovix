import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">🎬 MovieReview</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Головна</Nav.Link>
            <Nav.Link as={Link} to="/search">Пошук</Nav.Link>
          </Nav>
          <Nav>
            {user ? (
              <>
                <span className="nav-link text-light me-2">Привіт, {user.username} ({user.role})</span>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>Вихід</Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Вхід</Nav.Link>
                <Nav.Link as={Link} to="/register">Реєстрація</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;