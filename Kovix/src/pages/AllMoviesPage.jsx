import { useState, useEffect } from 'react';
import { Container, Row, Col, Pagination, Spinner, Form, InputGroup, Button, Alert, Badge } from 'react-bootstrap';
import { moviesAPI } from '../services/api';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';

function AllMoviesPage() {
  const [movies, setMovies] = useState([]);
  const [searchParams] = useSearchParams();
  const [filtersReady, setFiltersReady] = useState(false);

  
  const [availableGenres, setAvailableGenres] = useState([]); 
  const [availableYears, setAvailableYears] = useState([]);  
  
  const [selectedGenres, setSelectedGenres] = useState([]); 
  const [selectedYear, setSelectedYear] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const pageSize = 8;

  useEffect(() => {
    moviesAPI.getFilters()
      .then(res => {
        setAvailableGenres(res.data.genres || []);
        setAvailableYears(res.data.years || []);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!filtersReady) return;

    const genresString = selectedGenres.join(',');
    loadMovies(page, searchTerm, genresString, selectedYear);
  }, [page, selectedGenres, selectedYear, filtersReady]);


  useEffect(() => {
    const genresFromUrl = searchParams.get('genres');
    const yearFromUrl = searchParams.get('year');
    const searchFromUrl = searchParams.get('search');

    if (genresFromUrl) {
      setSelectedGenres(
        genresFromUrl.split(',').map(g => g.trim()).filter(Boolean)
      );
    }

    if (yearFromUrl) {
      setSelectedYear(yearFromUrl);
    }

    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
    }

    setPage(1);
    setFiltersReady(true);
  }, []);



  const loadMovies = async (currentPage, currentSearch, currentGenresStr, currentYear) => {
    setLoading(true);
    setError('');
    try {
      const response = await moviesAPI.getAll(currentPage, pageSize, currentSearch, currentGenresStr, currentYear);
      
      const items = response.data.items || [];
      const total = response.data.totalPages || 1;

      setMovies(items);
      setTotalPages(Math.ceil(response.data.totalCount / pageSize));

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
    loadMovies(1, searchTerm, genresString, selectedYear);
  };

  const toggleGenre = (genre) => {
    setPage(1); 
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleYearChange = (e) => {
      setPage(1);
      setSelectedYear(e.target.value);
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSearchTerm('');
    setSelectedYear('');
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

  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedGenres.length > 0) {
      params.set('genres', selectedGenres.join(','));
    }

    if (selectedYear) {
      params.set('year', selectedYear);
    }

    if (searchTerm) {
      params.set('search', searchTerm);
    }

    window.history.replaceState(null, '', `?${params.toString()}`);
  }, [selectedGenres, selectedYear, searchTerm]);


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
              
              <Form.Select 
                value={selectedYear} 
                onChange={handleYearChange}
                style={{ maxWidth: '150px' }}
              >
                  <option value="">Всі роки</option>
                  {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                  ))}
              </Form.Select>

              <Button variant="primary" type="submit">🔍 Пошук</Button>
              
              {(searchTerm || selectedGenres.length > 0 || selectedYear) && (
                <Button variant="outline-danger" onClick={clearFilters}>✖ Скинути</Button>
              )}
            </InputGroup>
          </Form>
        </Col>

        <Col md={12}>
          <div className="d-flex flex-wrap gap-2 align-items-center p-3 bg-light rounded border">
            <strong className="me-2 text-muted">Жанри:</strong>
            
            {availableGenres.length === 0 && <span className="text-muted small">Завантаження...</span>}

            {availableGenres.map(genre => {
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