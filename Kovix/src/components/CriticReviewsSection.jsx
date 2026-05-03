import { useState, useEffect } from 'react';
import { Spinner, Card, Badge, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { criticReviewsAPI } from '../services/api';
import CriticReviewForm from './CriticReviewForm';
import defaultAvatarImg from '../assets/NotFoundAvatar.png';
import { API_BASE_URL } from '../utils/apiConfig';
import UserTitleBadge from './UserTitleBadge';

const CriticReviewsSection = ({ movieId }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const loadReviews = async () => {
        try {
            const res = await criticReviewsAPI.getByMovie(movieId);
            setReviews(res.data);
        } catch (error) {
            console.error("Помилка завантаження рецензій:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (movieId) loadReviews();
    }, [movieId]);

    const handleSubmitReview = async (reviewData) => {
        try {
            const res = await criticReviewsAPI.create(reviewData);
            setReviews([res.data, ...reviews]);
            setShowForm(false);
            alert("Вашу рецензію успішно опубліковано!");
        } catch (error) {
            const errorMessage = typeof error.response?.data === 'string' 
                ? error.response.data 
                : error.response?.data?.message || "Помилка публікації рецензії";
            alert(errorMessage);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цю рецензію?')) return;

        try {
            await criticReviewsAPI.delete(reviewId);
            setReviews(reviews.filter(r => r.id !== reviewId));
            alert("Рецензія успішно видалена!");
        } catch (error) {
            const errorMessage = typeof error.response?.data === 'string' 
                ? error.response.data 
                : error.response?.data?.message || "Помилка видалення рецензії";
            alert(errorMessage);
        }
    };

    const getScoreBadge = (score) => {
        if (score >= 8) return <Badge bg="success" className="fs-5">{score}</Badge>;
        if (score >= 5) return <Badge bg="warning" className="fs-5 text-dark">{score}</Badge>;
        return <Badge bg="danger" className="fs-5">{score}</Badge>;
    };

    if (loading) return <div className="text-center p-4"><Spinner animation="border" variant="warning" /></div>;

    const hasReviewed = user && reviews.some(r => r.user.id === user.id);

    const canReview = user && (user.role === 'Reviewer' || user.role === 'Admin') && !hasReviewed;

    return (
        <div className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2" style={{ borderBottom: '2px solid var(--border-color)' }}>
                <h3 className="fw-bold mb-0" style={{ color: 'var(--primary-color)' }}>
                    📝 Рецензії критиків <span className="text-muted fs-5">({reviews.length})</span>
                </h3>

                {canReview && !showForm && (
                    <Button variant="warning" className="fw-bold" onClick={() => setShowForm(true)}>
                        Написати рецензію
                    </Button>
                )}
            </div>

            {showForm && (
                <div className="mb-5">
                    <div className="d-flex justify-content-end mb-2">
                        <Button variant="outline-danger" size="sm" onClick={() => setShowForm(false)}>
                            Скасувати
                        </Button>
                    </div>
                    <CriticReviewForm movieId={movieId} onSubmit={handleSubmitReview} />
                </div>
            )}

            {reviews.length === 0 ? (
                <div className="text-center p-4 rounded" style={{ border: '1px dashed var(--border-color)' }}>
                    <p className="text-muted mb-0">Ще немає жодної професійної рецензії на цей фільм.</p>
                </div>
            ) : (
                <div className="d-flex flex-column gap-4">
                    {reviews.map(review => (
                        <Card key={review.id} className="border-0 shadow-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <img
                                            src={review.user.avatarUrl ? `${API_BASE_URL}${review.user.avatarUrl}` : defaultAvatarImg}
                                            alt={review.user.username}
                                            className="rounded-circle border"
                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                        />
                                        <div>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="fw-bold fs-5 text-main">{review.user.username}</div>
                                                <UserTitleBadge
                                                    role={review.user.role}
                                                    selectedAward={review.user.selectedAward}
                                                />
                                            </div>
                                            <div className="d-flex align-items-center gap-3 text-muted small">
                                                <span>{new Date(review.createdAt).toLocaleDateString('uk-UA')}</span>

                                                {user && (user.role === 'Admin' || user.id === review.user.id) && (
                                                    <span
                                                        className="text-danger"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => handleDeleteReview(review.id)}
                                                        title="Видалити рецензію"
                                                    >
                                                        <i className="bi bi-trash-fill"></i> Видалити
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <div className="text-muted small mb-1">Загальний бал</div>
                                        {getScoreBadge(review.overallScore)}
                                    </div>
                                </div>

                                <h5 className="fw-bold mb-3" style={{ color: 'var(--primary-color)' }}>
                                    "{review.verdict}"
                                </h5>

                                <div className="p-3 mb-3 rounded d-flex justify-content-between" style={{ backgroundColor: 'var(--bg-input)', fontSize: '0.9rem' }}>
                                    <div><strong>📖 Сюжет:</strong> {review.storyScore}/10</div>
                                    <div><strong>🎭 Гра:</strong> {review.actingScore}/10</div>
                                    <div><strong>🎬 Візуал:</strong> {review.visualsScore}/10</div>
                                    <div><strong>🎵 Звук:</strong> {review.audioScore}/10</div>
                                </div>

                                <p className="text-main" style={{ whiteSpace: 'pre-wrap' }}>
                                    {review.fullText}
                                </p>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CriticReviewsSection;