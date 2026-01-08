import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Nav, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { watchlistAPI } from '../services/api';
import '../style/MyListsPage.css';

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
      <h2 className="mb-4">🗂️ Моя колекція</h2>

      <Nav variant="tabs" className="mb-4" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        {TABS.map(tab => (
          <Nav.Item key={tab.eventKey}>
            <Nav.Link eventKey={tab.eventKey} className="fw-bold">
               {tab.label}
               <Badge bg="light" text="dark" className="ms-2 border">
                 {tab.eventKey === 'favorite' 
                    ? items.filter(i => i.isFavorite).length 
                    : items.filter(i => i.status === parseInt(tab.eventKey)).length}
               </Badge>
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      {filteredItems.length === 0 ? (
        <div className="text-center py-5 text-muted bg-light rounded">
           <h4>Тут поки що порожньо 🕸️</h4>
           <p>Додайте фільми до цього списку на сторінці фільму.</p>
           <Button as={Link} to="/" variant="primary">Перейти до каталогу</Button>
        </div>
      ) : (
        <Row>
          {filteredItems.map(item => (
            <Col key={item.movieId} xs={6} sm={4} md={3} lg={2} className="mb-4">
            <Card className="h-100 shadow-sm border-0 position-relative movie-card-hover">
               <Link to={`/movie/${item.movieId}`} className="text-decoration-none text-dark h-100 d-flex flex-column">
                  <div
                    className="overflow-hidden rounded-top"
                    style={{ aspectRatio: '2 / 3' }}
                  >
                    <Card.Img
                      src={item.posterUrl || 'https://tse1.mm.bing.net/th/id/OIP.Lr_j_PgqTGzKxJTeIwajVwHaLH'}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <Card.Body className="p-2">
                   <h6 className="text-truncate mb-1" title={item.title} style={{fontSize: '0.9rem', fontWeight: 'bold'}}>
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
          ))}
        </Row>
      )}
    </Container>
  );
}

export default MyListsPage;