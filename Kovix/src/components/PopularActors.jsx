import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { actorsAPI } from '../services/api';
import { API_BASE_URL } from '../utils/apiConfig';
import defaultAvatarImg from '../assets/NotFoundAvatar.png';

const PopularActors = () => {
    const [actors, setActors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPopularActors = async () => {
            try {
                const response = await actorsAPI.getAll();
                const sortedActors = response.data
                    .sort((a, b) => (b.movies?.length || 0) - (a.movies?.length || 0))
                    .slice(0, 10);
                setActors(sortedActors);
            } catch (error) {
                console.error("Помилка завантаження акторів:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPopularActors();
    }, []);

    if (loading || actors.length === 0) return null;

    return (
        <div className="mt-5 mb-4">
            <h4 className="fw-bold mb-4 border-start border-4 border-warning ps-2" style={{ color: 'var(--text-main)' }}>
                Найпопулярніші актори
            </h4>
            
            <Row className="flex-nowrap overflow-auto pb-3 text-center" style={{ scrollbarWidth: 'thin' }}>
                {actors.map((actor) => (
                    <Col key={actor.id} xs={4} sm={3} md={2} className="flex-shrink-0">
                        <Link to={`/actors/${actor.id}`} className="text-decoration-none">
                            <div className="d-flex flex-column align-items-center hover-card">
                                <div 
                                    className="rounded-circle shadow-sm mb-2" 
                                    style={{ 
                                        width: '100px', 
                                        height: '100px', 
                                        overflow: 'hidden',
                                        border: '3px solid var(--border-color)',
                                        transition: 'border-color 0.3s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                                >
                                    <img 
                                        src={actor.photoUrl ? `${API_BASE_URL}${actor.photoUrl}` : defaultAvatarImg} 
                                        alt={actor.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="fw-bold text-truncate w-100" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                    {actor.name}
                                </div>
                            </div>
                        </Link>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default PopularActors;