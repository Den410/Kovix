import React, { useState } from 'react';
import { Modal, Button, Row, Col, Badge, Form, Tabs, Tab } from 'react-bootstrap';
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
  '--bg-card': 'Фон карток',
  '--text-main': 'Основний текст',
  '--text-secondary': 'Додатковий текст',
  '--border-color': 'Колір рамок',
  '--primary-color': 'Акцентний колір',
  '--btn-text': 'Текст на кнопці'
};

function ThemeSettings({ show, onHide }) {
  const { themes, currentTheme, changeTheme, addCustomTheme, removeCustomTheme } = useTheme();
  
  const [newThemeName, setNewThemeName] = useState('');
  const [newColors, setNewColors] = useState(DEFAULT_COLORS);
  const [activeTab, setActiveTab] = useState('presets');

  const handleCreate = () => {
    if (!newThemeName.trim()) return alert("Введіть назву теми!");
    addCustomTheme(newThemeName, newColors);
    setNewThemeName('');
    setActiveTab('presets'); 
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>
        <Modal.Title>🎨 Налаштування теми</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
        
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
          
          <Tab eventKey="presets" title="📚 Готові теми">
            <Row className="g-3">
              {Object.entries(themes).map(([key, theme]) => (
                <Col key={key} xs={6} md={4} lg={4}>
                  <div 
                    className={`position-relative p-2 rounded border h-100 d-flex flex-column ${currentTheme === key ? 'border-primary border-3' : 'border-secondary'}`}
                    style={{ cursor: 'pointer', backgroundColor: theme.colors['--bg-card'] }}
                    onClick={() => changeTheme(key)}
                  >
                    {theme.isCustom && (
                      <Button 
                        variant="danger" size="sm" 
                        className="position-absolute top-0 end-0 m-1 py-0 px-1"
                        style={{ zIndex: 10, lineHeight: 1 }}
                        onClick={(e) => { e.stopPropagation(); removeCustomTheme(key); }}
                      >
                        ×
                      </Button>
                    )}

                    <div className="d-flex mb-2 rounded overflow-hidden border" style={{ height: '30px' }}>
                      <div style={{ flex: 1, backgroundColor: theme.colors['--bg-main'] }}></div>
                      <div style={{ flex: 1, backgroundColor: theme.colors['--text-main'] }}></div>
                      <div style={{ flex: 1, backgroundColor: theme.colors['--primary-color'] }}></div>
                    </div>

                    <div className="text-center small fw-bold" style={{ color: theme.colors['--text-main'] }}>
                      {theme.name}
                      {currentTheme === key && <Badge bg="primary" className="ms-1">✓</Badge>}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Tab>

          <Tab eventKey="create" title="✏️ Створити свою">
            <Form.Group className="mb-3">
              <Form.Label>Назва теми</Form.Label>
              <Form.Control 
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
                placeholder="Моя супер тема"
                style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}
              />
            </Form.Group>

            <Row className="g-3">
              {Object.keys(DEFAULT_COLORS).map((key) => (
                <Col key={key} xs={12} sm={6}>
                  <div className="d-flex align-items-center p-2 border rounded" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                    <Form.Control
                      type="color"
                      value={newColors[key]}
                      onChange={(e) => setNewColors({ ...newColors, [key]: e.target.value })}
                      className="form-control-color me-2 border-0"
                      title="Обрати колір"
                    />
                    <div>
                      <div className="fw-bold small">{LABELS[key]}</div>
                      <div className="text-muted small" style={{ fontSize: '0.7rem' }}>{key}</div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
            
            <div className="d-grid mt-4">
               <Button variant="success" onClick={handleCreate}>💾 Зберегти нову тему</Button>
            </div>
          </Tab>
        </Tabs>

      </Modal.Body>
    </Modal>
  );
}

export default ThemeSettings;