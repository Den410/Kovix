import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { contentFilterAPI } from '../services/api';
import { FaUserSlash, FaTrashAlt } from 'react-icons/fa';
import { API_BASE_URL } from '../utils/apiConfig';

function BlacklistPage() {
    const [blockedActors, setBlockedActors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlocked();
    }, []);

    const fetchBlocked = async () => {
        try {
            const res = await contentFilterAPI.getBlockedActors();
            setBlockedActors(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnblock = async (id) => {
        try {
            await contentFilterAPI.unblockActor(id);
            setBlockedActors(prev => prev.filter(a => a.actorId !== id));
        } catch (err) {
            alert("Не вдалося розблокувати");
        }
    };

    if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" variant="primary" /></Container>;

    return (
        <Container className="mt-5 mb-5" style={{ color: 'var(--text-main)' }}>
            <div className="d-flex align-items-center gap-3 mb-4">
                <div className="bg-danger p-3 rounded-circle text-white">
                    <FaUserSlash size={24} />
                </div>
                <div>
                    <h2 className="mb-0">Мій чорний список</h2>
                    <p className="text-muted mb-0">Фільми з цими акторами не відображаються у вашій стрічці</p>
                </div>
            </div>

            {blockedActors.length === 0 ? (
                <Alert variant="info" className="bg-card border-0 text-main shadow-sm">
                    Ваш чорний список порожній. Ви бачите весь доступний контент! 😊
                </Alert>
            ) : (
                <Row className="g-4">
                    {blockedActors.map(item => (
                        <Col key={item.actorId} xs={12} md={6} lg={4}>
                            <Card className="bg-card border-0 shadow-sm h-100 overflow-hidden">
                                <Card.Body className="d-flex align-items-center gap-3 p-3">
                                    <img 
                                        src={item.photoUrl ? `${API_BASE_URL}${item.photoUrl}` : '/NotFoundAvatar.png'} 
                                        alt={item.name}
                                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%' }}
                                    />
                                    <div className="flex-grow-1">
                                        <h6 className="mb-1 fw-bold">
                                            <Link to={`/actors/${item.actorId}`} className="text-decoration-none text-main">
                                                {item.name}
                                            </Link>
                                        </h6>
                                        <small className="text-muted d-block">Заблоковано: {new Date(item.blockedAt).toLocaleDateString()}</small>
                                    </div>
                                    <Button 
                                        variant="outline-success" 
                                        size="sm" 
                                        className="rounded-pill"
                                        onClick={() => handleUnblock(item.actorId)}
                                        title="Розблокувати"
                                    >
                                        <FaTrashAlt className="me-1" /> Прибрати
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
}

export default BlacklistPage;