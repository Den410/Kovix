import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Card, Row, Col, Badge, Button } from 'react-bootstrap';
import ThemeCreator from './ThemeCreator'; 

const ThemeSelector = () => {
  const { currentTheme, changeTheme, themes, removeCustomTheme } = useTheme();
  const [showCreator, setShowCreator] = useState(false);

  return (
    <>
      <Card className="mb-4 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
             <h5 className="m-0" style={{ color: 'var(--text-main)' }}>🎨 Тема оформлення</h5>
             <Button variant="outline-primary" size="sm" onClick={() => setShowCreator(true)}>
               + Створити свою
             </Button>
          </div>
          
          <Row className="g-3">
            {Object.entries(themes).map(([key, theme]) => (
              <Col key={key} xs={6} md={4} lg={3}>
                <div 
                  className={`position-relative p-2 rounded border h-100 d-flex flex-column ${currentTheme === key ? 'border-primary border-3' : 'border-secondary'}`}
                  style={{ cursor: 'pointer', transition: 'transform 0.2s', backgroundColor: 'var(--bg-main)' }}
                >
                  {theme.isCustom && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeCustomTheme(key); }}
                      className="position-absolute top-0 end-0 btn btn-sm btn-danger py-0 px-1 m-1"
                      style={{ zIndex: 10, lineHeight: 1 }}
                      title="Видалити тему"
                    >
                      ×
                    </button>
                  )}

                  <div onClick={() => changeTheme(key)} className="flex-grow-1">
                      <div className="d-flex mb-2 rounded overflow-hidden shadow-sm" style={{ height: '30px', border: '1px solid #dee2e6' }}>
                        <div style={{ flex: 1, backgroundColor: theme.colors['--bg-main'] }}></div>
                        <div style={{ flex: 1, backgroundColor: theme.colors['--bg-card'] }}></div>
                        <div style={{ flex: 1, backgroundColor: theme.colors['--primary-color'] }}></div>
                      </div>
                      
                      <div className="text-center small fw-bold text-truncate" style={{ color: 'var(--text-main)' }}>
                        {theme.name}
                        {currentTheme === key && <Badge bg="primary" className="ms-1">✓</Badge>}
                      </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      <ThemeCreator show={showCreator} onHide={() => setShowCreator(false)} />
    </>
  );
};

export default ThemeSelector;