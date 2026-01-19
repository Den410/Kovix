import { Container, Card, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const BlockedRoute = ({ children }) => {
    const { user, logout } = useAuth();

    if (user && user.isBlocked) {
        return (
            <Container className="d-flex align-items-center justify-content-center" style={{ height: '80vh' }}>
                <Card className="text-center p-5 shadow border-danger" style={{ maxWidth: '600px' }}>
                    <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🚫</div>
                    <h2 className="text-danger mb-3">Ваш акаунт заблоковано</h2>
                    <p className="lead">
                        Адміністратор обмежив ваш доступ до функцій сайту.
                    </p>
                    <p className="text-muted">
                        Ви не можете:
                        <ul className="text-start d-inline-block mt-2">
                            <li>Користуватися чатом</li>
                            <li>Писати приватні повідомлення</li>
                            <li>Переглядати профілі інших користувачів</li>
                            <li>Залишати коментарі</li>
                        </ul>
                    </p>
                    <hr />
                    <Button variant="outline-danger" onClick={logout}>
                        Вийти з акаунту
                    </Button>
                </Card>
            </Container>
        );
    }

    return children;
};

export default BlockedRoute;