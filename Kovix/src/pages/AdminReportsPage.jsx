import { useEffect, useState } from 'react';
import { Button, Card, Container, Badge, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { reportsAPI, usersAPI } from '../services/api'; 

function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    reportsAPI.getAll()
      .then(res => setReports(res.data.filter(r => !r.isResolved)))
      .catch(err => {
        console.error(err);
        setError('Не вдалося завантажити скарги. Можливо, у вас немає прав адміністратора.');
      });
  };

  const handleBlockUser = async (reportedUserId, reportId) => {
    if (!window.confirm("Ви впевнені, що хочете заблокувати цього користувача? Він більше не зможе писати повідомлення.")) return;
    
    try {
      await usersAPI.block(reportedUserId);
      await reportsAPI.resolve(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
      alert("Користувача заблоковано!");
    } catch (err) {
      console.error(err);
      alert("Помилка при блокуванні користувача.");
    }
  };

  const handleRejectReport = async (reportId) => {
    if (!window.confirm("Відхилити цю скаргу?")) return;

    try {
      await reportsAPI.resolve(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (err) {
      console.error(err);
      alert("Помилка при відхиленні скарги.");
    }
  };

  return (
    <Container className="mt-4" style={{ color: 'var(--text-main)' }}>
      <h3 className="mb-4">🛑 Скарги користувачів</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      {reports.length === 0 && !error && <p style={{ color: 'var(--text-secondary)' }}>Скарг немає 🎉</p>}

      {reports.map(report => (
        <Card key={report.id} className="mb-3 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
          <Card.Header className="d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--bg-panel)', borderBottom: '1px solid var(--border-color)' }}>
            <span>
              <strong style={{ color: 'var(--primary-color)' }}>{report.senderName}</strong> поскаржився на <strong style={{ color: 'var(--primary-color)' }}>{report.reportedUserName}</strong>
            </span>
            <small style={{ color: 'var(--text-secondary)' }}>
              {new Date(report.createdAt).toLocaleString()}
            </small>
          </Card.Header>

          <Card.Body>
            <div className="mb-3">
              <Badge bg="danger" className="me-2">Причина:</Badge>
              {report.reason}
            </div>

            {report.messageSnapshot && (
              <div className="p-3 rounded mb-3 fst-italic border-start border-4 border-danger" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                <small className="d-block mb-1" style={{ color: 'var(--text-secondary)' }}>Зміст повідомлення (Зліпок):</small>
                "{report.messageSnapshot}"
              </div>
            )}

            <hr style={{ borderColor: 'var(--border-color)' }} />

            <div className="d-flex justify-content-between align-items-center">
              <div>
                <Button
                  variant="outline-warning"
                  size="sm"
                  className="me-2"
                  onClick={() => handleBlockUser(report.reportedUserId, report.id)}
                >
                  🚫 Заблокувати порушника
                </Button>

                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => handleRejectReport(report.id)}
                >
                  ✅ Відхилити скаргу (Немає порушень)
                </Button>
              </div>

              {report.isGeneralChat ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/chat?messageId=${report.messageId}`)}
                  disabled={!report.messageId}
                >
                  🔗 Перейти в Загальний чат
                </Button>
              ) : (
                <Badge bg="secondary" className="p-2 fw-normal" style={{ fontSize: '0.85rem' }}>
                  🔒 Приватна переписка
                </Badge>
              )}
            </div>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}

export default AdminReportsPage;