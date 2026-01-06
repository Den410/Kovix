import React, { useState, useEffect } from 'react';
import { Container, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { moviesAPI } from '../services/api';
import MovieCard from '../components/MovieCard';
import SlickSlider from "react-slick";
const Slider = SlickSlider.default;
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../style/HomePage.css';

function HomePage() {
  const [newMovies, setNewMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [newRes, topRes] = await Promise.all([
        moviesAPI.getNew(),
        moviesAPI.getTopRated()
      ]);
      setNewMovies(newRes.data);
      setTopRatedMovies(topRes.data);
    } catch (error) {
      console.error(error);
      setError('Не вдалося завантажити дані.');
    } finally {
      setLoading(false);
    }
  };

  const sliderSettings = {
    dots: false,       
    infinite: true, 
    speed: 500,          
    slidesToShow: 4, 
    slidesToScroll: 1,  
    autoplay: true,    
    autoplaySpeed: 3000,
    responsive: [      
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } }
    ]
  };

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
  console.log("Slider type:", typeof Slider, Slider);

  return (
    <Container className="mt-4 pb-5">
      {error && <Alert variant="danger">{error}</Alert>}

      <section className="mb-5 slider-section">
        <h3 className="mb-3 border-start border-4 border-warning ps-2">🔥 Новинки</h3>
        {newMovies.length > 0 ? (
          <Slider {...sliderSettings}>
            {newMovies.map((movie) => (
              <div key={movie.id} className="p-2"> 
                <MovieCard movie={movie} />
              </div>
            ))}
          </Slider>
        ) : (
          <p className="text-muted">Немає нових фільмів</p>
        )}
      </section>

      <section className="mb-5 slider-section">
        <h3 className="mb-3 border-start border-4 border-warning ps-2">⭐ Найкращі за рейтингом</h3>
        {topRatedMovies.length > 0 ? (
          <Slider {...sliderSettings}>
            {topRatedMovies.map((movie) => (
              <div key={movie.id} className="p-2">
                <MovieCard movie={movie} />
              </div>
            ))}
          </Slider>
        ) : (
          <p className="text-muted">Немає рейтингів</p>
        )}
      </section>

      <div className="text-center mt-5 p-5 bg-light rounded shadow-sm">
        <h2>🎬 Шукаєте щось конкретне?</h2>
        <p className="lead">Перегляньте повний каталог фільмів з пошуком.</p>
        <Link to="/movies">
          <Button variant="primary" size="lg">Відкрити каталог фільмів</Button>
        </Link>
      </div>

    </Container>
  );
}

export default HomePage;