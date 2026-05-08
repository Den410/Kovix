import { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Alert, Table, Badge } from 'react-bootstrap';
import { forumAPI } from '../services/api';

function AdminForumModerationPage() {
    const [pendingCategories, setPendingCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        loadPendingCategories();
    }, []);

    const loadPendingCategories = async () => {
        setLoading(true);
        try {
            const response = await forumAPI.getPendingCategories();
            setPendingCategories(response.data);
        } catch (err) {
            console.error('Помилка завантаження запитів:', err);
            setError('Не вдалося завантажити список запитів на модерацію.');
        } finally {
            setLoading(false);
        }
    };

    const handleModerate = async (id, approve) => {
        setProcessingId(id);
        try {
            await forumAPI.moderateCategory(id, approve);
            setSuccess(`Категорію ${approve ? 'схвалено' : 'відхилено'} успішно!`);
            setPendingCategories(prev => prev.filter(c => c.id !== id));
            
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Помилка модерації:', err);
            alert('Не вдалося виконати дію.');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <Container className="mt-4 mb-5">
            <h2 className="mb-4" style={{ color: 'var(--text-main)' }}>🛡️ Модерація категорій форуму</h2>

            {success && <Alert variant="success">{success}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" style={{ color: 'var(--text-main)' }} />
                </div>
            ) : pendingCategories.length === 0 ? (
                <Card className="text-center py-5 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                    <Card.Body>
                        <h5 className="text-muted">Запитів на нові категорії поки немає</h5>
                    </Card.Body>
                </Card>
            ) : (
                <Card className="shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                    <Table responsive hover variant="dark" className="mb-0">
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                <th className="p-3">Назва</th>
                                <th className="p-3">Опис</th>
                                <th className="p-3">Автор</th>
                                <th className="p-3 text-end">Дії</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingCategories.map(category => (
                                <tr key={category.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td className="p-3 align-middle fw-bold" style={{ color: 'var(--primary-color)' }}>
                                        {category.name}
                                    </td>
                                    <td className="p-3 align-middle text-muted small" style={{ maxWidth: '300px' }}>
                                        {category.description}
                                    </td>
                                    <td className="p-3 align-middle">
                                        <Badge bg="secondary">{category.proposedBy}</Badge>
                                    </td>
                                    <td className="p-3 align-middle text-end">
                                        <div className="d-flex justify-content-end gap-2">
                                            <Button 
                                                variant="success" 
                                                size="sm"
                                                disabled={processingId === category.id}
                                                onClick={() => handleModerate(category.id, true)}
                                            >
                                                {processingId === category.id ? '...' : 'Схвалити'}
                                            </Button>
                                            <Button 
                                                variant="danger" 
                                                size="sm"
                                                disabled={processingId === category.id}
                                                onClick={() => handleModerate(category.id, false)}
                                            >
                                                Відхилити
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>
            )}
        </Container>
    );
}

export default AdminForumModerationPage;