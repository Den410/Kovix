import { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Alert, Badge, Modal, Form, Row, Col } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { forumAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function ForumCategoryPage() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState('');

    useEffect(() => {
        loadTopics();
    }, [id]);

    const loadTopics = async () => {
        setLoading(true);
        try {
            const response = await forumAPI.getTopics(id);
            setTopics(response.data);
        } catch (err) {
            console.error('Помилка завантаження тем:', err);
            setError('Не вдалося завантажити теми цієї категорії.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTopic = async () => {
        if (!newTitle.trim() || !newContent.trim()) {
            setCreateError('Назва теми та повідомлення не можуть бути порожніми.');
            return;
        }

        setCreating(true);
        setCreateError('');

        try {
            const response = await forumAPI.createTopic({
                categoryId: parseInt(id),
                title: newTitle,
                firstPostContent: newContent
            });
            
            setShowModal(false);
            setNewTitle('');
            setNewContent('');
            
            navigate(`/forum/topic/${response.data.topicId}`);
        } catch (err) {
            console.error('Помилка створення теми:', err);
            setCreateError('Помилка при створенні теми. Спробуйте ще раз.');
        } finally {
            setCreating(false);
        }
    };

    return (
        <Container className="mt-4 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <Button variant="outline-secondary" onClick={() => navigate('/forum')}>
                    ← Назад до форуму
                </Button>

                {user ? (
                    <Button variant="primary" onClick={() => setShowModal(true)}>
                        + Створити тему
                    </Button>
                ) : (
                    <Alert variant="info" className="mb-0 py-2">
                        <Link to="/login">Увійдіть</Link>, щоб створювати теми.
                    </Alert>
                )}
            </div>

            <h3 className="mb-4" style={{ color: 'var(--text-main)' }}>📋 Теми обговорень</h3>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" style={{ color: 'var(--text-main)' }} />
                </div>
            ) : (
                <Card className="shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                    <Card.Body className="p-0">
                        {topics.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                У цій категорії ще немає тем. Будьте першим!
                            </div>
                        ) : (
                            topics.map((topic, index) => (
                                <Link 
                                    key={topic.id} 
                                    to={`/forum/topic/${topic.id}`}
                                    className="text-decoration-none d-block"
                                    style={{ color: 'inherit' }}
                                >
                                    <div 
                                        className="p-3 hover-card"
                                        style={{ 
                                            borderBottom: index !== topics.length - 1 ? '1px solid var(--border-color)' : 'none',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-main)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <Row className="align-items-center">
                                            <Col xs={12} md={8} className="mb-2 mb-md-0">
                                                <h5 className="mb-1 fw-bold" style={{ color: 'var(--primary-color, #0d6efd)' }}>
                                                    {topic.isPinned && <span className="me-2" title="Закріплено">📌</span>}
                                                    {topic.isClosed && <span className="me-2" title="Закрито">🔒</span>}
                                                    {topic.title}
                                                </h5>
                                                <div className="text-muted small">
                                                    Автор: <strong style={{ color: 'var(--text-main)' }}>{topic.authorName}</strong> • {new Date(topic.createdAt).toLocaleDateString('uk-UA')}
                                                </div>
                                            </Col>
                                            <Col xs={12} md={4} className="text-md-end text-muted small">
                                                <span className="me-3">💬 {topic.repliesCount} відп.</span>
                                                <span>👁️ {topic.viewsCount} перегл.</span>
                                            </Col>
                                        </Row>
                                    </div>
                                </Link>
                            ))
                        )}
                    </Card.Body>
                </Card>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
                    <Modal.Title>Нова тема</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>
                    {createError && <Alert variant="danger">{createError}</Alert>}
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Заголовок теми *</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Наприклад: Враження від нового Дедпула"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            maxLength={150}
                            style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Перше повідомлення *</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={6}
                            placeholder="Напишіть ваше повідомлення тут..."
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-color)' }}>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Скасувати
                    </Button>
                    <Button variant="primary" onClick={handleCreateTopic} disabled={creating}>
                        {creating ? 'Створення...' : 'Створити тему'}
                    </Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
}

export default ForumCategoryPage;