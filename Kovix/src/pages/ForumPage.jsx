import { useState, useEffect } from 'react';
import { Container, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { forumAPI } from '../services/api';

function ForumPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await forumAPI.getCategories();
                setCategories(response.data);
            } catch (err) {
                console.error('Помилка завантаження форуму:', err);
                setError('Не вдалося завантажити категорії форуму.');
            } finally {
                setLoading(false);
            }
        };

        loadCategories();
    }, []);

    return (
        <Container className="mt-4 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{ color: 'var(--text-main)' }}>💬 Форум Kovix</h2>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" style={{ color: 'var(--text-main)' }} />
                </div>
            ) : (
                <Card className="shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                    <Card.Body className="p-0">
                        {categories.map((category, index) => (
                            <Link 
                                key={category.id} 
                                to={`/forum/category/${category.id}`} 
                                className="text-decoration-none d-block" 
                                style={{ color: 'inherit' }}
                            >
                                <div 
                                    className="p-3 d-flex justify-content-between align-items-center hover-card"
                                    style={{ 
                                        borderBottom: index !== categories.length - 1 ? '1px solid var(--border-color)' : 'none',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-main)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <div>
                                        {/* Заголовок більше не містить <Link> всередині, він просто стилізований */}
                                        <h5 className="mb-1 fw-bold" style={{ color: 'var(--primary-color, #0d6efd)' }}>
                                            {category.name}
                                        </h5>
                                        <p className="mb-0 text-muted small">{category.description}</p>
                                    </div>
                                    <div className="text-center">
                                        <Badge bg="secondary" pill className="px-3 py-2">
                                            {category.topicsCount} тем
                                        </Badge>
                                    </div>
                                </div>
                            </Link>
                        ))}
                        
                        {categories.length === 0 && (
                            <div className="text-center py-4 text-muted">
                                Категорій поки немає.
                            </div>
                        )}
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
}

export default ForumPage;