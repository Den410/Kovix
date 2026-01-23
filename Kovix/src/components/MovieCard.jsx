import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../style/MovieCard.css';

function MovieCard({ movie, disableLink = false, hideMeta = false, isNew = false }) {
  const getRatingColor = (rating) => {
    if (rating >= 8) return "success";
    if (rating >= 5) return "warning";
    return "danger";
  };

  const ratingValue = movie.averageRating || movie.rating || 0;
  const genresValue = movie.genre || movie.genres || '';

  const CardContent = (
    <Card className="h-100 shadow-sm movie-card">
      <div className="movie-card-img-wrapper">
         {isNew && (
            <div className="new-badge">
              <span className="new-badge-dot" />
              Новинка
            </div>
          )}
        <Card.Img
          variant="top"
          src={movie.posterUrl || 'https://via.placeholder.com/300x450'}
          className="movie-card-img"
          alt={movie.title}
        />

        {!hideMeta && (
          <Badge
            bg={getRatingColor(ratingValue)}
            className="movie-rating-badge"
          >
            ⭐ {ratingValue.toFixed(1)}
          </Badge>
        )}
      </div>

      <Card.Body className="d-flex flex-column p-3">
        <Card.Title className="movie-title text-truncate" title={movie.title}>
          {movie.title}
        </Card.Title>

        {!hideMeta && (
          <Card.Text className="movie-meta text-muted small" title={`${movie.year} • ${genresValue}`}>
            {movie.year} • {genresValue}
          </Card.Text>
        )}
      </Card.Body>
    </Card>
  );

  if (disableLink) {
    return (
      <div className="movie-card-static h-100">
        {CardContent}
      </div>
    );
  }

  return (
    <Link to={`/movie/${movie.id}`} className="movie-card-link text-decoration-none">
      {CardContent}
    </Link>
  );
}

export default MovieCard;