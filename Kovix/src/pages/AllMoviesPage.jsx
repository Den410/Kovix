import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Pagination, Spinner, Form, InputGroup, Button, Alert, Badge } from 'react-bootstrap';
import { moviesAPI } from '../services/api';
import MovieCard from '../components/MovieCard';

function AllMoviesPage() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedGenres, setSelectedGenres] = useState([]); 
  
  const [error, setError] = useState('');
  const pageSize = 8;

  const genresList = [
    "екшн", "драма", "комедія", "трилер", "жахи", "фантастика",
    "наукова фантастика", "Sci-Fi", "фентезі", "пригоди", 
    "бойовик", "кримінал", "детектив", "сімейний", "анімація"
  ];

  useEffect(() => {
    const genresString = selectedGenres.join(','); 
    loadMovies(page, searchTerm, genresString);
  }, [page, selectedGenres]); 

  const loadMovies = async (currentPage, currentSearch, currentGenresStr) => {
    setLoading(true);
    setError('');
    try {
      const response = await moviesAPI.getAll(currentPage, pageSize, currentSearch, currentGenresStr);
      
      const items = response.data.items || response.data.Items || [];
      const total = response.data.totalPages || response.data.TotalPages || 1;

      setMovies(items);
      setTotalPages(total);

      if (items.length === 0) {
          setError('За вашим запитом нічого не знайдено 😔');
      }
    } catch (err) {
      console.error(err);
      setError('Помилка завантаження даних.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    const genresString = selectedGenres.join(',');
    loadMovies(1, searchTerm, genresString);
  };

  const toggleGenre = (genre) => {
    setPage(1); 
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSearchTerm('');
    setPage(1);
  };

  let paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item key={number} active={number === page} onClick={() => setPage(number)}>
        {number}
      </Pagination.Item>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      <h2 className="mb-4">🎬 Каталог фільмів</h2>
      
      <Row className="mb-4">
        <Col md={12} className="mb-3">
          <Form onSubmit={handleSearchSubmit}>
            <InputGroup>
              <Form.Control 
                placeholder="Введіть назву фільму..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="primary" type="submit">🔍 Пошук</Button>
              {(searchTerm || selectedGenres.length > 0) && (
                <Button variant="outline-danger" onClick={clearFilters}>✖ Скинути</Button>
              )}
            </InputGroup>
          </Form>
        </Col>

        <Col md={12}>
          <div className="d-flex flex-wrap gap-2 align-items-center p-3 bg-light rounded border">
            <strong className="me-2 text-muted">Фільтри:</strong>
            {genresList.map(genre => {
              const isActive = selectedGenres.includes(genre);
              return (
                <Badge 
                  key={genre}
                  bg={isActive ? "primary" : "light"} 
                  text={isActive ? "white" : "dark"}
                  className={`p-2 user-select-none border ${isActive ? '' : 'border-secondary'}`}
                  style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'normal' }}
                  onClick={() => toggleGenre(genre)}
                >
                  {genre.charAt(0).toUpperCase() + genre.slice(1)}
                  {isActive && <span className="ms-2">✓</span>}
                </Badge>
              );
            })}
          </div>
        </Col>
      </Row>

      {error && <Alert variant="info">{error}</Alert>}

      {loading ? (
        <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>
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