import { useState, useEffect } from 'react';
import { Container, Card, Spinner, Alert, Badge, Button, Modal, Form, Pagination, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { forumAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function ForumPage() {
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pageSuccess, setPageSuccess] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 

    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [targetCategoryId, setTargetCategoryId] = useState(null);
    const [catName, setCatName] = useState('');
    const [catDesc, setCatDesc] = useState('');
    const [processing, setProcessing] = useState(false);
    const [modalError, setModalError] = useState('');

    useEffect(() => { loadCategories(); }, []);

    useEffect(() => { setCurrentPage(1); }, [searchQuery]);

    const loadCategories = async () => {
        try {
            const response = await forumAPI.getCategories();
            setCategories(response.data);
        } catch (err) { setError('Не вдалося завантажити категорії.'); } 
        finally { setLoading(false); }
    };

    const showGlobalSuccess = (message) => {
        setPageSuccess(message);
        setTimeout(() => setPageSuccess(''), 3000);
    };

    const openCreateModal = () => {
        setEditMode(false); setTargetCategoryId(null); setCatName(''); setCatDesc(''); setModalError(''); setShowModal(true);
    };

    const openEditModal = (e, category) => {
        e.preventDefault(); 
        setEditMode(true); setTargetCategoryId(category.id); setCatName(category.name); setCatDesc(category.description); setModalError(''); setShowModal(true);
    };

    const handleSaveCategory = async () => {
        if (!catName.trim() || !catDesc.trim()) { setModalError('Заповніть усі поля!'); return; }
        setProcessing(true); setModalError('');
        try {
            if (editMode) {
                await forumAPI.updateCategory(targetCategoryId, { name: catName, description: catDesc });
                showGlobalSuccess('Категорію успішно оновлено!');
            } else {
                const response = await forumAPI.createCategory({ name: catName, description: catDesc });
                showGlobalSuccess(response.data.message);
            }
            loadCategories(); setShowModal(false);
        } catch (err) { setModalError('Помилка при збереженні.'); } 
        finally { setProcessing(false); }
    };

    const handleDeleteCategory = async (e, id) => {
        e.preventDefault();
        if (window.confirm('Видалити категорію та ВСІ теми в ній назавжди?')) {
            try {
                await forumAPI.deleteCategory(id);
                setCategories(prev => prev.filter(c => c.id !== id));
                showGlobalSuccess('Категорію успішно видалено!');
            } catch (err) { alert('Помилка видалення.'); }
        }
    };

    const isModOrAdmin = user?.role === 'Admin' || user?.role === 'Moderator';

    const filteredCategories = categories.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <Container className="mt-4 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <h2 style={{ color: 'var(--text-main)' }}>💬 Форум Kovix</h2>
                {user && (
                    <Button variant={isModOrAdmin ? "success" : "outline-primary"} onClick={openCreateModal}>
                        {isModOrAdmin ? "+ Створити категорію" : "💡 Запропонувати категорію"}
                    </Button>
                )}
            </div>

            <div className="mb-4">
                <InputGroup>
                    <InputGroup.Text style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>🔍</InputGroup.Text>
                    <Form.Control
                        placeholder="Пошук категорій..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}
                    />
                </InputGroup>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}
            {pageSuccess && <Alert variant="success">{pageSuccess}</Alert>}

            {loading ? (
                <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--text-main)' }} /></div>
            ) : (
                <>
                    <Card className="shadow-sm mb-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                        <Card.Body className="p-0">
                            {currentCategories.length === 0 ? (
                                <div className="text-center py-4 text-muted">Категорій не знайдено.</div>
                            ) : (
                                currentCategories.map((category, index) => (
                                    <Link key={category.id} to={`/forum/category/${category.id}`} className="text-decoration-none d-block" style={{ color: 'inherit' }}>
                                        <div className="p-3 d-flex justify-content-between align-items-center hover-card" style={{ borderBottom: index !== currentCategories.length - 1 ? '1px solid var(--border-color)' : 'none', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-main)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                            <div>
                                                <h5 className="mb-1 fw-bold" style={{ color: 'var(--primary-color, #0d6efd)' }}>{category.name}</h5>
                                                <p className="mb-0 text-muted small">{category.description}</p>
                                            </div>
                                            <div className="d-flex align-items-center gap-3">
                                                <Badge bg="secondary" pill className="px-3 py-2">{category.topicsCount} тем</Badge>
                                                {isModOrAdmin && (
                                                    <div className="d-flex gap-2">
                                                        <Button variant="outline-info" size="sm" className="px-2 py-1" onClick={(e) => openEditModal(e, category)} title="Редагувати">✏️</Button>
                                                        <Button variant="danger" size="sm" className="px-2 py-1" onClick={(e) => handleDeleteCategory(e, category.id)} title="Видалити">🗑️</Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </Card.Body>
                    </Card>

                    {totalPages > 1 && (
                        <Pagination className="justify-content-center">
                            <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} />
                            {[...Array(totalPages)].map((_, i) => (
                                <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>
                                    {i + 1}
                                </Pagination.Item>
                            ))}
                            <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} />
                        </Pagination>
                    )}
                </>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
                    <Modal.Title>{editMode ? 'Редагування категорії' : (isModOrAdmin ? 'Нова категорія' : 'Запропонувати категорію')}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>
                    {modalError && <Alert variant="danger">{modalError}</Alert>}
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Назва *</Form.Label>
                            <Form.Control type="text" value={catName} onChange={(e) => setCatName(e.target.value)} style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Опис *</Form.Label>
                            <Form.Control as="textarea" rows={3} value={catDesc} onChange={(e) => setCatDesc(e.target.value)} style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-color)' }}>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Закрити</Button>
                    <Button variant="primary" onClick={handleSaveCategory} disabled={processing}>
                        {processing ? 'Збереження...' : (editMode ? 'Оновити' : 'Створити')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default ForumPage;