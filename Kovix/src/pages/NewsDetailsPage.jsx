import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Spinner, Badge, Button } from 'react-bootstrap';
import { newsAPI } from '../services/api';
import { FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';

const NewsDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await newsAPI.getById(id);
                setItem(res.data);
            } catch { navigate('/'); }
            finally { setLoading(false); }
        };
        load();
    }, [id]);

    if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="warning"/></div>;

    return (
        <Container className="mt-5 mb-5">
            <Button variant="link" className="text-decoration-none p-0 mb-4 fw-bold" style={{ color: 'var(--primary-color)' }} onClick={() => navigate(-1)}>
                <FaArrowLeft className="me-2"/> Назад до новин
            </Button>

            <Card className="border-0 shadow" style={{ backgroundColor: 'var(--bg-card)' }}>
                <Card.Body className="p-4 p-md-5">
                    <div className="mb-4">
                        <Badge bg={item.category === 'Tech' ? 'danger' : 'warning'} className="mb-2 px-3 py-2">
                            {item.category}
                        </Badge>
                        <h1 className="display-5 fw-bold" style={{ color: 'var(--text-main)' }}>{item.title}</h1>
                        <div className="text-muted d-flex align-items-center gap-2">
                            <FaCalendarAlt />
                            {new Date(item.createdAt).toLocaleString('uk-UA')}
                        </div>
                    </div>

                    <div className="fs-5" style={{ color: 'var(--text-main)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                        {item.content}
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default NewsDetailsPage;