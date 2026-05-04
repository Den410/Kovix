import { useState, useEffect } from 'react';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { criticReviewsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function CriticReviewForm({ movieId, onSubmit, initialData }) {
  const { user } = useAuth();

  const [storyScore, setStoryScore] = useState(8);
  const [actingScore, setActingScore] = useState(8);
  const [visualsScore, setVisualsScore] = useState(8);
  const [audioScore, setAudioScore] = useState(8);
  const [verdict, setVerdict] = useState('');
  const [fullText, setFullText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setStoryScore(initialData.storyScore || 8);
      setActingScore(initialData.actingScore || 8);
      setVisualsScore(initialData.visualsScore || 8);
      setAudioScore(initialData.audioScore || 8);
      setVerdict(initialData.verdict || '');
      setFullText(initialData.fullText || '');
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!verdict.trim() || !fullText.trim()) {
      setError('Будь ласка, заповніть усі обов\'язкові поля.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const reviewData = {
        ...(!initialData && { MovieId: movieId }),
        StoryScore: parseInt(storyScore),
        ActingScore: parseInt(actingScore),
        VisualsScore: parseInt(visualsScore),
        AudioScore: parseInt(audioScore),
        Verdict: verdict.trim(),
        FullText: fullText.trim()
      };

      if (onSubmit) {
        onSubmit(reviewData);
      }

      setStoryScore(8);
      setActingScore(8);
      setVisualsScore(8);
      setAudioScore(8);
      setVerdict('');
      setFullText('');
    } catch (err) {
      console.error(err);

      if (err.response && err.response.data) {
        const errorMsg = typeof err.response.data === 'string' 
          ? err.response.data 
          : err.response.data?.message || 'Помилка збереження рецензії';
        setError(errorMsg);
      } else {
        setError('Не вдалося опублікувати рецензію. Спробуйте пізніше.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-3 mb-4 rounded text-center border" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
        <span className="text-muted">Увійдіть, щоб залишити рецензію.</span>
      </div>
    );
  }

  const scoreOptions = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

  return (
    <div className="mb-4">
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <div className="p-4 rounded" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
          <h5 className="mb-4" style={{ color: 'var(--text-main)' }}>Оцініть аспекти фільму</h5>

          <Row className="mb-4 g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">📖 Сюжет</Form.Label>
                <Form.Select
                  value={storyScore}
                  onChange={(e) => setStoryScore(e.target.value)}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  {scoreOptions.map(num => (
                    <option key={num} value={num}>{num} ⭐</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">🎭 Гра акторів</Form.Label>
                <Form.Select
                  value={actingScore}
                  onChange={(e) => setActingScore(e.target.value)}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  {scoreOptions.map(num => (
                    <option key={num} value={num}>{num} ⭐</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">🎬 Візуальні ефекти</Form.Label>
                <Form.Select
                  value={visualsScore}
                  onChange={(e) => setVisualsScore(e.target.value)}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  {scoreOptions.map(num => (
                    <option key={num} value={num}>{num} ⭐</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">🎵 Звукова дорожка</Form.Label>
                <Form.Select
                  value={audioScore}
                  onChange={(e) => setAudioScore(e.target.value)}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  {scoreOptions.map(num => (
                    <option key={num} value={num}>{num} ⭐</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Висновок (до 150 символів)</Form.Label>
            <Form.Control
              as="input"
              maxLength={150}
              placeholder="Введіть короткий висновок про фільм..."
              value={verdict}
              onChange={(e) => setVerdict(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
                borderColor: 'var(--border-color)',
              }}
            />
            <small className="text-muted">{verdict.length}/150</small>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Повний текст рецензії</Form.Label>
            <Form.Control
              as="textarea"
              rows={8}
              placeholder="Напишіть детальну рецензію на цей фільм..."
              value={fullText}
              onChange={(e) => setFullText(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
                borderColor: 'var(--border-color)',
                minHeight: '200px',
              }}
            />
          </Form.Group>

          <div className="d-flex gap-2 justify-content-end">
            <Button
              variant="success"
              type="submit"
              disabled={loading}
              className="fw-bold"
            >
              {loading ? (initialData ? 'Оновлення...' : 'Публікація...') : (initialData ? 'Зберегти зміни' : 'Опублікувати рецензію')}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}

export default CriticReviewForm;
