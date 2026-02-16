import { useState, useEffect } from 'react';
import { Modal, Button, Form, Tabs, Tab, Row, Col, ListGroup, Image, InputGroup } from 'react-bootstrap';
import { moviesAPI, actorsAPI } from '../services/api';

function AdminMovieModal({ show, onHide, movieToEdit, onSuccess }) {
  const [activeTab, setActiveTab] = useState('info');

  const [formData, setFormData] = useState({
    title: '', description: '', year: new Date().getFullYear(), genre: '', director: '',
    posterUrl: '', trailerUrl: '', isSeries: false
  });

  const [allActors, setAllActors] = useState([]);
  const [movieCast, setMovieCast] = useState([]);
  const [selectedActorId, setSelectedActorId] = useState('');
  const [roleName, setRoleName] = useState('');

  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (show) {
      setActiveTab('info');
      setSearchResults([]);

      actorsAPI.getAll()
        .then(res => {
          if (Array.isArray(res.data)) setAllActors(res.data);
          else setAllActors([]);
        })
        .catch(err => {
          console.error("Error loading actors:", err);
          setAllActors([]);
        });

      if (movieToEdit) {
        setFormData({
          title: movieToEdit.title,
          description: movieToEdit.description,
          year: movieToEdit.year,
          genre: movieToEdit.genre,
          director: movieToEdit.director,
          posterUrl: movieToEdit.posterUrl,
          trailerUrl: movieToEdit.trailerUrl,
          isSeries: movieToEdit.isSeries,
        });
        if (movieToEdit.cast) {
          setMovieCast(movieToEdit.cast);
        }
      } else {
        setFormData({
          title: '', description: '', year: new Date().getFullYear(), genre: '', director: '',
          posterUrl: '', trailerUrl: '', isSeries: false
        });
        setMovieCast([]);
      }
    }
  }, [show, movieToEdit]);

  const handleSearchTmdb = async () => {
    if (!formData.title) return alert("Введіть назву для пошуку!");

    setIsSearching(true);
    setSearchResults([]);

    try {
      const res = await moviesAPI.searchTmdb(formData.title);
      if (res.data && Array.isArray(res.data)) {
        setSearchResults(res.data);
        if (res.data.length === 0) alert("Нічого не знайдено 😔");
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error(error);
      alert("Помилка пошуку");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectTmdbMovie = async (movieFromSearch) => {
    setIsSearching(true);
    try {
      const res = await moviesAPI.getTmdbDetails(movieFromSearch.tmdbId);
      const data = res.data;

      setFormData(prev => ({
        ...prev,
        title: prev.title || data.title,       
        description: prev.description || data.description,
        year: prev.year || data.year,
        posterUrl: prev.posterUrl || movieFromSearch.posterUrl || data.posterUrl,
      }));


      const newCastList = [];

      const castSource = data.cast || data.Cast || [];

      if (Array.isArray(castSource)) {
        for (const actorDto of castSource) {
          let actorId = actorDto.actorId;

          if (actorId === 0) {
            try {
              const createRes = await actorsAPI.create({
                name: actorDto.name,
                bio: `Actor from ${movieFromSearch.title}`,
                photoUrl: actorDto.photoUrl
              });
              actorId = createRes.data.id;

              setAllActors(prev => [...prev, createRes.data]);
            } catch (err) {
              console.error(`Failed to create actor ${actorDto.name}:`, err.response?.data || err.message);
              continue;
            }
          }

          newCastList.push({
            actorId: actorId,
            name: actorDto.name,
            role: actorDto.role
          });
        }
      } else {
        console.warn("Поле 'cast' не знайдено або не є масивом!", data);
      }
      setMovieCast(newCastList);

      setSearchResults([]);
      setActiveTab('cast');

    } catch (error) {
      console.error("Critical error inside handleSelectTmdbMovie:", error);
      alert("Помилка завантаження деталей: " + (error.response?.data || error.message));
    } finally {
      setIsSearching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddActor = () => {
    if (!selectedActorId || !roleName.trim()) return;
    const actorInfo = allActors.find(a => a.id === parseInt(selectedActorId));
    if (!actorInfo) return;

    if (movieCast.some(c => c.actorId === actorInfo.id)) {
      alert("Цей актор вже доданий!");
      return;
    }

    const newCastMember = {
      actorId: actorInfo.id,
      name: actorInfo.name,
      role: roleName
    };

    setMovieCast([...movieCast, newCastMember]);
    setSelectedActorId('');
    setRoleName('');
  };

  const handleRemoveActor = (actorId) => {
    setMovieCast(movieCast.filter(c => c.actorId !== actorId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        year: parseInt(formData.year),
        cast: movieCast.map(c => ({ actorId: c.actorId, role: c.role }))
      };

      if (movieToEdit) {
        await moviesAPI.update(movieToEdit.id, dataToSend);
      } else {
        await moviesAPI.create(dataToSend);
      }
      onSuccess();
      onHide();
    } catch (error) {
      console.error(error);
      alert('Помилка збереження');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered contentClassName="bg-card text-main">
      <Modal.Header closeButton style={{ borderColor: 'var(--border-color)' }}>
        <Modal.Title>{movieToEdit ? 'Редагувати фільм' : 'Додати фільм'}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: 'var(--bg-main)' }}>
        <Form onSubmit={handleSubmit}>

          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            id="admin-movie-tabs"
            className="mb-3"
          >

            <Tab eventKey="info" title="Інформація">
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3 position-relative">
                    <Form.Label>Назва</Form.Label>
                    <InputGroup>
                      <Form.Control
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Введіть назву (напр. Хмарочос)"
                        className="bg-input text-main border-secondary"
                      />
                      <Button
                        variant="info"
                        onClick={handleSearchTmdb}
                        disabled={isSearching}
                      >
                        {isSearching ? '⏳' : '🔍 Знайти'}
                      </Button>
                    </InputGroup>

                    {Array.isArray(searchResults) && searchResults.length > 0 && (
                      <ListGroup
                        className="mt-1 shadow position-absolute w-100"
                        style={{ zIndex: 1050, maxHeight: '350px', overflowY: 'auto', border: '1px solid var(--border-color)' }}
                      >
                        {searchResults.map(m => (
                          <ListGroup.Item
                            key={m.tmdbId}
                            action
                            type="button"
                            onClick={(e) => { e.preventDefault(); handleSelectTmdbMovie(m); }}
                            className="d-flex align-items-center gap-3 bg-card text-main border-secondary"
                            style={{ cursor: 'pointer' }}
                          >

                            <Image
                              src={m.posterUrl || 'https://via.placeholder.com/45x68?text=No+Img'}
                              rounded
                              style={{ width: 45, height: 68, objectFit: 'cover' }}
                            />
                            <div>
                              <div className="fw-bold">{m.title}</div>
                              <div className="small text-muted">
                                {m.releaseDate ? m.releaseDate.split('-')[0] : 'Рік невідомий'}
                              </div>
                            </div>
                          </ListGroup.Item>
                        ))}
                        <ListGroup.Item
                          action
                          onClick={() => setSearchResults([])}
                          className="text-center text-danger bg-card border-secondary small"
                        >
                          Закрити список
                        </ListGroup.Item>
                      </ListGroup>
                    )}

                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Рік</Form.Label>
                    <Form.Control type="number" name="year" value={formData.year} onChange={handleChange} required className="bg-input text-main border-secondary" />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Жанр</Form.Label>
                    <Form.Control name="genre" value={formData.genre} onChange={handleChange} className="bg-input text-main border-secondary" />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Режисер</Form.Label>
                    <Form.Control name="director" value={formData.director} onChange={handleChange} className="bg-input text-main border-secondary" />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Опис</Form.Label>
                <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} className="bg-input text-main border-secondary" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>URL Постера</Form.Label>
                <Form.Control name="posterUrl" value={formData.posterUrl} onChange={handleChange} placeholder="https://..." className="bg-input text-main border-secondary" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>URL Трейлера (YouTube Embed)</Form.Label>
                <Form.Control name="trailerUrl" value={formData.trailerUrl} onChange={handleChange} className="bg-input text-main border-secondary" />
              </Form.Group>

              <Form.Check
                type="checkbox"
                label="Це серіал?"
                name="isSeries"
                checked={formData.isSeries}
                onChange={handleChange}
                className="mb-3"
              />
            </Tab>

            <Tab eventKey="cast" title={`Актори (${movieCast.length})`}>
              <div className="p-3 border rounded mb-3" style={{ borderColor: 'var(--border-color)' }}>
                <h6>Додати актора вручну</h6>
                <Row className="g-2">
                  <Col md={6}>
                    <Form.Select
                      value={selectedActorId}
                      onChange={(e) => setSelectedActorId(e.target.value)}
                      className="bg-input text-main border-secondary"
                    >
                      <option value="">Оберіть актора...</option>
                      {Array.isArray(allActors) && allActors.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={4}>
                    <Form.Control
                      placeholder="Роль (напр. Тоні Старк)"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      className="bg-input text-main border-secondary"
                    />
                  </Col>
                  <Col md={2}>
                    <Button variant="success" onClick={handleAddActor} className="w-100">Add</Button>
                  </Col>
                </Row>
              </div>

              <ListGroup style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {movieCast.map((item, index) => (
                  <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center bg-card text-main border-secondary">
                    <div>
                      <strong>{item.name}</strong> <span className="text-muted">як</span> {item.role}
                    </div>
                    <Button variant="outline-danger" size="sm" onClick={() => handleRemoveActor(item.actorId)}>✖</Button>
                  </ListGroup.Item>
                ))}
                {movieCast.length === 0 && <p className="text-muted text-center mt-2">Список акторів порожній</p>}
              </ListGroup>
            </Tab>

          </Tabs>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="secondary" onClick={onHide}>Скасувати</Button>
            <Button variant="primary" type="submit">Зберегти</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default AdminMovieModal;