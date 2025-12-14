import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { moviesAPI } from '../services/api';

function AdminMovieModal({ show, onHide, movieToEdit, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '', description: '', year: new Date().getFullYear(),
    genre: '', director: '', posterUrl: '', trailerUrl: ''
  });

  useEffect(() => {
    if (movieToEdit) {
      setFormData({
        title: movieToEdit.title,
        description: movieToEdit.description || '',
        year: movieToEdit.year,
        genre: movieToEdit.genre || '',
        director: movieToEdit.director || '',
        posterUrl: movieToEdit.posterUrl || '',
        trailerUrl: movieToEdit.trailerUrl || ''
      });
    } else {
      setFormData({
        title: '', description: '', year: new Date().getFullYear(),
        genre: '', director: '', posterUrl: '', trailerUrl: ''
      });
    }
  }, [movieToEdit, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (movieToEdit) {
        await moviesAPI.update(movieToEdit.id, formData);
      } else {
        await moviesAPI.create(formData);
      }
      onSuccess();
      onHide();   
    } catch (error) {
      alert('Помилка збереження фільму');
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{movieToEdit ? 'Редагувати фільм' : 'Додати новий фільм'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Назва фільму</Form.Label>
            <Form.Control name="title" value={formData.title} onChange={handleChange} required />
          </Form.Group>
          
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Рік</Form.Label>
                <Form.Control type="number" name="year" value={formData.year} onChange={handleChange} required />
              </Form.Group>
            </div>
            <div className="col-md-6">
               <Form.Group className="mb-3">
                <Form.Label>Жанр</Form.Label>
                <Form.Control name="genre" value={formData.genre} onChange={handleChange} />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Режисер</Form.Label>
            <Form.Control name="director" value={formData.director} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Посилання на постер (URL картинки)</Form.Label>
            <Form.Control name="posterUrl" value={formData.posterUrl} onChange={handleChange} placeholder="https://..." />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Посилання на трейлер (YouTube Embed URL)</Form.Label>
            <Form.Control name="trailerUrl" value={formData.trailerUrl} onChange={handleChange} placeholder="https://www.youtube.com/embed/..." />
            <Form.Text className="text-muted">Для YouTube використовуйте формат Embed (наприклад, /embed/ID)</Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Опис</Form.Label>
            <Form.Control as="textarea" rows={4} name="description" value={formData.description} onChange={handleChange} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Скасувати</Button>
          <Button variant="primary" type="submit">Зберегти</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default AdminMovieModal;