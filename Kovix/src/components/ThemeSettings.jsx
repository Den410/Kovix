import React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useTheme } from '../contexts/ThemeContext';

function ThemeSettings({ show, onHide }) {
  const { themeMode, setThemeMode, customColors, updateCustomColor } = useTheme();

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>🎨 Налаштування теми</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h6 className="mb-3">Оберіть режим:</h6>
        <div className="d-flex gap-2 mb-4">
          <Button 
            variant={themeMode === 'light' ? 'primary' : 'outline-secondary'} 
            onClick={() => setThemeMode('light')}
            className="flex-grow-1"
          >
            ☀️ Світла
          </Button>
          <Button 
            variant={themeMode === 'dark' ? 'primary' : 'outline-secondary'} 
            onClick={() => setThemeMode('dark')}
            className="flex-grow-1"
          >
            🌙 Темна
          </Button>
          <Button 
            variant={themeMode === 'custom' ? 'primary' : 'outline-secondary'} 
            onClick={() => setThemeMode('custom')}
            className="flex-grow-1"
          >
            🎨 Власна
          </Button>
        </div>

        {themeMode === 'custom' && (
          <div 
            className="p-3 rounded border" 
            style={{ backgroundColor: '#f8f9fa', color: '#212529' }}
          >
            <h6 className="mb-3" style={{ color: '#212529' }}>Налаштуйте кольори:</h6>
            
            <Form.Group as={Row} className="mb-2 align-items-center">
              <Form.Label column sm="8">Фон сторінки</Form.Label>
              <Col sm="4">
                <Form.Control 
                  type="color" 
                  value={customColors.bgMain}
                  onChange={(e) => updateCustomColor('bgMain', e.target.value)}
                  className="w-100"
                  title="Оберіть колір"
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-2 align-items-center">
              <Form.Label column sm="8">Фон карток</Form.Label>
              <Col sm="4">
                <Form.Control 
                  type="color" 
                  value={customColors.bgCard}
                  onChange={(e) => updateCustomColor('bgCard', e.target.value)}
                  className="w-100"
                  title="Оберіть колір"
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-2 align-items-center">
              <Form.Label column sm="8">Текст</Form.Label>
              <Col sm="4">
                <Form.Control 
                  type="color" 
                  value={customColors.textMain}
                  onChange={(e) => updateCustomColor('textMain', e.target.value)}
                  className="w-100"
                  title="Оберіть колір"
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-2 align-items-center">
              <Form.Label column sm="8">Акцент (Кнопки)</Form.Label>
              <Col sm="4">
                <Form.Control 
                  type="color" 
                  value={customColors.primary}
                  onChange={(e) => updateCustomColor('primary', e.target.value)}
                  className="w-100"
                  title="Оберіть колір"
                />
              </Col>
            </Form.Group>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Закрити</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ThemeSettings;