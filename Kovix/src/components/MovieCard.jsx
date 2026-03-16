import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import defaultPosterImg from '../assets/NotFoundPoster.webp'; 
import LazyImage from './LazyImage';
import '../style/MovieCard.css';

const API_BASE_URL = 'http://localhost:5096';

function MovieCard({ movie, disableLink = false, hideMeta = false, isNew = false }) {
  const getRatingColor = (rating) => {
    if (rating >= 8) return "success";
    if (rating >= 5) return "warning";
    return "danger";
  };

  const ratingValue = movie.averageRating || movie.rating || 0;
  const genresValue = movie.genre || movie.genres || '';

  let imageUrl = defaultPosterImg;
  if (movie.posterUrl) {
      if (movie.posterUrl.startsWith('http')) {
          imageUrl = movie.posterUrl; 
      } else {
          imageUrl = `${API_BASE_URL}${movie.posterUrl}`; 
      }
  }

  const CardContent = (
    <Card className="h-100 shadow-sm movie-card">
      <div className="movie-card-img-wrapper position-relative"> 
        
        {isNew && (
          <div className="new-badge">
            <span className="new-badge-dot" />
            Новинка
          </div>
        )}

        {movie.isSeries && (
            <Badge 
                bg="primary" 
                className="position-absolute top-0 start-0 m-2 shadow-sm" 
                style={{ zIndex: 2 }}
            >
                📺 Серіал
            </Badge>
        )}

        <LazyImage
          src={imageUrl}
          alt={movie.title}
          placeholder={defaultPosterImg}
          className="movie-card-img"
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