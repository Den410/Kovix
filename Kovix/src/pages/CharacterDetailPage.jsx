import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Badge, Button, Modal, Form } from 'react-bootstrap';
import { charactersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FaEdit, FaTrash } from 'react-icons/fa';
import defaultPosterImg from '../assets/NotFoundPoster.webp';

const API_BASE_URL = 'http://localhost:5096';

function CharacterDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [character, setCharacter] = useState(null);
    const [voiceActors, setVoiceActors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [movieId, setMovieId] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({ characterName: '', imageUrl: '' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadCharacterData();
    }, [id]);

    const loadCharacterData = async () => {
        try {
            setLoading(true);
            const res = await charactersAPI.getById(id);

            if (res.data) {
                setCharacter({
                    characterId: res.data.id,
                    characterName: res.data.name,
                    imageUrl: res.data.imageUrl
                });

                const mappedActors = (res.data.voiceActors || []).map(va => ({
                    actorId: va.actorId,
                    actorName: va.name,
                    photoUrl: va.photoUrl,
                    language: va.language,
                    isOriginal: va.isOriginal,
                    isMainRole: va.isMainRole,
                    movieId: va.movieId,
                    movieTitle: va.title
                }));

                setVoiceActors(mappedActors);

                if (mappedActors.length > 0) {
                    setMovieId(mappedActors[0].movieId);
                }
            }
        } catch (error) {
            console.error("Помилка завантаження персонажа:", error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (url) => {
        if (!url) return defaultPosterImg;
        if (url.startsWith('http')) return url;
        return `${API_BASE_URL}${url}`;
    };

    const handleDelete = async () => {
        if (!window.confirm(`Видалити персонажа "${character.characterName}"? Це незворотня дія!`)) return;
        try {
            await charactersAPI.delete(movieId, id);
            navigate(-1);
        } catch (error) {
            console.error('Помилка видалення:', error);
            alert('Помилка при видаленні персонажа. Перевірте консоль.');
        }
    };

    const handleShowEdit = () => {
        setEditData({
            characterName: character.characterName || '',
            imageUrl: character.imageUrl || ''
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                characterName: editData.characterName,
                imageUrl: editData.imageUrl,
                voiceActors: voiceActors ? voiceActors.map(va => ({
                    personId: va.actorId,
                    language: va.language,
                    isOriginal: va.isOriginal
                })) : []
            };

            await charactersAPI.update(movieId, id, payload);
            setShowEditModal(false);
            loadCharacterData();
        } catch (error) {
            console.error('Помилка редагування:', error);
            alert('Не вдалося оновити персонажа.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" style={{ color: 'var(--primary-color)' }} /></Container>;
    if (!character) return <Container className="mt-5 text-center"><h2>Персонажа не знайдено</h2></Container>;

    return (
        <Container className="mt-5 mb-5">
            <Row>
                <Col md={4} className="mb-4">
                    <img
                        src={getImageUrl(character.imageUrl)}
                        alt={character.characterName}
                        className="img-fluid rounded shadow w-100"
                        style={{ objectFit: 'cover', maxHeight: '500px', border: '1px solid var(--border-color)' }}
                        onError={(e) => { e.target.onerror = null; e.target.src = defaultPosterImg; }}
                    />
                </Col>
                <Col md={8}>
                    <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                        <h1 className="display-4 fw-bold mb-0" style={{ color: 'var(--text-main)' }}>{character.characterName}</h1>
                        
                        {isAdmin && isAdmin() && (
                            <div className="d-flex gap-2">
                                <Button variant="warning" size="sm" onClick={handleShowEdit}>
                                    <FaEdit className="me-2" /> Редагувати
                                </Button>
                                <Button variant="danger" size="sm" onClick={handleDelete}>
                                    <FaTrash className="me-2" /> Видалити
                                </Button>
                            </div>
                        )}
                    </div>

                    {voiceActors && voiceActors.length > 0 ? (
                        <div className="mt-5">
                            <h4 className="border-bottom pb-2 mb-4" style={{ borderColor: 'var(--border-color)' }}>
                                Озвучка ({voiceActors.length})
                            </h4>
                            <Row>
                                {voiceActors.map((voiceActor, index) => (
                                    <Col xs={12} lg={6} key={`${voiceActor.actorId}-${index}`} className="mb-3 d-flex">
                                        <Link to={`/voice-actor/${voiceActor.actorId}`} className="text-decoration-none w-100">
                                            <div
                                                className="d-flex align-items-center gap-3 p-3 rounded h-100 shadow-sm"
                                                style={{ 
                                                    backgroundColor: 'var(--bg-card)', 
                                                    border: '1px solid var(--border-color)', 
                                                    transition: 'all 0.2s ease', 
                                                    minHeight: '120px' 
                                                }}
                                                onMouseEnter={(e) => { 
                                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                                                    e.currentTarget.style.borderColor = 'var(--primary-color)';
                                                }}
                                                onMouseLeave={(e) => { 
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,.075)';
                                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                                }}
                                            >
                                                <img
                                                    src={getImageUrl(voiceActor.photoUrl)}
                                                    alt={voiceActor.actorName}
                                                    className="rounded-circle flex-shrink-0"
                                                    style={{ width: '75px', height: '75px', objectFit: 'cover', border: '2px solid var(--border-color)' }}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = defaultPosterImg; }}
                                                />
                                                <div className="d-flex flex-column justify-content-center">
                                                    <div className="fw-bold" style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}>
                                                        {voiceActor.actorName}
                                                    </div>
                                                    
                                                    {voiceActor.movieTitle && (
                                                        <div className="small fw-semibold mt-1" style={{ color: 'var(--text-main)', opacity: 0.9 }}>
                                                            🎬 {voiceActor.movieTitle}
                                                        </div>
                                                    )}
                                                    <div className="text-muted small mb-2 mt-1">
                                                        🌍 {voiceActor.language}
                                                    </div>

                                                    <div className="d-flex flex-wrap gap-2 mt-1">
                                                        {voiceActor.isOriginal && <Badge bg="info" className="px-2 py-1">🎙️ Оригінальна</Badge>}
                                                        {voiceActor.isMainRole && <Badge bg="success" className="px-2 py-1">⭐ Головна роль</Badge>}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    ) : (
                        <div className="alert alert-info mt-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
                            Озвучка для цього персонажа не знайдена
                        </div>
                    )}
                </Col>
            </Row>

            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered contentClassName="bg-card text-main border-secondary">
                <Modal.Header closeButton style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
                    <Modal.Title>Редагувати персонажа</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: 'var(--bg-main)' }}>
                    <Form onSubmit={handleEditSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Ім'я персонажа</Form.Label>
                            <Form.Control
                                type="text"
                                required
                                value={editData.characterName}
                                onChange={(e) => setEditData({ ...editData, characterName: e.target.value })}
                                className="bg-input text-main border-secondary"
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label>URL Зображення</Form.Label>
                            <Form.Control
                                type="text"
                                value={editData.imageUrl}
                                onChange={(e) => setEditData({ ...editData, imageUrl: e.target.value })}
                                className="bg-input text-main border-secondary"
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Скасувати</Button>
                            <Button variant="warning" type="submit" disabled={isSaving}>
                                {isSaving ? <Spinner size="sm" /> : 'Зберегти зміни'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default CharacterDetailPage;