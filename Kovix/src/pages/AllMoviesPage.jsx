import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Pagination, Spinner, Form, InputGroup, Button, Alert } from 'react-bootstrap';
import { moviesAPI } from '../services/api';
import MovieCard from '../components/MovieCard';

function AllMoviesPage() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const pageSize = 8;

  useEffect(() => {
    loadMovies();
  }, [page]); 

  const loadMovies = async (search = searchTerm) => {
    setLoading(true);
    setError('');
    try {
      const response = await moviesAPI.getAll(page, pageSize, search);
      
      console.log("Відповідь сервера:", response.data); 

      let items = [];
      let total = 1;

      if (response.data && (response.data.items || response.data.Items)) {
        items = response.data.items || response.data.Items;
        total = response.data.totalPages || response.data.TotalPages || 1;
      } 
      else if (Array.isArray(response.data)) {
        items = response.data;
        total = 1; 
      }
      else {
        console.error("Невідомий формат даних:", response.data);
      }

      setMovies(items);
      setTotalPages(total);

      if (items.length === 0 && page === 1) {
          setError('Фільмів не знайдено 😔');
      }

    } catch (error) {
      console.error("Помилка:", error);
      setError('Не вдалося завантажити каталог. Перевірте, чи запущено сервер.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadMovies(searchTerm);
  };

  let paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item key={number} active={number === page} onClick={() => setPage(number)}>
        {number}
      </Pagination.Item>,
    );
  }

  return (
    <Container className="mt-4 mb-5">
      <h2 className="mb-4">🎬 Каталог фільмів</h2>
      
      <Form onSubmit={handleSearch} className="mb-4">
        <InputGroup>
          <Form.Control 
            placeholder="Введіть назву фільму..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="primary" type="submit">Пошук</Button>
        </InputGroup>
      </Form>

      {error && <Alert variant="info">{error}</Alert>}

      {loading ? (
        <div className="text-center mt-5"><Spinner animation="border" /></div>
      ) : (
        <>
          <Row>
            {movies.map(movie => (
              <Col key={movie.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                <MovieCard movie={movie} />
              </Col>
            ))}
          </Row>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>{paginationItems}</Pagination>
            </div>
          )}
        </>
      )}
    </Container>
  );
}

export default AllMoviesPage;