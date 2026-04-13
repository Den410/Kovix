import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Nav, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { watchlistAPI } from '../services/api';
import '../style/MyListsPage.css';
import defaultPosterImg from '../assets/NotFoundPoster.webp';
import { API_BASE_URL } from '../utils/apiConfig'; 
const PLACEHOLDER_IMG = defaultPosterImg;

const TABS = [
  { eventKey: 'favorite', label: '❤️ Улюблені' },
  { eventKey: '1', label: '📅 Заплановано' },
  { eventKey: '2', label: '👀 Переглядаю' },
  { eventKey: '3', label: '✅ Переглянуто' },
  { eventKey: '4', label: '❌ Закинуто' },
];

const STATUS_MAP = {
  1: { label: 'Заплановано', className: 'status-planned' },
  2: { label: 'Переглядаю', className: 'status-watching' },
  3: { label: 'Переглянуто', className: 'status-watched' },
  4: { label: 'Закинуто', className: 'status-dropped' },
};

function MyListsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('favorite');

  useEffect(() => {
    loadMyList();
  }, []);

  const loadMyList = async () => {
    try {
      const response = await watchlistAPI.getMyList();
      setItems(response.data);
    } catch (error) {
      console.error("Помилка завантаження списку:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredItems = () => {
    if (activeTab === 'favorite') {
      return items.filter(item => item.isFavorite);
    }
    return items.filter(item => item.status === parseInt(activeTab));
  };

  const filteredItems = getFilteredItems();

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;

  return (
    <Container className="mt-4 mb-5">
      <h2 className="mb-4" style={{ color: 'var(--text-main)' }}>🗂️ Моя колекція</h2>

      <Nav 
        variant="tabs" 
        className="mb-4 custom-tabs"
        activeKey={activeTab} 
        onSelect={(k) => setActiveTab(k)}
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        {TABS.map(tab => {
            const isActive = activeTab === tab.eventKey;
            return (
              <Nav.Item key={tab.eventKey}>
                <Nav.Link 
                    eventKey={tab.eventKey} 
                    className="fw-bold"
                    style={{
                        color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                        backgroundColor: isActive ? 'var(--bg-card)' : 'transparent',
                        borderColor: isActive ? 'var(--border-color) var(--border-color) transparent' : 'transparent',
                        borderBottom: isActive ? '1px solid transparent' : 'none'
                    }}
                >
                   {tab.label}
                   <Badge 
                        bg={isActive ? "primary" : "secondary"} 
                        className="ms-2"
                        style={{ opacity: isActive ? 1 : 0.7 }}
                   >
                     {tab.eventKey === 'favorite' 
                       ? items.filter(i => i.isFavorite).length 
                       : items.filter(i => i.status === parseInt(tab.eventKey)).length}
                   </Badge>
                </Nav.Link>
              </Nav.Item>
            );
        })}
      </Nav>

      {filteredItems.length === 0 ? (
        <div 
            className="text-center py-5 rounded border"
            style={{ 
                backgroundColor: 'var(--bg-card)', 
                color: 'var(--text-main)',
                borderColor: 'var(--border-color)' 
            }}
        >
           <h4>Тут поки що порожньо 🕸️</h4>
           <p style={{ color: 'var(--text-secondary)' }}>Додайте фільми до цього списку на сторінці фільму.</p>
           <Button as={Link} to="/" variant="primary">Перейти до каталогу</Button>
        </div>
      ) : (
        <Row>
          {filteredItems.map(item => {
            let imageUrl = PLACEHOLDER_IMG;
            let rawPoster = item.posterUrl;

            if (rawPoster) {
                if (rawPoster.startsWith('http')) {
                    imageUrl = rawPoster;
                } else {
                    const cleanPath = rawPoster.startsWith('/') ? rawPoster : `/${rawPoster}`;
                    imageUrl = `${API_BASE_URL}${cleanPath}`;
                }
            }

            return (
              <Col key={item.movieId} xs={6} sm={4} md={3} lg={2} className="mb-4">
              <Card 
                  className="h-100 shadow-sm border-0 position-relative movie-card-hover"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
              >
                 <Link to={`/movie/${item.movieId}`} className="text-decoration-none h-100 d-flex flex-column" style={{ color: 'var(--text-main)' }}>
                    <div
                      className="overflow-hidden rounded-top"
                      style={{ aspectRatio: '2 / 3' }}
                    >
                      <Card.Img
                        src={imageUrl}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { 
                          e.target.onerror = null; 
                          e.target.src = PLACEHOLDER_IMG; 
                        }}
                      />
                    </div>

                    <Card.Body className="p-2">
                      <h6 className="text-truncate mb-1" title={item.title} style={{fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-main)'}}>
                        {item.title}
                      </h6>
                      
                      {activeTab === 'favorite' && item.status > 0 && STATUS_MAP[item.status] && (
                        <span className={`status-badge ${STATUS_MAP[item.status].className}`}>
                          {STATUS_MAP[item.status].label}
                        </span>
                      )}
                    </Card.Body>
                 </Link>
               </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
}

export default MyListsPage;