import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Spinner, Button } from 'react-bootstrap';
import { moviesAPI, criticReviewsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CriticReviewForm from '../components/CriticReviewForm';
import defaultAvatarImg from '../assets/NotFoundAvatar.png';
import { API_BASE_URL } from '../utils/apiConfig';
import UserTitleBadge from '../components/UserTitleBadge';
import '../style/App.css';

const CriticReviewsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();

    const [movie, setMovie] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const loadMovieData = async () => {
        try {
            const res = await moviesAPI.getById(id);
            setMovie(res.data);
        } catch (error) {
            console.error('Помилка завантаження фільму:', error);
        }
    };

    const loadReviews = async () => {
        try {
            const res = await criticReviewsAPI.getByMovie(id);
            setReviews(res.data);
        } catch (error) {
            console.error("Помилка завантаження рецензій:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadMovieData();
            loadReviews();
        }
    }, [id]);

    const handleSubmitReview = async (reviewData) => {
        try {
            const res = await criticReviewsAPI.create(reviewData);
            setReviews([res.data, ...reviews]);
            setShowForm(false);
            alert("Вашу рецензію успішно опубліковано!");
            await refreshUser();
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

    const handleUpdateReview = async (reviewId, reviewData) => {
        try {
            await criticReviewsAPI.update(reviewId, reviewData);
            setEditingId(null);
            loadReviews();
            await refreshUser();
        } catch (error) {
            const errorMessage = typeof error.response?.data === 'string'
                ? error.response.data
                : error.response?.data?.message || "Помилка оновлення рецензії";
            alert(errorMessage);
        }
    };

    const getScoreBadge = (score) => {
        if (score >= 8) return <Badge bg="success" className="fs-5">{score}</Badge>;
        if (score >= 5) return <Badge bg="warning" className="fs-5 text-dark">{score}</Badge>;
        return <Badge bg="danger" className="fs-5">{score}</Badge>;
    };

    if (loading) return (
        <Container className="py-5">
            <div className="text-center"><Spinner animation="border" variant="warning" /></div>
        </Container>
    );

    const hasReviewed = user && reviews.some(r => r.user.id === user.id);
    const canReview = user && (user.role === 'Reviewer' || user.role === 'Admin') && !hasReviewed;

    return (
        <Container className="py-5">
            <Row className="mb-4">
                <Col>
                    <Button variant="outline-secondary" onClick={() => navigate(-1)} className="mb-3">
                        ← Назад
                    </Button>
                    {movie && (
                        <h2 className="mb-0">
                            📝 Рецензії критиків - <span style={{ color: 'var(--primary-color)' }}>{movie.title}</span>
                        </h2>
                    )}
                    <p className="text-muted mt-2">Всього рецензій: {reviews.length}</p>
                </Col>
            </Row>

            {canReview && !showForm && (
                <div className="mb-4">
                    <Button variant="warning" className="fw-bold" onClick={() => setShowForm(true)}>
                        Написати рецензію
                    </Button>
                </div>
            )}

            {showForm && (
                <div className="mb-5">
                    <div className="d-flex justify-content-end mb-2">
                        <Button variant="outline-danger" size="sm" onClick={() => setShowForm(false)}>
                            Скасувати
                        </Button>
                    </div>
                    <CriticReviewForm movieId={id} onSubmit={handleSubmitReview} />
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
                                {editingId === review.id ? (
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-end mb-2">
                                            <Button variant="outline-danger" size="sm" onClick={() => setEditingId(null)}>
                                                Скасувати редагування
                                            </Button>
                                        </div>
                                        <CriticReviewForm 
                                            movieId={id} 
                                            initialData={review} 
                                            onSubmit={(data) => handleUpdateReview(review.id, data)} 
                                        />
                                    </div>
                                ) : (
                                    <>
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
                                                        <Link to={`/users/${review.user.id}`} className="fw-bold fs-5 text-main" style={{ textDecoration: 'none', color: 'var(--text-main)' }}>
                                                            {review.user.username}
                                                        </Link>
                                                        <UserTitleBadge
                                                            role={user?.id === review.user.id ? user.role : review.user.role}
                                                            selectedAward={user?.id === review.user.id ? user.selectedAward : review.user.selectedAward}
                                                        />
                                                    </div>
                                                    <div className="text-muted small mt-1">
                                                        <span>{new Date(review.createdAt).toLocaleDateString('uk-UA')}</span>
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

                                        {user && (user.role === 'Admin' || user.id === review.user.id) && (
                                            <div className="d-flex gap-4 justify-content-end mt-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                                                {user.id === review.user.id && (
                                                    <span
                                                        onClick={() => setEditingId(review.id)}
                                                        title="Редагувати рецензію"
                                                        style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                                                    >
                                                        ✏️
                                                    </span>
                                                )}
                                                <span
                                                    onClick={() => handleDeleteReview(review.id)}
                                                    title="Видалити рецензію"
                                                    style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                                                >
                                                    🗑️
                                                </span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            )}
        </Container>
    );
};

export default CriticReviewsPage;