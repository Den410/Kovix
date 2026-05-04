import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../utils/apiConfig';
import defaultPosterImg from '../assets/NotFoundPoster.webp';

const RecentlyViewed = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const savedHistory = JSON.parse(localStorage.getItem('kovix_recent_movies') || '[]');
        setHistory(savedHistory);
    }, []);

    if (history.length === 0) return null;

    return (
        <div className="mt-5 mb-4">
            <h4 className="fw-bold mb-3 border-start border-4 border-info ps-2" style={{ color: 'var(--text-main)' }}>
                👀 Ви переглядали раніше
            </h4>
            
            <Row className="flex-nowrap overflow-auto pb-3" style={{ scrollbarWidth: 'thin' }}>
                {history.map((movie) => (
                    <Col key={movie.id} xs={5} sm={4} md={3} lg={2} className="flex-shrink-0">
                        <Link to={`/movie/${movie.id}`} className="text-decoration-none">
                            <Card className="h-100 border-0 shadow-sm hover-card bg-transparent">
                                <div style={{ overflow: 'hidden', borderRadius: '8px' }}>
                                    <Card.Img 
                                        variant="top" 
                                        src={movie.posterUrl ? `${API_BASE_URL}${movie.posterUrl}` : defaultPosterImg} 
                                        alt={movie.title}
                                        style={{ height: '220px', objectFit: 'cover', transition: 'transform 0.3s' }}
                                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                    />
                                </div>
                                <div className="mt-2 text-center text-truncate fw-bold" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                    {movie.title}
                                </div>
                            </Card>
                        </Link>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default RecentlyViewed;