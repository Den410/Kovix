import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { moviesAPI } from '../services/api';

function AdminMovieModal({ show, onHide, movieToEdit, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    year: new Date().getFullYear(),
    posterUrl: '',
    trailerUrl: '',
    genre: '',
    director: '', 
    isSeries: false
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (movieToEdit) {
      setFormData({
        title: movieToEdit.title || '',
        description: movieToEdit.description || '',
        year: movieToEdit.year || new Date().getFullYear(),
        posterUrl: movieToEdit.posterUrl || '',
        trailerUrl: movieToEdit.trailerUrl || '',
        genre: movieToEdit.genre || '',
        director: movieToEdit.director || '',
        isSeries: movieToEdit.isSeries ?? false
      });
    } else {
      setFormData({
        title: '',
        description: '',
        year: new Date().getFullYear(),
        posterUrl: '',
        trailerUrl: '',
        genre: '',
        director: '', 
        isSeries: false
      });
    }
  }, [movieToEdit, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    const finalValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleTypeChange = (e) => {
      const isSeriesBool = e.target.value === 'true';
      
      setFormData(prev => ({
          ...prev,
          isSeries: isSeriesBool
      }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (movieToEdit) {
        await moviesAPI.update(movieToEdit.id, formData);
      } else {
        await moviesAPI.create(formData);
      }
      onSuccess();
      onHide();
    } catch (error) {
      console.error(error);
      alert('Помилка збереження');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{movieToEdit ? 'Редагувати' : 'Додати'} контент</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={8}>
                <Form.Group className="mb-3">
                    <Form.Label>Назва</Form.Label>
                    <Form.Control 
                        name="title" 
                        value={formData.title} 
                        onChange={handleChange} 
                        required 
                    />
                </Form.Group>
            </Col>
            
            <Col md={4}>
                <Form.Group className="mb-3">
                    <Form.Label>Тип</Form.Label>
                    <Form.Select 
                        name="isSeries" 
                        value={formData.isSeries.toString()} 
                        onChange={handleTypeChange}
                    >
                        <option value="false">🎬 Фільм</option>
                        <option value="true">📺 Серіал</option>
                    </Form.Select>
                </Form.Group>
            </Col>
          </Row>

          <Row>
             <Col md={6}>
                <Form.Group className="mb-3">
                    <Form.Label>Рік випуску</Form.Label>
                    <Form.Control 
                        type="number" 
                        name="year" 
                        value={formData.year} 
                        onChange={handleChange} 
                        required 
                    />
                </Form.Group>
             </Col>
             <Col md={6}>
                <Form.Group className="mb-3">
                    <Form.Label>Жанри (через кому)</Form.Label>
                    <Form.Control 
                        name="genre" 
                        value={formData.genre} 
                        onChange={handleChange} 
                        placeholder="Драма, Комедія..."
                    />
                </Form.Group>
             </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Режисер</Form.Label>
            <Form.Control 
                name="director" 
                value={formData.director} 
                onChange={handleChange} 
                placeholder="Введіть ім'я режисера"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>URL Постера</Form.Label>
            <Form.Control 
                name="posterUrl" 
                value={formData.posterUrl} 
                onChange={handleChange} 
                placeholder="https://..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>URL Трейлера (YouTube)</Form.Label>
            <Form.Control 
                name="trailerUrl" 
                value={formData.trailerUrl} 
                onChange={handleChange} 
                placeholder="https://www.youtube.com/watch?v=..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Опис</Form.Label>
            <Form.Control 
                as="textarea" 
                rows={3} 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
            />
          </Form.Group>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Скасувати</Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Збереження...' : 'Зберегти'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default AdminMovieModal;