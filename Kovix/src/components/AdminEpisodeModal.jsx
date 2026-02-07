import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { moviesAPI } from '../services/api';

function AdminEpisodeModal({ show, onHide, movieId, episodeToEdit, onSuccess }) {
  const [formData, setFormData] = useState({
    seasonNumber: 1,
    episodeNumber: 1,
    title: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (episodeToEdit) {
      setFormData({
        seasonNumber: episodeToEdit.seasonNumber,
        episodeNumber: episodeToEdit.episodeNumber,
        title: episodeToEdit.title || ''
      });
    } else {
      setFormData({ seasonNumber: 1, episodeNumber: 1, title: '' });
    }
  }, [episodeToEdit, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        seasonNumber: parseInt(formData.seasonNumber),
        episodeNumber: parseInt(formData.episodeNumber)
      };
      
      if (episodeToEdit) {
        await moviesAPI.updateEpisode(episodeToEdit.id, payload);
      } else {
        await moviesAPI.addEpisode(movieId, payload);
      }

      onSuccess(); 
      onHide();
    } catch (error) {
      console.error(error);
      alert('Помилка збереження епізоду');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{episodeToEdit ? 'Редагувати епізод' : 'Додати епізод'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col xs={6}>
              <Form.Group className="mb-3">
                <Form.Label>Сезон №</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  name="seasonNumber"
                  value={formData.seasonNumber}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col xs={6}>
              <Form.Group className="mb-3">
                <Form.Label>Епізод №</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  name="episodeNumber"
                  value={formData.episodeNumber}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Назва серії</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Наприклад: Пілот"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Скасувати</Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Збереження...' : (episodeToEdit ? 'Зберегти зміни' : 'Додати')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default AdminEpisodeModal;