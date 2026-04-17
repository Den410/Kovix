import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { moviesAPI, actorsAPI } from '../services/api';
import { FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa'; 
import defaultAvatarImg from '../assets/NotFoundAvatar.png';
import { useAuth } from '../contexts/AuthContext';
import AdminActorModal from '../components/AdminActorModal';
import { API_BASE_URL } from '../utils/apiConfig';

function MovieCastPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth(); 

    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedActor, setSelectedActor] = useState(null);

    const loadMovieData = useCallback(() => {
        moviesAPI.getById(id)
            .then(res => {
                setMovie(res.data);
                setLoading(false);
            })
            .catch(_err => {
                console.error("Error loading cast:", _err);
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        loadMovieData();
    }, [loadMovieData]);

    const handleEditClick = (e, actor) => {
        e.preventDefault();
        setSelectedActor({
            id: actor.actorId,
            name: actor.name,
            photoUrl: actor.photoUrl,
            bio: actor.biography || '' 
        });
        setShowEditModal(true);
    };

    const handleDelete = async (e, actorId, name) => {
        e.preventDefault();
        if (window.confirm(`Видалити актора ${name} з бази даних?`)) {
            try {
                await actorsAPI.delete(actorId);
                loadMovieData(); 
            } catch {
                alert("Помилка видалення");
            }
        }
    };

    if (loading) return (
        <Container className="text-center mt-5">
            <Spinner animation="border" variant="primary" />
        </Container>
    );

    if (!movie) return (
        <Container className="mt-5 text-center">
            <h2 className="text-main">Фільм не знайдено</h2>
            <Button variant="primary" onClick={() => navigate(-1)}>Назад</Button>
        </Container>
    );

    const mainCast = movie?.cast?.filter(actor => actor.isMainRole) || [];
    const supportingCast = movie?.cast?.filter(actor => !actor.isMainRole) || [];

    const renderActorGrid = (castArray) => (
        <Row className="g-4">
            {castArray.map((actor, index) => (
                <Col key={actor.actorId || index} xs={6} sm={4} md={3} lg={2}>
                    <div className="position-relative">
                        {isAdmin && isAdmin() && actor.actorId > 0 && (
                            <div className="position-absolute top-0 end-0 p-2 d-flex gap-2" style={{ zIndex: 10 }}>
                                <Button variant="success" size="sm" className="rounded-circle p-1 admin-btn" onClick={(e) => handleEditClick(e, actor)} style={{ width: '32px', height: '32px' }}>
                                    <FaEdit size={14} />
                                </Button>
                                <Button variant="danger" size="sm" className="rounded-circle p-1 admin-btn" onClick={(e) => handleDelete(e, actor.actorId, actor.name)} style={{ width: '32px', height: '32px' }}>
                                    <FaTrash size={12} />
                                </Button>
                            </div>
                        )}
                        
                        <Card className="h-100 border-0 shadow-sm bg-card movie-card-hover rounded-4 overflow-hidden">
                            <Link 
                                to={actor.actorId > 0 ? `/actors/${actor.actorId}` : '#'} 
                                className={`text-decoration-none ${actor.actorId === 0 ? 'pe-none' : ''}`}
                            >
                                <div style={{ aspectRatio: '2/3', overflow: 'hidden' }}>
                                    <Card.Img
                                        variant="top"
                                        src={
                                            actor?.photoUrl
                                                ? (actor.photoUrl.startsWith('http')
                                                    ? actor.photoUrl
                                                    : `${API_BASE_URL}${actor.photoUrl}`)
                                                : defaultAvatarImg
                                        }
                                        className="w-100 h-100 object-fit-cover transition-transform"
                                        onError={(e) => (e.target.src = defaultAvatarImg)}
                                    />
                                </div>
                                <Card.Body className="p-3 text-center">
                                    <div className="fw-bold text-main text-truncate mb-1" title={actor.name}>
                                        {actor.name}
                                    </div>
                                    <div className="text-muted small lh-sm text-truncate" title={actor.role}>
                                        {actor.role}
                                    </div>
                                </Card.Body>
                            </Link>
                        </Card>
                    </div>
                </Col>
            ))}
        </Row>
    );

    return (
        <Container className="mt-4 mb-5">
            <div className="mb-4 d-flex align-items-center gap-3">
                <Button 
                    variant="outline-primary" 
                    onClick={() => navigate(-1)}
                    className="d-flex align-items-center justify-content-center shadow-sm"
                    style={{ 
                        width: '45px', 
                        height: '45px', 
                        borderRadius: '12px',
                        borderWidth: '2px',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateX(-5px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateX(0)'}
                >
                    <FaArrowLeft size={20} />
                </Button>
                <div>
                    <h2 className="mb-0 text-main fw-bold" style={{ letterSpacing: '-0.5px' }}>
                        Акторський склад
                    </h2>
                    <Link to={`/movie/${movie.id}`} className="text-decoration-none text-muted small hover-primary">
                        Повернутися до {movie.title} ({movie.year})
                    </Link>
                </div>
            </div>

            {mainCast.length > 0 && (
                <div className="mb-5">
                    <h4 className="mb-3 border-start border-4 border-warning ps-2 text-main">Головні ролі</h4>
                    {renderActorGrid(mainCast)}
                </div>
            )}

            {supportingCast.length > 0 && (
                <div className="mb-5">
                    <h4 className="mb-3 border-start border-4 border-secondary ps-2 text-main">Другорядні ролі</h4>
                    {renderActorGrid(supportingCast)}
                </div>
            )}

            <style>{`
                .admin-btn { opacity: 0.8; transition: 0.2s; }
                .admin-btn:hover { opacity: 1; transform: scale(1.1); }
                .movie-card-hover { transition: 0.3s; }
                .movie-card-hover:hover { transform: translateY(-5px); }
                .transition-transform { transition: transform 0.3s ease; }
                .movie-card-hover:hover .transition-transform { transform: scale(1.05); }
            `}</style>

            <AdminActorModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                actorToEdit={selectedActor}
                onSuccess={loadMovieData}
            />
        </Container>
    );
}

export default MovieCastPage;