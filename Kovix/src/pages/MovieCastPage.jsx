import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { moviesAPI } from '../services/api';
import { FaArrowLeft } from 'react-icons/fa'; 
import defaultAvatarImg from '../assets/NotFoundAvatar.png';

const API_BASE_URL = 'http://localhost:5096';

function MovieCastPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        moviesAPI.getById(id)
            .then(res => {
                setMovie(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading cast:", err);
                setLoading(false);
            });
    }, [id]);

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

            <Row className="g-4">
                {movie.cast && movie.cast.map((actor, index) => (
                    <Col key={actor.actorId || index} xs={6} sm={4} md={3} lg={2}>
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
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default MovieCastPage;