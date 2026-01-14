import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <Container 
      className="d-flex flex-column align-items-center justify-content-center text-center" 
      style={{ 
        minHeight: '80vh',
        color: 'var(--text-main)' 
      }}
    >
      <div style={{ fontSize: '8rem', fontWeight: 'bold', color: 'var(--primary-color)', lineHeight: 1 }}>
        404
      </div>
      
      <h2 className="mb-3 fw-bold">Упс! Сторінку не знайдено</h2>
      
      <p className="mb-4" style={{ fontSize: '1.2rem', opacity: 0.7, maxWidth: '500px' }}>
        Схоже, ви заблукали у світі кіно. Сторінка, яку ви шукаєте, була видалена або ніколи не існувала.
      </p>

      <div className="d-flex gap-3">
        <Button as={Link} to="/" variant="primary" size="lg">
          🏠 На головну
        </Button>
        <Button onClick={() => window.history.back()} variant="outline-secondary" size="lg" style={{ color: 'var(--text-main)', borderColor: 'var(--border-color)' }}>
          ⬅️ Назад
        </Button>
      </div>
    </Container>
  );
}

export default NotFoundPage;