import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { moviesAPI } from '../services/api';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';

function HomePage() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      setLoading(true);
      const [trendingRes, topRatedRes] = await Promise.all([
        moviesAPI.getTrending(),
        moviesAPI.getTopRated()
      ]);
      setTrendingMovies(trendingRes.data);
      setTopRatedMovies(topRatedRes.data);
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Завантаження...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <SearchBar />
      
      <section className="mb-5 mt-4">
        <h2 className="mb-4">🔥 Популярні зараз</h2>
        <Row>
          {trendingMovies.map((movie) => (
            <Col key={movie.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <MovieCard movie={movie} />
            </Col>
          ))}
        </Row>
      </section>

      <section className="mb-5">
        <h2 className="mb-4">⭐ Найкращі за рейтингом</h2>
        <Row>
          {topRatedMovies.map((movie) => (
            <Col key={movie.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <MovieCard movie={movie} />
            </Col>
          ))}
        </Row>
      </section>
    </Container>
  );
}

export default HomePage;