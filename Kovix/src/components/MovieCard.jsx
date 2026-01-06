import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../style/MovieCard.css';

function MovieCard({ movie }) {
  const getRatingColor = (rating) => {
    if (rating >= 8) return "success";
    if (rating >= 5) return "warning";
    return "danger";
  };

  return (
    <Link to={`/movie/${movie.id}`} className="movie-card-link">
      <Card className="h-100 shadow-sm movie-card">
        <div className="movie-card-img-wrapper">
          <Card.Img
            src={movie.posterUrl || 'https://via.placeholder.com/300x450'}
            className="movie-card-img"
          />

          <Badge
            bg={getRatingColor(movie.averageRating)}
            className="movie-rating-badge"
          >
            ⭐ {movie.averageRating ? movie.averageRating.toFixed(1) : '0.0'}
          </Badge>
        </div>

        <Card.Body className="d-flex flex-column">
          <Card.Title className="movie-title">
            {movie.title}
          </Card.Title>

         <Card.Text className="movie-meta" title={`${movie.year} • ${movie.genre}`}>
            {movie.year} • {movie.genre}
          </Card.Text>
        </Card.Body>
      </Card>
    </Link>
  );
}

export default MovieCard;