import { useState, useEffect } from 'react';
import { Card, Button, Form, Spinner } from 'react-bootstrap';
import { moviesAPI } from '../services/api';
import '../style/TierListBuilder.css';

const TIERS = ['S', 'A', 'B', 'C', 'D', 'F'];
const TIER_COLORS = {
  'S': '#FF6B6B',
  'A': '#4ECDC4',
  'B': '#45B7D1',
  'C': '#FFA502',
  'D': '#95E1D3',
  'F': '#C7CEEA'
};

function TierListBuilder({ items, onItemsChange, tierListId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [bankMovies, setBankMovies] = useState([]);
  const [loadingBank, setLoadingBank] = useState(true);
  
  const [draggedData, setDraggedData] = useState(null);

  useEffect(() => {
    loadMoviesToBank('');
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadMoviesToBank(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const loadMoviesToBank = async (query) => {
    setLoadingBank(true);
    try {
      const response = await moviesAPI.getAll(1, 100, query);
      const fetchedMovies = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.items || response.data?.results || response.data?.data || []);
      
      setBankMovies(fetchedMovies);
    } catch (error) {
      console.error('Помилка завантаження банку фільмів:', error);
      setBankMovies([]);
    } finally {
      setLoadingBank(false);
    }
  };

  const availableBankMovies = bankMovies.filter(
    movie => !items.find(item => item.movieId === movie.id)
  );

  const handleDragStart = (e, source, data) => {
    setDraggedData({ source, data });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnTier = (e, targetTier) => {
    e.preventDefault();
    if (!draggedData) return;

    if (draggedData.source === 'BANK') {
      const newItem = {
        id: Math.random(),
        movieId: draggedData.data.id,
        movieTitle: draggedData.data.title,
        moviePosterUrl: draggedData.data.posterUrl,
        tier: targetTier,
        position: items.filter(i => i.tier === targetTier).length
      };
      onItemsChange([...items, newItem]);
    } else if (draggedData.source === 'TIER' && draggedData.data.tier !== targetTier) {
      const updatedItems = items.map(item =>
        item.id === draggedData.data.id ? { ...item, tier: targetTier } : item
      );
      onItemsChange(updatedItems);
    }
    setDraggedData(null);
  };

  const handleDropOnBank = (e) => {
    e.preventDefault();
    if (!draggedData) return;

    if (draggedData.source === 'TIER') {
      onItemsChange(items.filter(item => item.id !== draggedData.data.id));
    }
    setDraggedData(null);
  };

  const handleRemoveFromTier = (itemId) => {
    onItemsChange(items.filter(item => item.id !== itemId));
  };

  const handleChangeTier = (itemId, newTier) => {
    const updatedItems = items.map(item => 
      item.id === itemId ? { ...item, tier: newTier } : item
    );
    onItemsChange(updatedItems);
  };

  const groupedByTier = TIERS.reduce((acc, tier) => {
    acc[tier] = items.filter(item => item.tier === tier);
    return acc;
  }, {});

  const renderBankCard = (movie) => (
    <div
      key={movie.id}
      className="tier-item shadow-sm"
      draggable
      onDragStart={(e) => handleDragStart(e, 'BANK', movie)}
      style={{ width: '120px', minWidth: '120px', cursor: 'grab' }}
    >
      <div className="tier-item-poster" style={{ height: '180px' }}>
        {movie.posterUrl ? (
          <img src={movie.posterUrl} alt={movie.title} />
        ) : (
          <div className="poster-placeholder" style={{ backgroundColor: 'var(--bg-card)' }}>
            {movie.title}
          </div>
        )}
      </div>
      <div className="p-2 text-center text-truncate small fw-bold" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', borderTop: '1px solid var(--border-color)' }}>
        {movie.title}
      </div>
    </div>
  );

  const renderTierCard = (item) => (
    <div
      key={item.id}
      className="tier-item"
      draggable
      onDragStart={(e) => handleDragStart(e, 'TIER', item)}
    >
      <div className="tier-item-poster">
        {item.moviePosterUrl ? (
          <img src={item.moviePosterUrl} alt={item.movieTitle} />
        ) : (
          <div className="poster-placeholder" style={{ backgroundColor: 'var(--bg-card)' }}>
            {item.movieTitle}
          </div>
        )}
      </div>

      <div className="tier-item-info" style={{ backgroundColor: 'var(--bg-card)' }}>
        <p className="tier-item-title text-truncate" style={{ color: 'var(--text-main)' }} title={item.movieTitle}>
          {item.movieTitle}
        </p>
        
        <Form.Select
          size="sm"
          value={item.tier}
          onChange={(e) => handleChangeTier(item.id, e.target.value)}
          className="mb-2 fw-bold"
          style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}
        >
          {TIERS.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Form.Select>

        <Button
          size="sm"
          variant="danger"
          onClick={() => handleRemoveFromTier(item.id)}
          className="w-100"
        >
          Видалити
        </Button>
      </div>
    </div>
  );

  return (
    <div className="tier-list-builder">
      <Card className="mb-4 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0" style={{ color: 'var(--text-main)' }}>🔍 Пошук фільмів</h5>
            <Form.Control
              type="text"
              placeholder="Введіть назву фільму..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '60%', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}
            />
          </div>
        </Card.Body>
      </Card>

      <Card className="tier-list-table mb-4 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <Card.Body className="p-0">
          {TIERS.map(tier => (
            <div key={tier} className="tier-row" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div 
                className="tier-label"
                style={{ backgroundColor: TIER_COLORS[tier] }}
              >
                <strong style={{ color: '#fff', fontSize: '1.5rem' }}>{tier}</strong>
              </div>

              <div 
                className="tier-items-container"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnTier(e, tier)}
                style={{ backgroundColor: 'var(--bg-main)' }}
              >
                {groupedByTier[tier].length === 0 ? (
                  <div className="tier-empty-message text-muted" style={{ opacity: 0.6 }}>
                    Перетягніть фільм сюди
                  </div>
                ) : (
                  <div className="tier-items">
                    {groupedByTier[tier].map(item => renderTierCard(item))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </Card.Body>
      </Card>

      <Card className="shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <Card.Header style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
          <h5 className="mb-0" style={{ color: 'var(--text-main)' }}>
            Перелік всіх фільмів <span className="text-muted fs-6">({availableBankMovies.length})</span>
          </h5>
        </Card.Header>
        <Card.Body 
          className="tier-items-container p-3"
          onDragOver={handleDragOver}
          onDrop={handleDropOnBank}
          style={{ 
            backgroundColor: 'var(--bg-main)', 
            minHeight: '220px', 
            maxHeight: '400px',
            overflowY: 'auto',
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '12px',
          }}
        >
          {loadingBank ? (
            <div className="w-100 d-flex justify-content-center align-items-center">
              <Spinner animation="border" style={{ color: 'var(--text-main)' }} />
            </div>
          ) : availableBankMovies.length === 0 ? (
            <div className="text-muted w-100 text-center mt-5">
              {searchQuery ? "Фільми не знайдені. Спробуйте іншу назву." : "Всі фільми вже розподілені!"}
            </div>
          ) : (
            availableBankMovies.map(movie => renderBankCard(movie))
          )}
        </Card.Body>
      </Card>

    </div>
  );
}

export default TierListBuilder;