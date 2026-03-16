import { useState, useEffect } from 'react';
import { Container, CloseButton } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { moviesAPI } from '../services/api';

function PromoBanner() {
  const [show, setShow] = useState(true);
  const [latestMovie, setLatestMovie] = useState(null);

  useEffect(() => {
    moviesAPI.getLatest()
      .then(res => {
        if (res.data) {
          setLatestMovie(res.data);
        }
      })
      .catch(err => console.error("Не вдалося завантажити промо-банер:", err));
  }, []);

  if (!show || !latestMovie) return null;

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      color: 'var(--text-main)',
      position: 'relative',
      zIndex: 1050,
      padding: '10px 0'
    }}>
      <Container className="d-flex justify-content-center align-items-center position-relative">
        
        <div className="d-flex align-items-center gap-3 flex-wrap justify-content-center text-center pe-4">
          <span style={{ 
            backgroundColor: 'var(--primary-color)',
            color: 'var(--btn-text)', 
            padding: '2px 8px', 
            fontWeight: '900', 
            borderRadius: '4px', 
            fontSize: '0.8rem',
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}>
            Новинка
          </span>
          
          <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>
            Не пропустіть! На сайт щойно додано: <strong style={{ color: 'var(--primary-color)' }}>{latestMovie.title}</strong>
          </span>
          
          <Link 
            to={`/movie/${latestMovie.id}`} 
            style={{ 
              color: 'var(--primary-color)', 
              textDecoration: 'none', 
              fontWeight: '600', 
              fontSize: '0.95rem' 
            }}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
          >
            Дивитися зараз &gt;
          </Link>
        </div>

        <CloseButton
          variant="white" 
          onClick={() => setShow(false)}
          style={{ 
            position: 'absolute', 
            right: '15px', 
            fontSize: '0.8rem',
            opacity: 0.7 
          }}
        />
      </Container>
    </div>
  );
}

export default PromoBanner;