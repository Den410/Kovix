import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../style/TierListCard.css';

function TierListCard({ tierList, onDelete, isOwner }) {
  const getTimeAgo = (date) => {
    const now = new Date();
    const createdDate = new Date(date);
    const diffMs = now - createdDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} хвилин${diffMins % 10 === 1 && diffMins % 100 !== 11 ? 'у' : ''} тому`;
    if (diffHours < 24) return `${diffHours} годин${diffHours % 10 === 1 && diffHours % 100 !== 11 ? 'и' : ''} тому`;
    if (diffDays < 30) return `${diffDays} днів тому`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} місяць${diffMonths % 10 === 1 && diffMonths % 100 !== 11 ? 'och' : 'ів'} тому`;
    
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} років тому`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Approved':
        return 'Схвалено';
      case 'Pending':
        return 'На модерації';
      case 'Rejected':
        return 'Відхилено';
      default:
        return 'Невідомо';
    }
  };

  return (
    <Card className="tier-list-card h-100">
      <Card.Body className="d-flex flex-column">
        <div className="mb-3">
          <Link 
            to={`/tierlists/${tierList.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Card.Title className="mb-2">{tierList.title}</Card.Title>
          </Link>
          
          <div className="d-flex gap-2 align-items-center flex-wrap">
            {tierList.isPublic && (
              <Badge bg={getStatusColor(tierList.status)}>
                {getStatusLabel(tierList.status)}
              </Badge>
            )}
            <Badge bg="info">
              {tierList.itemCount} фільмів
            </Badge>
          </div>
        </div>

        {tierList.description && (
          <p className="text-muted small mb-2">
            {tierList.description.length > 100 
              ? tierList.description.substring(0, 100) + '...' 
              : tierList.description}
          </p>
        )}

        <div className="flex-grow-1"></div>

        <div className="text-muted small mb-3">
          <p className="mb-1">
            <strong>Автор:</strong> {tierList.username}
          </p>
          <p className="mb-0">
            <strong>Створено:</strong> {getTimeAgo(tierList.createdAt)}
          </p>
        </div>

        <div className="d-grid gap-2">
          <Link to={`/tierlists/${tierList.id}`}>
            <Button variant="outline-primary" className="w-100">
              Переглянути
            </Button>
          </Link>

          {isOwner && (
            <>
              <Link to={`/tierlists/${tierList.id}/edit`}>
                <Button variant="outline-secondary" className="w-100">
                  Редагувати
                </Button>
              </Link>
              <Button 
                variant="outline-danger"
                onClick={() => onDelete(tierList.id)}
              >
                Видалити
              </Button>
            </>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

export default TierListCard;