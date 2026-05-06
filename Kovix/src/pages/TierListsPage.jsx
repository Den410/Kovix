import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Modal, Form, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { tierListsAPI } from '../services/api';
import TierListCard from '../components/TierListCard';
import '../style/TierListsPage.css';

function TierListsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tierLists, setTierLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');

  useEffect(() => {
    loadTierLists();
  }, [filter, page]);

  const loadTierLists = async () => {
    setLoading(true);
    try {
      let response;
      
      if (filter === 'my') {
        if (!user) {
          setTierLists([]);
          setTotalCount(0);
          setLoading(false);
          return;
        }
        response = await tierListsAPI.getUserTierLists(user.id);
        setTierLists(response.data);
        setTotalCount(response.data.length);
      } else if (filter === 'public') {
        response = await tierListsAPI.getAll(null, true, page, pageSize);
        setTierLists(response.data);
        setTotalCount(parseInt(response.headers['x-total-count'] || 0));
      } else {
        response = await tierListsAPI.getAll(null, null, page, pageSize);
        setTierLists(response.data);
        setTotalCount(parseInt(response.headers['x-total-count'] || 0));
      }
    } catch (error) {
      console.error('Помилка завантаження тір лістів:', error);
      setTierLists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTierList = async () => {
    if (!createTitle.trim()) {
      setCreateError('Введіть назву тір ліста');
      return;
    }

    try {
      const newTierList = await tierListsAPI.create({
        title: createTitle,
        description: createDescription,
        items: []
      });
      
      setShowCreateModal(false);
      setCreateTitle('');
      setCreateDescription('');
      setCreateError('');
      
      navigate(`/tierlists/${newTierList.data.id}/edit`);
    } catch (error) {
      setCreateError('Помилка при створенні тір ліста');
      console.error('Помилка:', error);
    }
  };

  const handleDeleteTierList = async (id) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей тір ліст?')) {
      try {
        await tierListsAPI.delete(id);
        setTierLists(tierLists.filter(tl => tl.id !== id));
      } catch (error) {
        console.error('Помилка при видаленні:', error);
        alert('Помилка при видаленні тір ліста');
      }
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Container className="mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: 'var(--text-main)' }}>🏆 Тір Лісти</h2>
        {user && (
          <Button 
            variant="primary" 
            onClick={() => setShowCreateModal(true)}
          >
            + Створити тір ліст
          </Button>
        )}
      </div>

      {!user && (
        <Alert variant="info" className="mb-4">
          <Link to="/login">Увійдіть</Link>, щоб створювати та ділитися тір лістами
        </Alert>
      )}

      <div className="mb-4 d-flex gap-2">
        <Button 
          variant={filter === 'all' ? 'primary' : 'outline-secondary'}
          onClick={() => { setFilter('all'); setPage(1); }}
        >
          Усі
        </Button>
        {user && (
          <Button 
            variant={filter === 'my' ? 'primary' : 'outline-secondary'}
            onClick={() => { setFilter('my'); setPage(1); }}
          >
            Мої тір лісти
          </Button>
        )}
        <Button 
          variant={filter === 'public' ? 'primary' : 'outline-secondary'}
          onClick={() => { setFilter('public'); setPage(1); }}
        >
          Схвалені
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" style={{ color: 'var(--text-main)' }} />
        </div>
      ) : tierLists.length === 0 ? (
        <Card className="text-center py-5 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <Card.Body>
            <p style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>
              {filter === 'my' ? 'У вас немає тір лістів' : 'Тір лісти не знайдені'}
            </p>
            {user && filter === 'my' && (
              <Button 
                variant="primary"
                onClick={() => setShowCreateModal(true)}
                className="mt-2"
              >
                Створити перший тір ліст
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        <>
          <Row className="g-4">
            {tierLists.map(tierList => (
              <Col key={tierList.id} md={6} lg={4}>
                <TierListCard 
                  tierList={tierList}
                  onDelete={handleDeleteTierList}
                  isOwner={user?.id === tierList.userId}
                />
              </Col>
            ))}
          </Row>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-2 mt-5">
              <Button 
                variant="outline-primary"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Назад
              </Button>
              <span className="px-3 fw-bold" style={{ color: 'var(--text-main)' }}>
                Сторінка {page} з {totalPages}
              </span>
              <Button 
                variant="outline-primary"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Далі
              </Button>
            </div>
          )}
        </>
      )}

      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
          <Modal.Title>Створити новий тір ліст</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>
          {createError && <Alert variant="danger">{createError}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Назва *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Введіть назву тір ліста"
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                maxLength={200}
                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}
              />
              <small className="text-muted">{createTitle.length}/200</small>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Опис</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Введіть опис (опційно)"
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                maxLength={1000}
                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}
              />
              <small className="text-muted">{createDescription.length}/1000</small>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-color)' }}>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Скасувати
          </Button>
          <Button variant="primary" onClick={handleCreateTierList}>
            Створити
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default TierListsPage;