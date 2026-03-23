import { useState } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useTheme } from '../contexts/ThemeContext'; 

const API_BASE_URL = 'http://localhost:5096'; 

const ImportMalCharacters = ({ movieId, onImportSuccess }) => {
    const { themeMode } = useTheme();
    const isDark = themeMode === 'dark';

    const [malAnimeId, setMalAnimeId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', variant: '' }); 

    const handleImport = async (e) => {
        e.preventDefault();
        
        if (!malAnimeId || malAnimeId <= 0) {
            setMessage({ text: 'Будь ласка, введіть коректний ID аніме з MAL.', variant: 'danger' });
            return;
        }

        setIsLoading(true);
        setMessage({ text: '', variant: '' });

        try {
            const token = localStorage.getItem('token'); 

            if (!token) {
                setMessage({ text: 'Ви не авторизовані. Будь ласка, увійдіть в акаунт.', variant: 'danger' });
                setIsLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/movies/${movieId}/import-mal/${malAnimeId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (response.ok) {
                setMessage({ text: 'Персонажів та оригінальних акторів успішно імпортовано!', variant: 'success' });
                setMalAnimeId(''); 
                
                if (onImportSuccess) {
                    onImportSuccess();
                }
            } else {
                if (response.status === 401 || response.status === 403) {
                    setMessage({ text: 'У вас немає прав для цієї дії або сесія завершилася.', variant: 'danger' });
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    setMessage({ 
                        text: `Помилка імпорту: ${errorData.message || 'Перевірте MAL ID або спробуйте пізніше.'}`, 
                        variant: 'danger' 
                    });
                }
            }
        } catch (error) {
            console.error("Помилка мережі при імпорті:", error);
            setMessage({ text: 'Помилка мережі. Переконайтеся, що C# бекенд запущений.', variant: 'danger' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card 
            bg={isDark ? 'dark' : 'light'} 
            text={isDark ? 'light' : 'dark'} 
            className="shadow-sm border-secondary mb-4" 
            style={{ maxWidth: '500px' }}
        >
            <Card.Body>
                <Card.Title className={isDark ? "text-warning" : ""}>
                    🤖 Автоматичний імпорт з MyAnimeList
                </Card.Title>
                <Card.Text className={isDark ? "text-info" : "text-muted"} style={{ fontSize: '0.85rem' }}>
                    Введіть цифровий ID з URL MyAnimeList (наприклад: 40748). 
                    Це автоматично додасть персонажів та їх сейю.
                </Card.Text>
                
                <Form onSubmit={handleImport} className="d-flex gap-2 align-items-center mb-3">
                    <Form.Control
                        type="number"
                        value={malAnimeId}
                        onChange={(e) => setMalAnimeId(e.target.value)}
                        placeholder="ID..."
                        required
                        disabled={isLoading}
                        style={isDark ? { backgroundColor: '#2c3034', color: 'white', border: '1px solid #495057' } : {}}
                    />
                    <Button 
                        variant={isDark ? "warning" : "primary"} 
                        type="submit" 
                        disabled={isLoading}
                        style={{ minWidth: '130px', fontWeight: 'bold' }}
                    >
                        {isLoading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                Йде імпорт...
                            </>
                        ) : 'Імпортувати'}
                    </Button>
                </Form>

                {message.text && (
                    <Alert variant={message.variant} className="mb-0 py-2 shadow-sm">
                        {message.variant === 'success' ? '✅ ' : '❌ '}
                        {message.text}
                    </Alert>
                )}
            </Card.Body>
        </Card>
    );
};

export default ImportMalCharacters;