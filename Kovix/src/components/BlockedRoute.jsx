import { Container, Card, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom'; 

const BlockedRoute = ({ children }) => {
    const { user, logout } = useAuth();

    if (user && user.isBlocked) {
        return (
            <Container className="d-flex align-items-center justify-content-center" style={{ height: '80vh' }}>
                <Card className="text-center p-5 shadow border-danger" style={{ maxWidth: '600px', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>
                    <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🚫</div>
                    <h2 className="text-danger mb-3">Ваш акаунт заблоковано</h2>
                    <p className="lead" style={{ opacity: 0.9 }}>
                        Адміністратор обмежив ваш доступ до функцій сайту.
                    </p>
                    <div className="text-muted" style={{ color: 'var(--text-secondary)' }}>
                        Ви не можете:
                        <ul className="text-start d-inline-block mt-2">
                            <li>Користуватися чатом</li>
                            <li>Писати приватні повідомлення</li>
                            <li>Переглядати профілі інших користувачів</li>
                            <li>Залишати коментарі</li>
                        </ul>
                    </div>
                    
                    <hr style={{ borderColor: 'var(--border-color)' }} />
                    
                    <div className="d-flex justify-content-center gap-3 mt-3 flex-wrap">
                        <Button as={Link} to="/appeal" variant="danger" className="fw-bold px-4">
                            ⚖️ Оскаржити блокування
                        </Button>
                        <Button variant="outline-danger" onClick={logout} className="px-4">
                            Вийти з акаунту
                        </Button>
                    </div>
                </Card>
            </Container>
        );
    }

    return children;
};

export default BlockedRoute;