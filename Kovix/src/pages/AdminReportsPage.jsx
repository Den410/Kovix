import { useEffect, useState } from 'react';
import { Button, Card, Container, Badge, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { reportsAPI } from '../services/api';

function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    reportsAPI.getAll()
      .then(res => setReports(res.data))
      .catch(err => {
        console.error(err);
        setError('Не вдалося завантажити скарги. Можливо, у вас немає прав адміністратора.');
      });
  }, []);

  return (
    <Container className="mt-4">
      <h3 className="mb-4">🛑 Скарги користувачів</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      {reports.length === 0 && !error && <p className="text-muted">Скарг немає 🎉</p>}

      {reports.map(report => (
        <Card key={report.id} className="mb-3 shadow-sm">
          <Card.Header className="d-flex justify-content-between align-items-center bg-light">
            <span>
              <strong>{report.senderName}</strong> поскаржився на <strong>{report.reportedUserName}</strong>
            </span>
            <small className="text-muted">
              {new Date(report.createdAt).toLocaleString()}
            </small>
          </Card.Header>
          <Card.Body>
            <div className="mb-3">
              <Badge bg="danger" className="me-2">Причина:</Badge>
              {report.reason}
            </div>

            {report.messageSnapshot && (
              <div className="p-2 bg-secondary bg-opacity-10 rounded mb-3 fst-italic border-start border-4 border-danger">
                <small className="text-muted d-block mb-1">Зміст повідомлення:</small>
                "{report.messageSnapshot}"
              </div>
            )}

            <div className="d-flex justify-content-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  let url = `/chat?highlight=${report.messageId}`;

                  if (!report.isGeneralChat) {
                    url += `&activeChat=${report.reportedUserId}`;
                  }

                  navigate(url);
                }}
                disabled={!report.messageId}
              >
                🔗 Перейти до повідомлення в чаті
              </Button>
            </div>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}

export default AdminReportsPage;