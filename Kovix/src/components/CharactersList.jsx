import { useState, useEffect } from 'react';
import { Spinner, Alert, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { charactersAPI, actorsAPI } from '../services/api';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaChevronDown } from 'react-icons/fa';
import defaultPosterImg from '../assets/NotFoundPoster.webp';

const API_BASE_URL = 'http://localhost:5096';

const CharactersList = ({ movieId, refreshKey = 0 }) => {
    const { isAdmin } = useAuth();
    
    const [characters, setCharacters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [allActors, setAllActors] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [visibleCount, setVisibleCount] = useState(5); 

    const [formData, setFormData] = useState({
        characterId: null,
        characterName: '',
        imageUrl: '',
        voiceActors: [] 
    });

    const loadCharacters = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/movies/${movieId}/characters`, {
                headers: { 'Authorization': token ? `Bearer ${token}` : '' }
            });

            if (!response.ok) throw new Error(`Помилка сервера: ${response.status}`);

            const data = await response.json();
            setCharacters(data);
        } catch (err) {
            console.error("❌ Помилка завантаження:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (movieId) {
            loadCharacters();
            setVisibleCount(5); 
            setSearchTerm('');
        }
    }, [movieId, refreshKey]);

    useEffect(() => {
        if (showModal && allActors.length === 0) {
            actorsAPI.getAll().then(res => {
                if (res.data && Array.isArray(res.data)) {
                    setAllActors(res.data);
                } else if (res.data && res.data.items) {
                    setAllActors(res.data.items);
                }
            }).catch(err => console.error("Помилка завантаження акторів:", err));
        }
    }, [showModal]);

    useEffect(() => {
        setVisibleCount(5);
    }, [searchTerm]);

    const getImageUrl = (url) => {
        if (!url) return defaultPosterImg;
        if (url.startsWith('http')) return url;
        return `${API_BASE_URL}${url}`;
    };

    const handleShowAdd = () => {
        setIsEditing(false);
        setFormData({
            characterId: null,
            characterName: '',
            imageUrl: '',
            voiceActors: []
        });
        setShowModal(true);
    };

    const handleShowEdit = (char) => {
        setIsEditing(true);
        setFormData({
            characterId: char.characterId,
            characterName: char.characterName || '',
            imageUrl: char.imageUrl || '',
            voiceActors: char.voiceActors ? char.voiceActors.map(va => ({
                personId: va.actorId,
                language: va.language || 'Japanese',
                isOriginal: va.isOriginal || false
            })) : []
        });
        setShowModal(true);
    };

    const addVoiceActorRow = () => {
        setFormData(prev => ({
            ...prev,
            voiceActors: [...prev.voiceActors, { personId: '', language: 'Japanese', isOriginal: false }]
        }));
    };

    const removeVoiceActorRow = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            voiceActors: prev.voiceActors.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleVoiceActorChange = (index, field, value) => {
        setFormData(prev => {
            const updated = [...prev.voiceActors];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, voiceActors: updated };
        });
    };

    const handleDelete = async (characterId, characterName) => {
        if (!window.confirm(`Видалити персонажа "${characterName}"? Це також видалить усі його ролі озвучки у цьому фільмі.`)) return;
        
        try {
            await charactersAPI.delete(movieId, characterId);
            loadCharacters(); 
        } catch (err) {
            console.error(err);
            alert("Помилка при видаленні персонажа.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            const payload = {
                characterName: formData.characterName,
                imageUrl: formData.imageUrl,
                voiceActors: formData.voiceActors
                    .filter(va => va.personId !== '') 
                    .map(va => ({
                        personId: parseInt(va.personId),
                        language: va.language,
                        isOriginal: va.isOriginal
                    }))
            };

            if (isEditing) {
                await charactersAPI.update(movieId, formData.characterId, payload);
            } else {
                await charactersAPI.create(movieId, payload);
            }
            
            setShowModal(false);
            loadCharacters();
        } catch (err) {
            console.error("Помилка збереження:", err);
            alert("Не вдалося зберегти персонажа.");
        } finally {
            setIsSaving(false);
        }
    };

    const filteredCharacters = characters.filter(char => {
        const term = searchTerm.toLowerCase();
        const matchCharName = char.characterName?.toLowerCase().includes(term);
        const matchActorData = char.voiceActors?.some(va => 
            va.actorName?.toLowerCase().includes(term) || 
            va.language?.toLowerCase().includes(term)
        );
        return matchCharName || matchActorData;
    });

    const visibleCharacters = filteredCharacters.slice(0, visibleCount);
    const hasMore = visibleCount < filteredCharacters.length;

    if (isLoading) return (
        <div className="text-center p-5">
            <Spinner animation="border" style={{ color: 'var(--primary-color)' }} />
            <div className="mt-2 text-muted">Завантаження персонажів...</div>
        </div>
    );

    if (error) return <Alert variant="danger">Помилка: {error}</Alert>;

    return (
        <div className="mt-4 p-4 rounded shadow-sm position-relative" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
            
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 pb-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <h5 className="mb-0 fw-bold">🎭 Персонажі та актори</h5>
                
                <div className="d-flex flex-column flex-sm-row gap-2 align-items-sm-center">
                    <div className="position-relative">
                        <FaSearch className="position-absolute top-50 translate-middle-y text-muted ms-2" />
                        <Form.Control
                            type="text"
                            placeholder="Пошук за ім'ям або мовою..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                paddingLeft: '32px', 
                                backgroundColor: 'var(--bg-main)', 
                                color: 'var(--text-main)', 
                                borderColor: 'var(--border-color)',
                                width: '250px'
                            }}
                        />
                    </div>

                    {isAdmin && isAdmin() && (
                        <Button variant="success" onClick={handleShowAdd} className="fw-bold d-flex align-items-center gap-1 text-nowrap">
                            <FaPlus /> Додати
                        </Button>
                    )}
                </div>
            </div>

            {(!characters || characters.length === 0) ? (
                <div className="text-center p-5 border rounded" style={{ borderStyle: 'dashed', borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                    <p className="mb-0 text-muted fs-5">У базі поки немає персонажів для цього фільму.</p>
                </div>
            ) : filteredCharacters.length === 0 ? (
                <div className="text-center p-4">
                    <p className="text-muted">За запитом <b>"{searchTerm}"</b> нічого не знайдено.</p>
                    <Button variant="outline-secondary" size="sm" onClick={() => setSearchTerm('')}>Очистити пошук</Button>
                </div>
            ) : (
                <div className="d-flex flex-column">
                    {visibleCharacters.map((char, index) => (
                        <div 
                            key={char.characterId || index} 
                            className="d-flex flex-column gap-3 py-3 position-relative" 
                            style={{ borderBottom: index !== visibleCharacters.length - 1 ? '1px solid var(--border-color)' : 'none' }}
                        >
                            <div className="d-flex justify-content-between align-items-start gap-3">
                                <Link 
                                    to={`/character/${char.characterId}`} 
                                    className="text-decoration-none text-reset flex-grow-1"
                                    style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                >
                                    <div className="d-flex align-items-start">
                                        <img
                                            src={getImageUrl(char.imageUrl)}
                                            alt={char.characterName}
                                            style={{ width: '65px', height: '95px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                            onError={(e) => { e.target.onerror = null; e.target.src = defaultPosterImg; }}
                                        />
                                        <div className="ms-3 mt-1">
                                            <div className="fw-bold" style={{ color: 'var(--primary-color)', fontSize: '1.05rem' }}>
                                                {char.characterName}
                                            </div>
                                            <div className="small mt-1" style={{ color: 'var(--text-main)', opacity: 0.8 }}>
                                                {char.voiceActors?.[0]?.isMainRole ? '🌟 Головний персонаж' : '👤 Другорядний персонаж'}
                                            </div>
                                        </div>
                                    </div>
                                </Link>

                                <div className="d-flex flex-column gap-3" style={{ minWidth: '220px' }}>
                                    {char.voiceActors && char.voiceActors.length > 0 ? (
                                        char.voiceActors.map((actor) => (
                                            <Link 
                                                key={actor.actorId} 
                                                to={`/voice-actor/${actor.actorId}`}
                                                className="text-decoration-none text-reset d-flex justify-content-end align-items-start"
                                                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                            >
                                                <div className="text-end me-3 mt-1">
                                                    <div className="fw-bold" style={{ color: 'var(--primary-color)', fontSize: '0.95rem' }}>
                                                        {actor.actorName}
                                                    </div>
                                                    <div className="small mt-1" style={{ color: 'var(--text-main)', opacity: 0.7 }}>
                                                        {actor.language} {actor.isOriginal ? '• Сейю' : ''}
                                                    </div>
                                                </div>
                                                <img
                                                    src={getImageUrl(actor.photoUrl)}
                                                    alt={actor.actorName}
                                                    style={{ width: '50px', height: '75px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = defaultPosterImg; }}
                                                />
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="text-end small fst-italic pe-3 mt-1" style={{ color: 'var(--text-main)', opacity: 0.6 }}>
                                            Актори не вказані
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isAdmin && isAdmin() && (
                                <div className="d-flex gap-2" style={{ width: 'fit-content' }}>
                                    <Button variant="outline-warning" size="sm" onClick={() => handleShowEdit(char)} title="Редагувати">
                                        <FaEdit /> Редагувати
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(char.characterId, char.characterName)} title="Видалити">
                                        <FaTrash /> Видалити
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {hasMore && (
                <div className="text-center mt-4 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <Button 
                        variant="outline-primary" 
                        onClick={() => setVisibleCount(prev => prev + 10)}
                        className="fw-bold px-4 py-2"
                        style={{ color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
                    >
                        <FaChevronDown className="me-2" />
                        Показати ще (залишилось {filteredCharacters.length - visibleCount})
                    </Button>
                </div>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered contentClassName="bg-card text-main border-secondary">
                <Modal.Header closeButton style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
                    <Modal.Title className="text-main fw-bold">{isEditing ? 'Редагувати персонажа' : 'Новий персонаж'}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Ім'я персонажа</Form.Label>
                                    <Form.Control 
                                        required
                                        type="text" 
                                        placeholder="Напр. Fushiguro Megumi"
                                        value={formData.characterName}
                                        onChange={(e) => setFormData({...formData, characterName: e.target.value})}
                                        style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>URL Зображення</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="https://..."
                                        value={formData.imageUrl}
                                        onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                                        style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="p-3 border rounded mt-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mb-0 fw-bold" style={{ color: 'var(--primary-color)' }}>🎙️ Актори озвучки</h6>
                                <Button variant="outline-success" size="sm" onClick={addVoiceActorRow}>
                                    <FaPlus className="me-1"/> Додати голос
                                </Button>
                            </div>

                            {formData.voiceActors.length === 0 ? (
                                <p className="text-muted small mb-0 text-center py-3">Голоси не додані. Персонаж буде без озвучки.</p>
                            ) : (
                                formData.voiceActors.map((va, index) => (
                                    <Row key={index} className="align-items-center mb-2 pb-2" style={{ borderBottom: '1px dashed var(--border-color)' }}>
                                        <Col md={4}>
                                            <Form.Select 
                                                required
                                                value={va.personId} 
                                                onChange={(e) => handleVoiceActorChange(index, 'personId', e.target.value)}
                                                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}
                                            >
                                                <option value="">Оберіть актора...</option>
                                                {allActors.map(a => (
                                                    <option key={a.id} value={a.id}>{a.name}</option>
                                                ))}
                                            </Form.Select>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Control 
                                                type="text" 
                                                placeholder="Мова (Japanese, English...)"
                                                required
                                                value={va.language}
                                                onChange={(e) => handleVoiceActorChange(index, 'language', e.target.value)}
                                                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}
                                            />
                                        </Col>
                                        <Col md={3}>
                                            <Form.Check 
                                                type="checkbox" 
                                                label="Оригінал (Сейю)"
                                                checked={va.isOriginal}
                                                onChange={(e) => handleVoiceActorChange(index, 'isOriginal', e.target.checked)}
                                                className="mt-2 text-main"
                                            />
                                        </Col>
                                        <Col md={1} className="text-end">
                                            <Button variant="outline-danger" size="sm" onClick={() => removeVoiceActorRow(index)}>
                                                <FaTrash />
                                            </Button>
                                        </Col>
                                    </Row>
                                ))
                            )}
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-4 pt-3">
                            <Button variant="secondary" onClick={() => setShowModal(false)}>Скасувати</Button>
                            <Button variant="primary" type="submit" disabled={isSaving} style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>
                                {isSaving ? <Spinner size="sm" /> : 'Зберегти персонажа'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default CharactersList;