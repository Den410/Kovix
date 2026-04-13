import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { actorsAPI, contentFilterAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import defaultPosterImg from '../assets/NotFoundPoster.webp';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa'; 
import AdminActorModal from '../components/AdminActorModal';
import { API_BASE_URL } from '../utils/apiConfig';

function ActorDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    
    const [actor, setActor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isBlocked, setIsBlocked] = useState(false);
    
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        loadActorData();
    }, [id]);

    const loadActorData = async () => {
        try {
            const res = await actorsAPI.getById(id);
            setActor(res.data);
            if (user) {
                const blockedRes = await contentFilterAPI.getBlockedActors();
                const blockedIds = blockedRes.data.map(a => a.actorId);
                setIsBlocked(blockedIds.includes(parseInt(id)));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBlock = async () => {
        try {
            if (isBlocked) {
                await contentFilterAPI.unblockActor(id);
                setIsBlocked(false);
            } else {
                if (!window.confirm(`Ви впевнені? Фільми з актором ${actor.name} зникнуть з вашої стрічки.`)) return;
                await contentFilterAPI.blockActor(id);
                setIsBlocked(true);
            }
        } catch (error) {
            alert("Помилка при зміні статусу фільтра");
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Видалити актора? Це незворотня дія!")) {
            await actorsAPI.delete(id);
            navigate('/actors');
        }
    };

    const getPhotoUrl = (url) => {
        if (!url) return defaultPosterImg;
        if (url.startsWith('http')) return url;
        return `${API_BASE_URL}${url}`;
    };

    if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
    if (!actor) return <Container className="mt-5 text-center"><h2>Актора не знайдено</h2></Container>;

    return (
        <Container className="mt-5">
            <Row>
                <Col md={4} className="mb-4">
                    <img
                        src={getPhotoUrl(actor.photoUrl)}
                        alt={actor.name}
                        className="img-fluid rounded shadow w-100"
                        style={{ objectFit: 'cover', maxHeight: '500px', filter: isBlocked ? 'grayscale(100%) opacity(0.7)' : 'none'}}
                        onError={(e) => e.target.src = defaultPosterImg}
                    />
                    
                    {user && (
                        <div className="d-grid gap-2 mt-3">
                            <Button 
                                variant={isBlocked ? "success" : "outline-danger"} 
                                onClick={handleToggleBlock}
                            >
                                {isBlocked ? "✅ Розблокувати актора" : "🚫 Блокувати контент з ним"}
                            </Button>
                        </div>
                    )}

                    {isAdmin() && (
                        <div className="d-grid gap-2 mt-3">
                            <Button variant="success" onClick={() => setShowEditModal(true)}>
                                <FaEdit className="me-2" /> Редагувати актора
                            </Button>
                            <Button variant="danger" onClick={handleDelete}>
                                <FaTrash className="me-2" /> Видалити актора
                            </Button>
                        </div>
                    )}
                </Col>
                <Col md={8}>
                    <h1 className="display-4 fw-bold mb-3">{actor.name}</h1>

                    {actor.birthDate && (
                        <p className="text-muted fs-5">
                            📅 Дата народження: {new Date(actor.birthDate).toLocaleDateString('uk-UA')}
                        </p>
                    )}

                    <h4 className="mt-4 border-bottom pb-2" style={{ borderColor: 'var(--border-color)' }}>Біографія</h4>
                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{actor.bio || "Біографія відсутня."}</p>

                    {actor.movies && actor.movies.length > 0 && (
                        <div className="mt-5">
                            <h4 className="border-bottom pb-2 mb-4">Фільмографія ({actor.movies.length})</h4>
                            <Row>
                                {actor.movies.map(movie => (
                                    <Col xs={6} md={3} lg={2} key={movie.movieId} className="mb-4">
                                        <Link to={`/movie/${movie.movieId}`} className="text-decoration-none">
                                            <div className="position-relative shadow-sm rounded overflow-hidden movie-card-hover">
                                                <img
                                                    src={
                                                        movie.posterUrl
                                                            ? (movie.posterUrl.startsWith('http') ? movie.posterUrl : `${API_BASE_URL}${movie.posterUrl}`)
                                                            : defaultPosterImg
                                                    }
                                                    alt={movie.title}
                                                    className="w-100"
                                                    style={{ aspectRatio: '2/3', objectFit: 'cover' }}
                                                    onError={(e) => e.target.src = defaultPosterImg}
                                                />
                                            </div>
                                            <div className="mt-2">
                                                <div className="fw-bold text-main text-truncate" title={movie.title}>{movie.title}</div>
                                                <div className="text-muted small">{movie.year} • {movie.role}</div>
                                            </div>
                                        </Link>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    )}
                </Col>
            </Row>

            <style>{`
                .movie-card-hover { transition: transform 0.3s ease; }
                .movie-card-hover:hover { transform: translateY(-5px); }
            `}</style>

            {isAdmin() && (
                <AdminActorModal
                    show={showEditModal}
                    onHide={() => setShowEditModal(false)}
                    actorToEdit={actor}
                    onSuccess={loadActorData}
                />
            )}
        </Container>
    );
}

export default ActorDetailPage;