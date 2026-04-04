import { useState, useEffect } from 'react';
import { Spinner, Alert } from 'react-bootstrap';

const API_BASE_URL = 'http://localhost:5096';

const CharactersList = ({ movieId, refreshKey = 0 }) => {
    const [characters, setCharacters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadCharacters = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/api/movies/${movieId}/characters`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error(`Помилка сервера: ${response.status}`);

                const data = await response.json();
                console.log("📥 Отримані дані персонажів:", data); 
                setCharacters(data);
            } catch (err) {
                console.error("❌ Помилка завантаження:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (movieId) loadCharacters();
    }, [movieId, refreshKey]);

    if (isLoading) return (
        <div className="text-center p-5">
            <Spinner animation="border" variant="warning" />
            <div className="mt-2 text-muted">Завантаження персонажів...</div>
        </div>
    );

    if (error) return <Alert variant="danger">Помилка: {error}</Alert>;

    if (!characters || characters.length === 0) {
        return (
            <div className="text-center p-4 border rounded" style={{ borderStyle: 'dashed', borderColor: 'var(--border-color)' }}>
                <p className="mb-0 text-muted">У базі поки немає персонажів для цього фільму.</p>
                <small>Спробуйте натиснути "Імпортувати" вище.</small>
            </div>
        );
    }

    return (
        <div className="mt-4 p-3 rounded shadow-sm" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
            <h5 className="mb-4 pb-2" style={{ borderBottom: '1px solid var(--border-color)', fontWeight: 'bold' }}>
                🎭 Characters & Voice Actors
            </h5>

            <div className="d-flex flex-column gap-3">
                {characters.map((char, index) => (
                    <div 
                        key={char.characterId || index} 
                        className="d-flex justify-content-between align-items-center py-2" 
                        style={{ 
                            borderBottom: index !== characters.length - 1 ? '1px solid var(--border-color)' : 'none' 
                        }}
                    >
                        <div className="d-flex align-items-center">
                            <img
                                src={char.imageUrl || 'https://via.placeholder.com/65x100?text=No+Img'}
                                alt={char.characterName}
                                style={{ width: '60px', height: '85px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/65x100?text=No+Img'; }}
                            />
                            <div className="ms-3">
                                <div className="fw-bold" style={{ color: 'var(--primary-color)', fontSize: '1rem' }}>
                                    {char.characterName}
                                </div>
                                <div className="small text-muted">
                                    {char.voiceActors?.[0]?.isMainRole ? '🌟 Головний персонаж' : '👤 Другорядний персонаж'}
                                </div>
                            </div>
                        </div>

                        {/* АКТОРИ ОЗВУЧКИ */}
                        <div className="d-flex flex-column gap-2" style={{ minWidth: '200px' }}>
                            {char.voiceActors && char.voiceActors.length > 0 ? (
                                char.voiceActors.map((actor) => (
                                    <div key={actor.actorId} className="d-flex justify-content-end align-items-center">
                                        <div className="text-end me-3">
                                            <div className="fw-bold" style={{ color: 'var(--primary-color)', fontSize: '0.9rem' }}>
                                                {actor.actorName}
                                            </div>
                                            <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                                                {actor.language} {actor.isOriginal ? '• Сейю' : ''}
                                            </div>
                                        </div>
                                        <img
                                            src={actor.photoUrl || 'https://via.placeholder.com/45x70?text=No+Img'}
                                            alt={actor.actorName}
                                            style={{ width: '45px', height: '65px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/45x70?text=No+Img'; }}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="text-end text-muted small italic">Актори не вказані</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CharactersList;