import { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Alert, Form, Row, Col, Badge, InputGroup } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { forumAPI } from '../services/api';
import { API_BASE_URL } from '../utils/apiConfig';
import { useAuth } from '../contexts/AuthContext';
import defaultAvatar from '../assets/NotFoundAvatar.png';

const getRoleBadge = (role) => {
    if (role === 'Admin') return <Badge bg="danger" className="mt-1">Адміністратор</Badge>;
    if (role === 'Moderator') return <Badge bg="success" className="mt-1">Модератор</Badge>;
    if (role === 'Reviewer') return <Badge bg="info" className="mt-1">Критик</Badge>;
    return <Badge bg="secondary" className="mt-1">Користувач</Badge>;
};

const CommentNode = ({ post, level = 0, user, isModOrAdmin, topicIsClosed, handleCreatePost, handleDeletePost, handleSavePostEdit }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(post.content);
    const [processing, setProcessing] = useState(false);

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [visibleReplies, setVisibleReplies] = useState(3); 

    const isAuthor = user && user.id === post.authorId;
    const canEditPost = isAuthor; 
    const canDeletePost = isAuthor || isModOrAdmin; 

    const marginLeft = level > 0 ? `${Math.min(level * 2.5, 10)}rem` : '0';

    const onReplySubmit = async () => {
        setProcessing(true);
        const success = await handleCreatePost(replyText, post.id);
        setProcessing(false);
        if (success) {
            setIsReplying(false);
            setReplyText('');
            setVisibleReplies(9999); 
        }
    };

    const onEditSubmit = async () => {
        setProcessing(true);
        const success = await handleSavePostEdit(post.id, editText);
        setProcessing(false);
        if (success) { setIsEditing(false); }
    };

    const countAllChildren = (node) => {
        if (!node.children || node.children.length === 0) return 0;
        return node.children.length + node.children.reduce((acc, child) => acc + countAllChildren(child), 0);
    };

    if (isCollapsed) {
        const totalHidden = countAllChildren(post);
        return (
            <div style={{ marginLeft: marginLeft, borderLeft: level > 0 ? '2px solid var(--border-color)' : 'none', paddingLeft: level > 0 ? '15px' : '0' }}>
                <div 
                    className="mb-3 text-muted small p-2 rounded d-inline-block hover-card" 
                    style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', cursor: 'pointer' }} 
                    onClick={() => setIsCollapsed(false)}
                    title="Розгорнути гілку"
                >
                    <span className="me-2 text-primary fw-bold">[+]</span>
                    <strong style={{ color: 'var(--primary-color)' }}>{post.authorName}</strong> 
                    <span className="ms-2">{new Date(post.createdAt).toLocaleDateString('uk-UA')}</span>
                    <span className="ms-2 fst-italic">({totalHidden + 1} повідомлень згорнуто)</span>
                </div>
            </div>
        );
    }

    return (
        <div style={{ marginLeft: marginLeft, borderLeft: level > 0 ? '2px solid var(--border-color)' : 'none', paddingLeft: level > 0 ? '15px' : '0' }}>
            <Card className="mb-3 shadow-sm border-0" style={{ backgroundColor: 'var(--bg-card)' }}>
                <Card.Body className="p-0">
                    <Row className="g-0">
                        <Col xs={12} sm={3} lg={2} className="p-3 text-center border-sm-end" style={{ borderColor: 'var(--border-color) !important', backgroundColor: 'var(--bg-main)' }}>
                            <Link to={`/profile/${post.authorId}`} className="text-decoration-none">
                                <div className="rounded-circle mx-auto mb-2 overflow-hidden" style={{ width: '50px', height: '50px', border: '2px solid var(--border-color)' }}>
                                    <img src={post.authorAvatarUrl ? `${API_BASE_URL}${post.authorAvatarUrl}` : defaultAvatar} alt={post.authorName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <strong style={{ color: 'var(--primary-color, #0d6efd)', fontSize: '0.9rem' }}>{post.authorName}</strong>
                            </Link>
                            <div className="mt-1" style={{ fontSize: '0.75rem' }}>{getRoleBadge(post.authorRole)}</div>
                        </Col>

                        <Col xs={12} sm={9} lg={10} className="p-3 d-flex flex-column">
                            <div className="text-muted small border-bottom pb-2 mb-3 d-flex justify-content-between align-items-center flex-wrap" style={{ borderColor: 'var(--border-color) !important' }}>
                                <div>
                                    <span 
                                        className="me-2 fw-bold text-secondary" 
                                        style={{ cursor: 'pointer' }} 
                                        onClick={() => setIsCollapsed(true)}
                                        title="Згорнути гілку"
                                    >
                                        [–]
                                    </span>
                                    <span>{new Date(post.createdAt).toLocaleString('uk-UA')}</span>
                                    {post.updatedAt && <span className="ms-2 fst-italic" title={`Оновлено: ${new Date(post.updatedAt).toLocaleString('uk-UA')}`}>(ред.)</span>}
                                </div>
                                
                                <div className="d-flex gap-2 mt-2 mt-sm-0">
                                    {user && !topicIsClosed && (
                                        <Button variant="link" size="sm" className="text-primary p-0 text-decoration-none" onClick={() => { setIsReplying(!isReplying); setReplyText(''); }}>
                                            💬 Відповісти
                                        </Button>
                                    )}
                                    {canEditPost && !isEditing && (
                                        <Button variant="link" size="sm" className="text-secondary p-0 ms-2 text-decoration-none" onClick={() => { setIsEditing(true); setEditText(post.content); }}>
                                            ✏️ Редагувати
                                        </Button>
                                    )}
                                    {canDeletePost && (
                                        <Button variant="link" size="sm" className="text-danger p-0 ms-2 text-decoration-none" onClick={() => handleDeletePost(post.id)}>
                                            🗑️ Видалити
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="post-content flex-grow-1" style={{ color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: '1.5', fontSize: '0.95rem' }}>
                                {isEditing ? (
                                    <div className="edit-mode">
                                        <Form.Control as="textarea" rows={3} value={editText} onChange={(e) => setEditText(e.target.value)} style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }} />
                                        <div className="mt-2 d-flex gap-2 justify-content-end">
                                            <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)}>Скасувати</Button>
                                            <Button variant="success" size="sm" onClick={onEditSubmit} disabled={processing}>{processing ? 'Збереження...' : 'Зберегти'}</Button>
                                        </div>
                                    </div>
                                ) : (
                                    post.content
                                )}
                            </div>

                            {isReplying && (
                                <div className="mt-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                                    <Form.Control as="textarea" rows={2} placeholder={`Відповідь для ${post.authorName}...`} value={replyText} onChange={(e) => setReplyText(e.target.value)} style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem' }} />
                                    <div className="mt-2 d-flex justify-content-end gap-2">
                                        <Button variant="secondary" size="sm" onClick={() => setIsReplying(false)}>Скасувати</Button>
                                        <Button variant="primary" size="sm" onClick={onReplySubmit} disabled={processing}>{processing ? 'Відправка...' : 'Відправити'}</Button>
                                    </div>
                                </div>
                            )}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {post.children && post.children.length > 0 && (
                <div className="replies-container">
                    {post.children.slice(0, visibleReplies).map(childPost => (
                        <CommentNode 
                            key={childPost.id} 
                            post={childPost} 
                            level={level + 1} 
                            user={user} 
                            isModOrAdmin={isModOrAdmin} 
                            topicIsClosed={topicIsClosed}
                            handleCreatePost={handleCreatePost} 
                            handleDeletePost={handleDeletePost} 
                            handleSavePostEdit={handleSavePostEdit} 
                        />
                    ))}
                    
                    {post.children.length > visibleReplies && (
                        <div style={{ marginLeft: `${Math.min((level + 1) * 2.5, 10)}rem`, paddingLeft: '15px', borderLeft: '2px solid var(--border-color)' }}>
                            <Button 
                                variant="link" 
                                size="sm" 
                                className="text-decoration-none p-0 mb-3"
                                style={{ color: 'var(--primary-color)' }}
                                onClick={() => setVisibleReplies(prev => prev + 5)} // Завантажуємо ще +5 коментарів
                            >
                                ↪ Показати ще {post.children.length - visibleReplies} відповідей...
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

function ForumTopicPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [topicData, setTopicData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [replyContent, setReplyContent] = useState('');
    const [replying, setReplying] = useState(false);

    const [editingTopic, setEditingTopic] = useState(false);
    const [editTopicTitle, setEditTopicTitle] = useState('');

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => { loadTopic(); }, [id]);

    const loadTopic = async () => {
        try {
            const response = await forumAPI.getTopic(id);
            setTopicData(response.data);
            setEditTopicTitle(response.data.title);
        } catch (err) { setError('Не вдалося завантажити тему.'); } 
        finally { setLoading(false); }
    };

    const handleCreatePost = async (content, parentId = null) => {
        if (!content.trim()) return false;
        setReplying(true);
        try {
            await forumAPI.createPost(id, { content: content, parentPostId: parentId });
            if (!parentId) setReplyContent('');
            await loadTopic(); 
            return true;
        } catch (err) { alert('Помилка при відправці.'); return false; } 
        finally { setReplying(false); }
    };

    const handleDeletePost = async (postId) => {
        if (window.confirm('Видалити це повідомлення? Всі відповіді на нього також зникнуть!')) {
            try {
                await forumAPI.deletePost(postId);
                setTopicData(prev => ({ ...prev, posts: prev.posts.filter(p => p.id !== postId) }));
            } catch (err) { alert('Помилка при видаленні.'); }
        }
    };

    const handleSavePostEdit = async (postId, newContent) => {
        if (!newContent.trim()) return false;
        try {
            await forumAPI.updatePost(postId, { content: newContent });
            await loadTopic(); 
            return true;
        } catch (err) { alert('Помилка при редагуванні.'); return false; }
    };

    const handleSaveTopicEdit = async () => {
        if (!editTopicTitle.trim()) return;
        try {
            await forumAPI.updateTopic(id, { title: editTopicTitle });
            setEditingTopic(false); setTopicData(prev => ({ ...prev, title: editTopicTitle }));
        } catch (err) { alert('Помилка при редагуванні назви.'); }
    };

    const buildCommentTree = (posts) => {
        const postMap = new Map();
        const roots = [];
        posts.forEach(post => { postMap.set(post.id, { ...post, children: [] }); });
        postMap.forEach(post => {
            if (post.parentPostId && postMap.has(post.parentPostId)) {
                postMap.get(post.parentPostId).children.push(post);
            } else {
                roots.push(post);
            }
        });
        return roots;
    };

    if (loading) return <Container className="text-center py-5 mt-5"><Spinner animation="border" style={{ color: 'var(--text-main)' }} /></Container>;
    if (error || !topicData) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

    const isModOrAdmin = user?.role === 'Admin' || user?.role === 'Moderator';
    const canEditTopicTitle = user && user.id === topicData.authorId;

    const filteredPosts = topicData.posts.filter(p => 
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.authorName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const commentTree = buildCommentTree(filteredPosts);

    return (
        <Container className="mt-4 mb-5">
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <Button variant="outline-secondary" onClick={() => navigate(-1)}>← Назад</Button>
                    <InputGroup style={{ width: '250px' }}>
                        <InputGroup.Text style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>🔍</InputGroup.Text>
                        <Form.Control placeholder="Пошук у темі..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }} />
                    </InputGroup>
                </div>

                <div className="d-flex align-items-center gap-3">
                    {editingTopic ? (
                        <div className="d-flex w-100 gap-2">
                            <Form.Control type="text" value={editTopicTitle} onChange={(e) => setEditTopicTitle(e.target.value)} style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)' }} />
                            <Button variant="success" onClick={handleSaveTopicEdit}>Зберегти</Button>
                            <Button variant="secondary" onClick={() => setEditingTopic(false)}>Скасувати</Button>
                        </div>
                    ) : (
                        <h3 className="mb-0" style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>
                            {topicData.isClosed && <span className="me-2" title="Закрито">🔒</span>}
                            {topicData.title}
                            {canEditTopicTitle && <Button variant="link" className="text-muted p-0 ms-3" onClick={() => setEditingTopic(true)}>✏️</Button>}
                        </h3>
                    )}
                </div>
                <div className="text-muted mt-2">Категорія: <strong>{topicData.categoryName}</strong></div>
            </div>

            <div className="forum-posts-container mb-4">
                {commentTree.length === 0 ? (
                    <div className="text-center py-4 text-muted">Повідомлень не знайдено.</div>
                ) : (
                    commentTree.map(rootPost => (
                        <CommentNode 
                            key={rootPost.id} 
                            post={rootPost} 
                            level={0} 
                            user={user} 
                            isModOrAdmin={isModOrAdmin} 
                            topicIsClosed={topicData.isClosed}
                            handleCreatePost={handleCreatePost}
                            handleDeletePost={handleDeletePost}
                            handleSavePostEdit={handleSavePostEdit}
                        />
                    ))
                )}
            </div>

            {topicData.isClosed ? (
                <Alert variant="warning" className="text-center">🔒 Ця тема закрита для нових повідомлень.</Alert>
            ) : user ? (
                <Card className="shadow-sm border-0 mt-4" style={{ backgroundColor: 'var(--bg-card)' }}>
                    <Card.Body>
                        <h5 className="mb-3" style={{ color: 'var(--text-main)' }}>Написати в тему</h5>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Control as="textarea" rows={4} placeholder="Ваше повідомлення..." value={replyContent} onChange={(e) => setReplyContent(e.target.value)} style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)' }} />
                            </Form.Group>
                            <div className="d-flex justify-content-end">
                                <Button variant="primary" onClick={() => handleCreatePost(replyContent, null)} disabled={replying}>{replying ? 'Відправка...' : 'Відправити'}</Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            ) : (
                <Alert variant="info" className="text-center"><Link to="/login">Увійдіть</Link>, щоб залишити повідомлення.</Alert>
            )}
        </Container>
    );
}

export default ForumTopicPage;