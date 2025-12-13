import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { moviesAPI } from '../services/api';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';

function SearchPage() {
  const [searchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    if (searchQuery) {
      searchMovies();
    }
  }, [searchQuery]);

  const searchMovies = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await moviesAPI.getAll({ search: searchQuery });
      setMovies(response.data);
      
      if (response.data.length === 0) {
        setError('Нічого не знайдено. Спробуйте інший запит.');
      }
    } catch (err) {
      setError('Помилка при пошуку фільмів');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <SearchBar />
      
      {searchQuery && (
        <h3 className="mt-4 mb-4">
          Результати пошуку: "{searchQuery}"
        </h3>
      )}

      {loading && (
        <div className="text-center mt-5">
          <Spinner animation="border" />
        </div>
      )}

      {error && (
        <Alert variant="info" className="mt-4">
          {error}
        </Alert>
      )}

      {!loading && movies.length > 0 && (
        <Row>
          {movies.map((movie) => (
            <Col key={movie.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <MovieCard movie={movie} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default SearchPage;