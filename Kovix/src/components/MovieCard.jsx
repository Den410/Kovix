import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './MovieCard.css';

function MovieCard({ movie }) {
  return (
    <Link to={`/movie/${movie.id}`} style={{ textDecoration: 'none' }}>
      <Card className="movie-card h-100">
        <div className="movie-poster-wrapper">
          <Card.Img 
            variant="top" 
            src={movie.posterUrl || 'https://via.placeholder.com/300x450?text=No+Image'} 
            alt={movie.title}
            className="movie-poster"
          />
          <div className="movie-rating">
            <span className="rating-value">⭐ {movie.averageRating.toFixed(1)}</span>
          </div>
        </div>
        <Card.Body>
          <Card.Title className="movie-title">{movie.title}</Card.Title>
          <Card.Text className="movie-info">
            <small className="text-muted">
              {movie.year} • {movie.genre}
            </small>
          </Card.Text>
          <Card.Text className="movie-reviews">
            <small>{movie.totalReviews} відгуків</small>
          </Card.Text>
        </Card.Body>
      </Card>
    </Link>
  );
}

export default MovieCard;