import { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Alert, Modal, Form, Row, Col, Pagination, InputGroup } from 'react-bootstrap';
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

    const [sortBy, setSortBy] = useState('popular');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [targetTopicId, setTargetTopicId] = useState(null);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [processing, setProcessing] = useState(false);
    const [modalError, setModalError] = useState('');

    useEffect(() => { loadTopics(); }, [id]);
    useEffect(() => { setCurrentPage(1); }, [searchQuery, sortBy]);

    const loadTopics = async () => {
        try {
            const response = await forumAPI.getTopics(id);
            setTopics(response.data);
        } catch (err) { setError('Не вдалося завантажити теми.'); } 
        finally { setLoading(false); }
    };

    const filteredTopics = topics.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.authorName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedTopics = [...filteredTopics].sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        switch (sortBy) {
            case 'popular': return b.viewsCount - a.viewsCount;
            case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
            case 'active': return b.repliesCount - a.repliesCount;
            case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
            default: return b.viewsCount - a.viewsCount;
        }
    });

    const totalPages = Math.ceil(sortedTopics.length / itemsPerPage);
    const currentTopics = sortedTopics.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const openCreateModal = () => { setEditMode(false); setTargetTopicId(null); setNewTitle(''); setNewContent(''); setModalError(''); setShowModal(true); };
    const openEditModal = (e, topic) => { e.preventDefault(); setEditMode(true); setTargetTopicId(topic.id); setNewTitle(topic.title); setModalError(''); setShowModal(true); };

    const handleSaveTopic = async () => {
        if (!newTitle.trim()) { setModalError('Заголовок теми не може бути порожнім.'); return; }
        if (!editMode && !newContent.trim()) { setModalError('Перше повідомлення не може бути порожнім.'); return; }

        setProcessing(true); setModalError('');
        try {
            if (editMode) {
                await forumAPI.updateTopic(targetTopicId, { title: newTitle });
                setTopics(prev => prev.map(t => t.id === targetTopicId ? { ...t, title: newTitle } : t));
                setShowModal(false);
            } else {
                const response = await forumAPI.createTopic({ categoryId: parseInt(id), title: newTitle, firstPostContent: newContent });
                setShowModal(false); navigate(`/forum/topic/${response.data.topicId}`);
            }
        } catch (err) { setModalError('Помилка при збереженні.'); } 
        finally { setProcessing(false); }
    };

    const handleDeleteTopic = async (e, topicId) => {
        e.preventDefault(); 
        if (window.confirm('Видалити цю тему та всі повідомлення в ній назавжди?')) {
            try {
                await forumAPI.deleteTopic(topicId);
                setTopics(prev => prev.filter(t => t.id !== topicId));
            } catch (err) { alert('Помилка при видаленні теми.'); }
        }
    };

    const isModOrAdmin = user?.role === 'Admin' || user?.role === 'Moderator';

    return (
        <Container className="mt-4 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <Button variant="outline-secondary" onClick={() => navigate('/forum')}>← Назад до форуму</Button>
                {user ? (
                    <Button variant="primary" onClick={openCreateModal}>+ Створити тему</Button>
                ) : (
                    <Alert variant="info" className="mb-0 py-2"><Link to="/login">Увійдіть</Link>, щоб створювати теми.</Alert>
                )}
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <h3 className="mb-0" style={{ color: 'var(--text-main)' }}>📋 Теми обговорень</h3>
                
                <div className="d-flex align-items-center gap-3 flex-wrap">
                    <InputGroup style={{ width: '250px' }}>
                        <InputGroup.Text style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>🔍</InputGroup.Text>
                        <Form.Control
                            placeholder="Знайти тему..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}
                        />
                    </InputGroup>

                    <Form.Select 
                        size="sm" 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)', width: 'auto', cursor: 'pointer', height: '38px' }}
                    >
                        <option value="popular">🔥 Найпопулярніші</option>
                        <option value="newest">✨ Найновіші</option>
                        <option value="active">💬 Найактивніші</option>
                        <option value="oldest">🕰️ Найстаріші</option>
                    </Form.Select>
                </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
                <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--text-main)' }} /></div>
            ) : (
                <>
                    <Card className="shadow-sm mb-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                        <Card.Body className="p-0">
                            {currentTopics.length === 0 ? (
                                <div className="text-center py-5 text-muted">Тем не знайдено.</div>
                            ) : (
                                currentTopics.map((topic, index) => {
                                    const canEditTopic = user && (user.id === topic.authorId || isModOrAdmin);
                                    return (
                                        <Link key={topic.id} to={`/forum/topic/${topic.id}`} className="text-decoration-none d-block" style={{ color: 'inherit' }}>
                                            <div className="p-3 hover-card" style={{ borderBottom: index !== currentTopics.length - 1 ? '1px solid var(--border-color)' : 'none', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-main)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
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
                                                    <Col xs={12} md={4}>
                                                        <div className="d-flex justify-content-md-end align-items-center mt-2 mt-md-0 gap-3">
                                                            <div className="text-muted small">
                                                                <span className="me-3">💬 {topic.repliesCount}</span>
                                                                <span>👁️ {topic.viewsCount}</span>
                                                            </div>
                                                            {(canEditTopic || isModOrAdmin) && (
                                                                <div className="d-flex gap-2">
                                                                    {canEditTopic && <Button variant="outline-info" size="sm" className="px-2 py-0" onClick={(e) => openEditModal(e, topic)} title="Редагувати">✏️</Button>}
                                                                    {isModOrAdmin && <Button variant="danger" size="sm" className="px-2 py-0" onClick={(e) => handleDeleteTopic(e, topic.id)} title="Видалити">🗑️</Button>}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </div>
                                        </Link>
                                    );
                                })
                            )}
                        </Card.Body>
                    </Card>

                    {totalPages > 1 && (
                        <Pagination className="justify-content-center">
                            <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} />
                            {[...Array(totalPages)].map((_, i) => (
                                <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>{i + 1}</Pagination.Item>
                            ))}
                            <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} />
                        </Pagination>
                    )}
                </>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
                    <Modal.Title>{editMode ? 'Редагувати назву теми' : 'Нова тема'}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>
                    {modalError && <Alert variant="danger">{modalError}</Alert>}
                    <Form.Group className="mb-3">
                        <Form.Label>Заголовок теми *</Form.Label>
                        <Form.Control type="text" placeholder="Наприклад: Враження від нового Дедпула" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} maxLength={150} style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }} />
                    </Form.Group>
                    {!editMode && (
                        <Form.Group className="mb-3">
                            <Form.Label>Перше повідомлення *</Form.Label>
                            <Form.Control as="textarea" rows={6} placeholder="Напишіть ваше повідомлення тут..." value={newContent} onChange={(e) => setNewContent(e.target.value)} style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }} />
                        </Form.Group>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-color)' }}>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Скасувати</Button>
                    <Button variant="primary" onClick={handleSaveTopic} disabled={processing}>{processing ? 'Збереження...' : (editMode ? 'Оновити' : 'Створити тему')}</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default ForumCategoryPage;