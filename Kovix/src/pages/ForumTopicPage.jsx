import { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Alert, Form, Row, Col, Badge } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { forumAPI} from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import defaultAvatar from '../assets/NotFoundAvatar.png'; 
import { API_BASE_URL } from '../utils/apiConfig';

function ForumTopicPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [topicData, setTopicData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [replyContent, setReplyContent] = useState('');
    const [replying, setReplying] = useState(false);
    const [replyError, setReplyError] = useState('');

    useEffect(() => {
        loadTopic();
    }, [id]);

    const loadTopic = async () => {
        setLoading(true);
        try {
            const response = await forumAPI.getTopic(id);
            setTopicData(response.data);
        } catch (err) {
            console.error('Помилка завантаження теми:', err);
            setError('Не вдалося завантажити тему. Можливо, вона була видалена.');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async () => {
        if (!replyContent.trim()) {
            setReplyError('Повідомлення не може бути порожнім.');
            return;
        }

        setReplying(true);
        setReplyError('');

        try {
            await forumAPI.createPost(id, { content: replyContent });
            setReplyContent(''); 
            await loadTopic();   
        } catch (err) {
            console.error('Помилка відправки відповіді:', err);
            setReplyError('Помилка при відправці. Спробуйте ще раз.');
        } finally {
            setReplying(false);
        }
    };

    const getRoleBadge = (role) => {
        if (role === 'Admin') return <Badge bg="danger" className="mt-1">Адміністратор</Badge>;
        if (role === 'Moderator') return <Badge bg="success" className="mt-1">Модератор</Badge>;
        if (role === 'Reviewer') return <Badge bg="info" className="mt-1">Критик</Badge>;
        return <Badge bg="secondary" className="mt-1">Користувач</Badge>;
    };

    if (loading) {
        return (
            <Container className="text-center py-5 mt-5">
                <Spinner animation="border" style={{ color: 'var(--text-main)' }} />
            </Container>
        );
    }

    if (error || !topicData) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
                <Button variant="outline-secondary" onClick={() => navigate(-1)}>Повернутися назад</Button>
            </Container>
        );
    }

    return (
        <Container className="mt-4 mb-5">
            <div className="mb-4">
                <Button variant="outline-secondary" className="mb-3" onClick={() => navigate(-1)}>
                    ← Назад до списку тем
                </Button>
                <h3 style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>
                    {topicData.isClosed && <span className="me-2" title="Закрито">🔒</span>}
                    {topicData.title}
                </h3>
                <div className="text-muted">
                    Категорія: <strong>{topicData.categoryName}</strong>
                </div>
            </div>

            {/* Список повідомлень */}
            <div className="forum-posts-container mb-4">
                {topicData.posts.map((post, index) => (
                    <Card 
                        key={post.id} 
                        className="mb-3 shadow-sm border-0" 
                        style={{ backgroundColor: 'var(--bg-card)' }}
                    >
                        <Card.Body className="p-0">
                            <Row className="g-0">
                                <Col xs={12} md={3} lg={2} className="p-3 text-center border-md-end" style={{ borderColor: 'var(--border-color) !important', backgroundColor: 'var(--bg-main)' }}>
                                    <Link to={`/profile/${post.authorId}`} className="text-decoration-none">
                                        <div 
                                            className="rounded-circle mx-auto mb-2 overflow-hidden" 
                                            style={{ width: '80px', height: '80px', border: '2px solid var(--border-color)' }}
                                        >
                                            <img 
                                                src={post.authorAvatarUrl ? `${API_BASE_URL}${post.authorAvatarUrl}` : defaultAvatar} 
                                                alt={post.authorName}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <strong style={{ color: 'var(--primary-color, #0d6efd)', fontSize: '1.1rem' }}>
                                            {post.authorName}
                                        </strong>
                                    </Link>
                                    <div className="mt-1">
                                        {getRoleBadge(post.authorRole)}
                                    </div>
                                    <div className="text-muted small mt-2">
                                        Повідомлення #{index + 1}
                                    </div>
                                </Col>

                                <Col xs={12} md={9} lg={10} className="p-3 d-flex flex-column">
                                    <div className="text-muted small border-bottom pb-2 mb-3 d-flex justify-content-between" style={{ borderColor: 'var(--border-color) !important' }}>
                                        <span>Написано: {new Date(post.createdAt).toLocaleString('uk-UA')}</span>
                                    </div>
                                    <div 
                                        className="post-content flex-grow-1" 
                                        style={{ color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}
                                    >
                                        {post.content}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                ))}
            </div>

            {topicData.isClosed ? (
                <Alert variant="warning" className="text-center">
                    🔒 Ця тема закрита для нових повідомлень.
                </Alert>
            ) : user ? (
                <Card className="shadow-sm border-0 mt-4" style={{ backgroundColor: 'var(--bg-card)' }}>
                    <Card.Body>
                        <h5 className="mb-3" style={{ color: 'var(--text-main)' }}>Додати відповідь</h5>
                        {replyError && <Alert variant="danger">{replyError}</Alert>}
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Control 
                                    as="textarea" 
                                    rows={5} 
                                    placeholder="Напишіть ваше повідомлення..."
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}
                                />
                            </Form.Group>
                            <div className="d-flex justify-content-end">
                                <Button variant="primary" onClick={handleReply} disabled={replying}>
                                    {replying ? 'Відправка...' : 'Відправити'}
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            ) : (
                <Alert variant="info" className="text-center">
                    <Link to="/login">Увійдіть</Link>, щоб залишити повідомлення у цій темі.
                </Alert>
            )}
        </Container>
    );
}

export default ForumTopicPage;