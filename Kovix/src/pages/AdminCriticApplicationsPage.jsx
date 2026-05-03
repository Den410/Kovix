import { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Badge } from 'react-bootstrap';
import { applicationsAPI } from '../services/api';
import { API_BASE_URL } from '../utils/apiConfig';
import defaultAvatarImg from '../assets/NotFoundAvatar.png';
import UserTitleBadge from '../components/UserTitleBadge';

const DEFAULT_AVATAR = defaultAvatarImg;

const AdminCriticApplicationsPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadApplications = async () => {
        try {
            const res = await applicationsAPI.getPending();
            setApplications(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadApplications(); }, []);

    const handleAction = async (id, actionType) => {
        if (!window.confirm(`Ви впевнені, що хочете ${actionType === 'approve' ? 'СХВАЛИТИ' : 'ВІДХИЛИТИ'} цю заявку?`)) return;
        
        try {
            if (actionType === 'approve') await applicationsAPI.approve(id);
            else await applicationsAPI.reject(id);
            
            loadApplications();
        } catch (e) {
            alert("Помилка обробки заявки");
        }
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <Container className="mt-4">
            <h2 className="fw-bold mb-4" style={{ color: 'var(--text-main)' }}>🛡️ Заявки на роль Критика</h2>

            {applications.length === 0 ? (
                <div className="text-center p-5 rounded" style={{ border: '1px dashed var(--border-color)' }}>
                    <p className="text-muted fs-5 mb-0">Немає нових заявок на розгляд.</p>
                </div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {applications.map(app => (
                        <Card key={app.id} className="border-0 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderLeft: '4px solid var(--primary-color)' }}>
                            <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                                <div className="d-flex align-items-start gap-3">
                                    <img 
                                        src={app.user.avatarUrl ? `${API_BASE_URL}${app.user.avatarUrl}` : DEFAULT_AVATAR} 
                                        alt="avatar" 
                                        className="rounded-circle border"
                                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                    />
                                    <div>
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <span className="fw-bold fs-5 text-main">{app.user.username}</span>
                                            <UserTitleBadge
                                                role={app.user.role}
                                                selectedAward={app.user.selectedAward}
                                            />
                                            <span className="text-muted small">{app.user.email}</span>
                                            <Badge bg="secondary">Очікує</Badge>
                                        </div>
                                        <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)' }}>
                                            <strong>Мотивація: </strong>
                                            <span className="fst-italic">"{app.motivationText}"</span>
                                        </div>
                                        <div className="text-muted small mt-2">
                                            Подано: {new Date(app.createdAt).toLocaleString('uk-UA')}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="d-flex flex-md-column gap-2 ms-md-3">
                                    <Button variant="success" className="fw-bold" onClick={() => handleAction(app.id, 'approve')}>
                                        Схвалити
                                    </Button>
                                    <Button variant="outline-danger" onClick={() => handleAction(app.id, 'reject')}>
                                        Відхилити
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            )}
        </Container>
    );
};

export default AdminCriticApplicationsPage;
