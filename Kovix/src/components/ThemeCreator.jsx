import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Modal } from 'react-bootstrap';
import { useTheme } from '../contexts/ThemeContext';

const DEFAULT_COLORS = {
  '--bg-main': '#ffffff',
  '--bg-card': '#f8f9fa',
  '--text-main': '#000000',
  '--text-secondary': '#6c757d',
  '--border-color': '#dee2e6',
  '--primary-color': '#0d6efd',
  '--btn-text': '#ffffff'
};

const LABELS = {
  '--bg-main': 'Фон сторінки',
  '--bg-card': 'Фон карток/блоків',
  '--text-main': 'Основний текст',
  '--text-secondary': 'Додатковий текст',
  '--border-color': 'Колір рамок',
  '--primary-color': 'Акцентний колір (кнопки)',
  '--btn-text': 'Текст на кнопці'
};

const ThemeCreator = ({ show, onHide }) => {
  const { addCustomTheme } = useTheme();
  
  const [name, setName] = useState('');
  const [colors, setColors] = useState(DEFAULT_COLORS);

  const handleColorChange = (key, value) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Введіть назву теми!');
      return;
    }
    addCustomTheme(name, colors);
    onHide(); 
    setName(''); 
    setColors(DEFAULT_COLORS);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>
        <Modal.Title>🎨 Створити свою тему</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
        
        <Form.Group className="mb-4">
          <Form.Label>Назва теми</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Наприклад: Моя космічна тема" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}
          />
        </Form.Group>

        <Row className="g-3">
          {Object.keys(DEFAULT_COLORS).map((key) => (
            <Col key={key} xs={12} sm={6}>
              <div className="d-flex align-items-center p-2 border rounded" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <Form.Control
                  type="color"
                  value={colors[key]}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  title="Обрати колір"
                  className="form-control-color me-3 border-0"
                  style={{ width: '50px' }}
                />
                <div>
                  <div className="fw-bold small">{LABELS[key]}</div>
                  <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{key}</div>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        <div className="mt-4 p-3 rounded border" style={{ 
            backgroundColor: colors['--bg-main'], 
            borderColor: colors['--border-color'],
            color: colors['--text-main']
        }}>
          <h6>Попередній перегляд</h6>
          <Card className="mb-2" style={{ backgroundColor: colors['--bg-card'], borderColor: colors['--border-color'] }}>
            <Card.Body>
              <p>Це приклад картки.</p>
              <Button style={{ backgroundColor: colors['--primary-color'], color: colors['--btn-text'], borderColor: colors['--primary-color'] }}>
                Приклад кнопки
              </Button>
            </Card.Body>
          </Card>
        </div>

      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: 'var(--bg-card)', borderTopColor: 'var(--border-color)' }}>
        <Button variant="secondary" onClick={onHide}>Скасувати</Button>
        <Button variant="success" onClick={handleSave}>💾 Зберегти тему</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ThemeCreator;