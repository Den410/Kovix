import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, Modal, Badge } from 'react-bootstrap';
import { tierListsAPI } from '../services/api';
import '../style/AdminTierListModerationPage.css';

const DEFAULT_TIERS = [
  { id: 'S', name: 'S', color: '#FF6B6B' },
  { id: 'A', name: 'A', color: '#4ECDC4' },
  { id: 'B', name: 'B', color: '#45B7D1' },
  { id: 'C', name: 'C', color: '#FFA502' },
  { id: 'D', name: 'D', color: '#95E1D3' },
  { id: 'F', name: 'F', color: '#C7CEEA' }
];

function AdminTierListModerationPage() {
  const [tierLists, setTierLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTierList, setSelectedTierList] = useState(null);
  const [currentTiersConfig, setCurrentTiersConfig] = useState(DEFAULT_TIERS);

  const [showModal, setShowModal] = useState(false);
  const [modalLoadingId, setModalLoadingId] = useState(null); 
  const [moderationStatus, setModerationStatus] = useState('Approved');
  const [adminComment, setAdminComment] = useState('');
  
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [moderating, setModerating] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadPendingTierLists();
  }, [statusFilter, page]);

  const loadPendingTierLists = async () => {
    setLoading(true);
    try {
      const response = statusFilter === 'all'
        ? await tierListsAPI.getAllForModeration(null, page, pageSize)
        : await tierListsAPI.getAllForModeration(statusFilter, page, pageSize);
      
      setTierLists(response.data);
      setTotalCount(parseInt(response.headers['x-total-count'] || 0));
    } catch (error) {
      console.error('Помилка завантаження:', error);
      setTierLists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (tierListPreview) => {
    setModalLoadingId(tierListPreview.id);
    try {
      const response = await tierListsAPI.getById(tierListPreview.id);
      const fullTierList = response.data;

      setSelectedTierList(fullTierList);
      setModerationStatus(fullTierList.status);
      setAdminComment(fullTierList.adminComment || '');

      let parsedTiers = DEFAULT_TIERS;
      if (fullTierList.tiersConfig) {
        if (typeof fullTierList.tiersConfig === 'string') {
          try {
            parsedTiers = JSON.parse(fullTierList.tiersConfig);
          } catch {
            parsedTiers = DEFAULT_TIERS;
          }
        } else if (Array.isArray(fullTierList.tiersConfig)) {
          parsedTiers = fullTierList.tiersConfig;
        }
      }
      setCurrentTiersConfig(parsedTiers);
      setShowModal(true);
    } catch (error) {
      console.error('Помилка при завантаженні деталей тір-ліста:', error);
      alert('Не вдалося завантажити деталі. Спробуйте ще раз.');
    } finally {
      setModalLoadingId(null);
    }
  };

  const handleModerate = async () => {
    if (!selectedTierList) return;

    setModerating(true);
    try {
      await tierListsAPI.moderate(selectedTierList.id, {
        status: moderationStatus,
        adminComment
      });

      setSuccess(`Тір ліст ${moderationStatus === 'Approved' ? 'схвалено' : 'відхилено'} успішно!`);
      setShowModal(false);
      loadPendingTierLists();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Помилка при модерації:', error);
      alert('Помилка при модерації тір ліста');
    } finally {
      setModerating(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const groupedByTier = selectedTierList ? 
    selectedTierList.items.reduce((acc, item) => {
      if (!acc[item.tier]) acc[item.tier] = [];
      acc[item.tier].push(item);
      return acc;
    }, {}) : {};

  return (
    <Container className="mt-4 mb-5">
      <h2 className="mb-4">🛡️ Модерація тір лістів</h2>

      {success && <Alert variant="success">{success}</Alert>}

      <div className="mb-4 d-flex gap-2 flex-wrap">
        <Button variant={statusFilter === 'Pending' ? 'primary' : 'outline-secondary'} onClick={() => { setStatusFilter('Pending'); setPage(1); }}>На розгляді</Button>
        <Button variant={statusFilter === 'Approved' ? 'primary' : 'outline-secondary'} onClick={() => { setStatusFilter('Approved'); setPage(1); }}>Схвалені</Button>
        <Button variant={statusFilter === 'Rejected' ? 'primary' : 'outline-secondary'} onClick={() => { setStatusFilter('Rejected'); setPage(1); }}>Відхилені</Button>
        <Button variant={statusFilter === 'all' ? 'primary' : 'outline-secondary'} onClick={() => { setStatusFilter('all'); setPage(1); }}>Усі</Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : tierLists.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <p>Тір лісти на розгляді не знайдені</p>
          </Card.Body>
        </Card>
      ) : (
        <>
          <div className="tier-lists-moderation">
            {tierLists.map(tierList => (
              <Card key={tierList.id} className="mb-3">
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <h5>{tierList.title}</h5>
                      <p className="text-muted mb-2"><strong>Автор:</strong> {tierList.username}</p>
                      {tierList.description && <p className="mb-2">{tierList.description.substring(0, 100)}...</p>}
                      <p className="mb-2">
                        <strong>Статус:</strong> <Badge bg={tierList.status === 'Approved' ? 'success' : tierList.status === 'Rejected' ? 'danger' : 'warning'}>{tierList.status}</Badge>
                      </p>
                      <p className="mb-0"><strong>Фільмів:</strong> {tierList.items ? tierList.items.length : tierList.itemCount}</p>
                    </Col>
                    <Col md={6} className="text-end d-flex align-items-center justify-content-end">
                      <Button 
                        variant="primary" 
                        onClick={() => handleOpenModal(tierList)} 
                        disabled={modalLoadingId === tierList.id}
                      >
                        {modalLoadingId === tierList.id ? (
                          <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Завантаження...</>
                        ) : 'Переглянути і модерувати'}
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-5">
              <Button disabled={page === 1} onClick={() => setPage(page - 1)}>Назад</Button>
              <span className="d-flex align-items-center px-3">Сторінка {page} з {totalPages}</span>
              <Button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Далі</Button>
            </div>
          )}
        </>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedTierList?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <p><strong>Автор:</strong> {selectedTierList?.username}</p>
            <p><strong>Опис:</strong> {selectedTierList?.description || 'Не має'}</p>
            <p><strong>Фільмів:</strong> {selectedTierList?.items.length}</p>
          </div>

          <h6>Тір ліст:</h6>
          <div className="tier-list-preview mb-4">
            {currentTiersConfig.map(tier => {
              const tierItems = groupedByTier[tier.id] || [];
              if (tierItems.length === 0) return null;

              return (
                <div key={tier.id} className="tier-row mb-3">
                  <div 
                    className="tier-label"
                    style={{ backgroundColor: tier.color, minWidth: '60px' }}
                  >
                    <strong>{tier.name}</strong>
                  </div>
                  <div className="tier-content flex-grow-1">
                    <div className="d-flex flex-wrap gap-2">
                      {tierItems.map(item => (
                        <div key={item.id} className="tier-item-small">
                          {item.moviePosterUrl ? (
                            <img 
                              src={item.moviePosterUrl} 
                              alt={item.movieTitle}
                              title={item.movieTitle}
                              style={{ maxHeight: '80px', maxWidth: '60px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ width: '60px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ddd', fontSize: '10px', textAlign: 'center' }}>
                              {item.movieTitle}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <hr />

          <h6>Модерація</h6>
          <Form.Group className="mb-3">
            <Form.Label>Статус</Form.Label>
            <Form.Select value={moderationStatus} onChange={(e) => setModerationStatus(e.target.value)}>
              <option value="Rejected">Відхилити</option>
              <option value="Approved">Схвалити</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Коментар (опційно)</Form.Label>
            <Form.Control as="textarea" rows={3} value={adminComment} onChange={(e) => setAdminComment(e.target.value)} placeholder="Введіть коментар для користувача" />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Скасувати</Button>
          <Button variant={moderationStatus === 'Approved' ? 'success' : 'danger'} onClick={handleModerate} disabled={moderating}>
            {moderating ? 'Обробка...' : moderationStatus === 'Approved' ? 'Схвалити' : 'Відхилити'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default AdminTierListModerationPage;