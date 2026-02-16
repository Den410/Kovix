import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { actorsAPI } from '../services/api';
import { FaSearch, FaUserFriends } from 'react-icons/fa';
import defaultPosterImg from '../assets/NotFoundPoster.webp';

const API_BASE_URL = 'http://localhost:5096';

function ActorsPage() {
    const [actors, setActors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActors();
    }, []);

    const loadActors = async () => {
        try {
            const res = await actorsAPI.getAll();
            setActors(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Error loading actors:", error);
        } finally {
            setLoading(false);
        }
    };

    const getPhotoUrl = (url) => {
        if (!url) return defaultPosterImg;
        if (url.startsWith('http')) return url;
        return `${API_BASE_URL}${url}`;
    };

    const filteredActors = actors.filter(a => 
        a.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
            <div className="text-center">
                <Spinner animation="border" variant="primary" size="lg" className="mb-2" />
                <p className="text-muted">Завантаження зірок...</p>
            </div>
        </Container>
    );

    return (
        <Container className="mt-5 mb-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 gap-3">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary p-3 rounded-4 shadow-sm text-white d-flex align-items-center justify-content-center">
                        <FaUserFriends size={28} />
                    </div>
                    <div>
                        <h2 className="mb-0 fw-bold text-main">Актори</h2>
                        <p className="text-muted mb-0 small">Всього знайдено: {filteredActors.length}</p>
                    </div>
                </div>
                
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    <InputGroup className="shadow-sm rounded-pill overflow-hidden border-secondary">
                        <InputGroup.Text className="bg-card border-0 text-muted ps-3">
                            <FaSearch />
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Знайти актора за іменем..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-card border-0 text-main py-2 shadow-none"
                            style={{ fontSize: '0.95rem' }}
                        />
                    </InputGroup>
                </div>
            </div>

            {filteredActors.length > 0 ? (
                <Row className="g-4">
                    {filteredActors.map(actor => (
                        <Col key={actor.id} xs={6} sm={4} md={3} lg={2}>
                            <Link to={`/actors/${actor.id}`} className="text-decoration-none group">
                                <Card className="h-100 border-0 shadow-sm bg-card actor-card-hover rounded-4 overflow-hidden position-relative">
                                    <div className="position-relative overflow-hidden" style={{ aspectRatio: '2/3' }}>
                                        <Card.Img 
                                            variant="top" 
                                            src={getPhotoUrl(actor.photoUrl)} 
                                            className="w-100 h-100 object-fit-cover transition-all duration-500"
                                            onError={(e) => { e.target.src = defaultPosterImg; }}
                                        />
                                        <div className="position-absolute bottom-0 start-0 end-0 p-3 bg-gradient-to-t from-black/80 to-transparent d-md-none">
                                            <span className="text-white small fw-bold">{actor.name}</span>
                                        </div>
                                    </div>
                                    <Card.Body className="p-3 text-center d-none d-md-block">
                                        <Card.Title 
                                            className="mb-0 text-main fw-bold text-truncate" 
                                            style={{ fontSize: '0.9rem' }}
                                            title={actor.name}
                                        >
                                            {actor.name}
                                        </Card.Title>
                                        <small className="text-muted">Актор</small>
                                    </Card.Body>
                                </Card>
                            </Link>
                        </Col>
                    ))}
                </Row>
            ) : (
                <div className="text-center py-5">
                    <h3 className="text-muted">Нікого не знайдено 😔</h3>
                    <p>Спробуйте змінити пошуковий запит</p>
                </div>
            )}

            <style>{`
                .actor-card-hover {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .actor-card-hover:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.2) !important;
                }
                .actor-card-hover:hover img {
                    transform: scale(1.1);
                }
                .transition-all {
                    transition: all 0.5s ease;
                }
                .bg-card {
                    background-color: var(--bg-card) !important;
                }
                .text-main {
                    color: var(--text-main) !important;
                }
            `}</style>
        </Container>
    );
}

export default ActorsPage;