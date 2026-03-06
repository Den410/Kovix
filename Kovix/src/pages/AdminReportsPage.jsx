import { useEffect, useState } from 'react';
import { Button, Card, Container, Badge, Alert, Nav } from 'react-bootstrap'; 
import { useNavigate } from 'react-router-dom';
import { reportsAPI } from '../services/api'; 

function AdminReportsPage() {
  const [allReports, setAllReports] = useState([]); 
  const [activeTab, setActiveTab] = useState('pending');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    reportsAPI.getAll()
      .then(res => setAllReports(res.data))
      .catch(err => {
        setError('Не вдалося завантажити скарги.');
      });
  };

  const displayedReports = allReports.filter(r => 
    activeTab === 'pending' ? !r.isResolved : r.isResolved
  );

  const handleProcessReport = async (reportId, status, comment) => {
    const actionName = status === 3 ? "заблокувати" : "відхилити";
    if (!window.confirm(`Ви впевнені, що хочете ${actionName} цю скаргу?`)) return;

    try {
      await reportsAPI.resolve(reportId, { 
        status: status, 
        adminComment: comment 
      });
      
      alert("Опрацьовано!");
      loadReports(); 
    } catch (err) {
      alert("Помилка при опрацюванні.");
    }
  };

  return (
    <Container className="mt-4" style={{ color: 'var(--text-main)' }}>
      <h3 className="mb-4">🛑 Управління скаргами</h3>

      <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        <Nav.Item>
          <Nav.Link eventKey="pending" className="text-warning">Нові скарги</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="history" className="text-info">Історія опрацьованих</Nav.Link>
        </Nav.Item>
      </Nav>

      {error && <Alert variant="danger">{error}</Alert>}

      {displayedReports.length === 0 && <p className="text-center mt-5">Тут поки порожньо ☕</p>}

      {displayedReports.map(report => (
        <Card key={`report-${report.id}`} className="mb-3 shadow-sm bg-card text-main border-color">
          <Card.Header className="d-flex justify-content-between align-items-center bg-panel border-color">
            <span>
              <strong>{report.senderName}</strong> ➡️ <strong>{report.reportedUserName}</strong>
            </span>
            <div className="text-end">
              {report.isResolved && (
                <Badge bg={report.status === 3 ? "danger" : "secondary"} className="me-2">
                  {report.status === 3 ? "Блокування" : "Відхилено"}
                </Badge>
              )}
              <small className="text-secondary">{new Date(report.createdAt).toLocaleString()}</small>
            </div>
          </Card.Header>

          <Card.Body>
            <p><strong>Причина:</strong> {report.reason}</p>
            
            {report.messageSnapshot && (
              <div className="p-3 rounded mb-3 fst-italic border-start border-4 border-danger bg-opacity-10 bg-white">
                "{report.messageSnapshot}"
              </div>
            )}

            {report.isResolved && report.adminComment && (
              <Alert variant="dark" className="small py-2 mt-2">
                <strong>Вердикт:</strong> {report.adminComment}
              </Alert>
            )}

            <hr className="border-color" />

            <div className="d-flex justify-content-between">
              {!report.isResolved ? (
                <div>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    className="me-2"
                    onClick={() => handleProcessReport(report.id, 3, "Порушення правил спільноти")}
                  >
                    🚫 Блокувати
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => handleProcessReport(report.id, 2, "Недостатньо доказів порушення")}
                  >
                    ✅ Відхилити
                  </Button>
                </div>
              ) : (
                <span className="text-muted small italic">Скарга вже розглянута</span>
              )}

              {report.isGeneralChat && (
                <Button variant="link" size="sm" onClick={() => navigate(`/chat?messageId=${report.messageId}`)}>
                  🔗 Перейти до чату
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}

export default AdminReportsPage;