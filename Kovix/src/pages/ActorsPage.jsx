import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { actorsAPI } from '../services/api';
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
            setActors(res.data);
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

    if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;

    return (
        <Container className="mt-4">
            <h2 className="mb-4">🎭 Актори</h2>
            
            <InputGroup className="mb-4">
                <Form.Control
                    placeholder="Пошук актора..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}
                />
            </InputGroup>

            <Row>
                {filteredActors.map(actor => (
                    <Col key={actor.id} xs={6} md={4} lg={3} className="mb-4">
                        <Link to={`/actors/${actor.id}`} className="text-decoration-none">
                            <Card className="h-100 shadow-sm actor-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                                <div style={{ height: '250px', overflow: 'hidden' }}>
                                    <Card.Img 
                                        variant="top" 
                                        src={getPhotoUrl(actor.photoUrl)} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => { e.target.src = defaultPosterImg; }}
                                    />
                                </div>
                                <Card.Body className="text-center">
                                    <Card.Title style={{ color: 'var(--text-main)', fontSize: '1rem' }}>{actor.name}</Card.Title>
                                </Card.Body>
                            </Card>
                        </Link>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default ActorsPage;