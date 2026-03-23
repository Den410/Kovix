import { useState, useEffect } from 'react';
import { Spinner, Card } from 'react-bootstrap';
import { useTheme } from '../contexts/ThemeContext';

const API_BASE_URL = 'http://localhost:5096';

const CharactersList = ({ movieId }) => {
    const [characters, setCharacters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const { themeMode } = useTheme();
    const isDark = themeMode === 'dark';

    useEffect(() => {
        const token = localStorage.getItem('token'); 

        fetch(`${API_BASE_URL}/api/movies/${movieId}/characters`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(r => {
            if (!r.ok) throw new Error('Помилка завантаження');
            return r.json();
        })
        .then(setCharacters)
        .catch(err => console.error("Помилка:", err))
        .finally(() => setIsLoading(false));
    }, [movieId]);

    if (isLoading) return (
        <div className="text-center p-4">
            <Spinner animation="border" variant="warning" />
        </div>
    );

    if (characters.length === 0) return (
        <div className="text-muted text-center p-3">Персонажів ще не додано.</div>
    );

    return (
        <div className="mt-4">
            <h2 style={{ 
                fontSize: 18, 
                fontWeight: 600, 
                borderBottom: `2px solid ${isDark ? '#444' : '#eee'}`, 
                paddingBottom: 8, 
                marginBottom: 16,
                color: isDark ? '#ffc107' : '#333' 
            }}>
                🎭 Characters & Voice Actors
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {characters.map(char => (
                    <div key={char.characterId} style={{
                        display: 'flex', 
                        justifyContent: 'space-between',
                        border: `1px solid ${isDark ? '#444' : '#e0e0e0'}`, 
                        borderRadius: 6,
                        overflow: 'hidden', 
                        backgroundColor: isDark ? '#1a1d20' : '#fff', 
                        color: isDark ? '#eee' : '#333',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <img
                                src={char.imageUrl || '/placeholder-char.jpg'}
                                alt={char.characterName}
                                style={{ width: 60, height: 85, objectFit: 'cover', flexShrink: 0 }}
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/60x85?text=No+Img'; }}
                            />
                            <div style={{ padding: '8px 15px' }}>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>{char.characterName}</div>
                                <div style={{ fontSize: 11, color: '#888' }}>Main Character</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, maxWidth: '60%' }}>
                            {char.voiceActors.map((actor, i) => (
                                <div key={actor.actorId} style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    borderTop: i > 0 ? `1px solid ${isDark ? '#333' : '#eee'}` : 'none',
                                    borderLeft: `1px solid ${isDark ? '#333' : '#eee'}`,
                                    height: '100%'
                                }}>
                                    <div style={{ padding: '8px 12px', textAlign: 'right', alignSelf: 'center' }}>
                                        <div style={{ fontWeight: 500, fontSize: 13 }}>{actor.actorName}</div>
                                        <div style={{ fontSize: 11, color: isDark ? '#aaa' : '#666', marginTop: 2 }}>
                                            {actor.language} {actor.isOriginal ? ' • Original' : ''}
                                        </div>
                                    </div>
                                    <img
                                        src={actor.photoUrl || '/placeholder-actor.jpg'}
                                        alt={actor.actorName}
                                        style={{ 
                                            width: 60, 
                                            height: 85, 
                                            objectFit: 'cover', 
                                            flexShrink: 0, 
                                            borderLeft: `1px solid ${isDark ? '#333' : '#eee'}` 
                                        }}
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/60x85?text=Actor'; }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CharactersList;