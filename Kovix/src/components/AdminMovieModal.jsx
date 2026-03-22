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

  const [showQuickAddActor, setShowQuickAddActor] = useState(false);
  const [newActorData, setNewActorData] = useState({ name: '', bio: '', photoUrl: '' });

  const [franchises, setFranchises] = useState([]);
  const [franchiseId, setFranchiseId] = useState('');
  const [orderInFranchise, setOrderInFranchise] = useState('');
  const [newFranchiseName, setNewFranchiseName] = useState('');
  const [isCreatingNewFranchise, setIsCreatingNewFranchise] = useState(false);

  useEffect(() => {
    if (show) {
      setActiveTab('info');
      setSearchResults([]);
      loadActors();

      moviesAPI.getFranchises()
        .then(res => {
          setFranchises(res.data);

          if (movieToEdit) {
            const foundFranchise = res.data.find(f => f.name === movieToEdit.franchiseName);
            setFranchiseId(foundFranchise ? foundFranchise.id : '');

            const currentFm = movieToEdit.franchiseMovies?.find(fm => fm.isCurrent);
            setOrderInFranchise(currentFm ? currentFm.order : '');
          }
        })
        .catch(err => console.error("Error loading franchises:", err));

      if (movieToEdit) {
        setFormData({
          title: movieToEdit.title || '',
          description: movieToEdit.description || '',
          year: movieToEdit.year || new Date().getFullYear(),
          genre: movieToEdit.genre || '',
          director: movieToEdit.director || '',
          posterUrl: movieToEdit.posterUrl || '',
          trailerUrl: movieToEdit.trailerUrl || '',
          isSeries: movieToEdit.isSeries || false,
        });
        setMovieCast(movieToEdit.cast || []);
        setIsCreatingNewFranchise(false);
        setNewFranchiseName('');
      } else {
        setFormData({
          title: '', description: '', year: new Date().getFullYear(), genre: '', director: '',
          posterUrl: '', trailerUrl: '', isSeries: false
        });
        setMovieCast([]);

        setFranchiseId('');
        setOrderInFranchise('');
        setIsCreatingNewFranchise(false);
        setNewFranchiseName('');
      }
    }
  }, [show, movieToEdit]);

  const loadActors = () => {
    actorsAPI.getAll()
      .then(res => {
        if (Array.isArray(res.data)) setAllActors(res.data);
        else setAllActors([]);
      })
      .catch(err => console.error("Error loading actors:", err));
  };

  const handleSearchTmdb = async () => {
    if (!formData.title) return alert("Введіть назву для пошуку!");
    setIsSearching(true);
    setSearchResults([]);

    try {
      const res = await moviesAPI.searchTmdb(formData.title);
      if (res.data && Array.isArray(res.data)) {
        setSearchResults(res.data);
        if (res.data.length === 0) alert("Нічого не знайдено 😔");
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
    setMovieCast([]);

    try {
      const res = await moviesAPI.getTmdbDetails(movieFromSearch.tmdbId);
      const data = res.data;

      setFormData(prev => ({
        ...prev,
        title: movieFromSearch.title || data.title,
        description: data.description || data.Description || prev.description,
        year: data.year || data.Year || prev.year,
        posterUrl: data.posterUrl || data.PosterUrl || movieFromSearch.posterUrl,
      }));

      const rawCast = data.cast || data.Cast || [];
      const finalizedCast = [];
      const createdActors = [];

      for (const actorDto of rawCast) {
        let aId = actorDto.actorId !== undefined ? actorDto.actorId : actorDto.ActorId;
        const aName = actorDto.name || actorDto.Name;
        const aRole = actorDto.role || actorDto.Role;
        const aPhoto = actorDto.photoUrl || actorDto.PhotoUrl;
        const aBio = actorDto.biography || actorDto.Biography || `Актор з фільму ${movieFromSearch.title}`;

        if (aId === 0) {
          try {
            const createRes = await actorsAPI.create({
              name: aName,
              bio: aBio,
              photoUrl: aPhoto,
              birthDate: actorDto.birthDate || actorDto.BirthDate || null 
            });
            aId = createRes.data.id;
            createdActors.push(createRes.data);
          } catch (err) {
            console.error(`Failed to create actor ${aName}:`, err);
            continue;
          }
        }
        
        finalizedCast.push({
          actorId: aId,
          name: aName,
          role: aRole,
          isMainRole: actorDto.isMainRole !== undefined ? actorDto.isMainRole : (actorDto.IsMainRole || false) 
        });
      }

      if (createdActors.length > 0) {
        setAllActors(prev => [...prev, ...createdActors]);
      }

      setMovieCast([...finalizedCast]);
      setSearchResults([]);

      setTimeout(() => {
        setActiveTab('cast');
      }, 200);

    } catch (error) {
      console.error("Critical error:", error);
      alert("Не вдалося завантажити деталі фільму");
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickAddActorInDb = async () => {
    if (!newActorData.name.trim()) return alert("Введіть ім'я актора");
    try {
      const res = await actorsAPI.create(newActorData);
      const createdActor = res.data;
      setAllActors(prev => [...prev, createdActor]);
      setSelectedActorId(createdActor.id);
      setShowQuickAddActor(false);
      setNewActorData({ name: '', bio: '', photoUrl: '' });
    } catch (err) {
      alert("Помилка при створенні актора в БД");
    }
  };

  const handleAddActorToCast = () => {
    if (!selectedActorId || !roleName.trim()) return;
    const actorInfo = allActors.find(a => a.id === parseInt(selectedActorId));
    if (!actorInfo) return;

    if (movieCast.some(c => c.actorId === actorInfo.id)) {
      return alert("Цей актор вже доданий до фільму!");
    }

    setMovieCast(prev => [...prev, {
      actorId: actorInfo.id,
      name: actorInfo.name,
      role: roleName
    }]);

    setSelectedActorId('');
    setRoleName('');
  };

  const handleRemoveActor = (actorId) => {
    setMovieCast(prev => prev.filter(c => c.actorId !== actorId));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFranchiseChange = (e) => {
    const val = e.target.value;
    if (val === 'new') {
      setIsCreatingNewFranchise(true);
      setFranchiseId('');
    } else {
      setIsCreatingNewFranchise(false);
      setFranchiseId(val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        year: parseInt(formData.year),
        cast: movieCast.map(c => ({
          actorId: c.actorId,
          role: c.role,
          isMainRole: c.isMainRole || c.IsMainRole || false
        })),

        franchiseId: franchiseId && !isCreatingNewFranchise ? parseInt(franchiseId) : null,
        orderInFranchise: orderInFranchise ? parseInt(orderInFranchise) : null,
        newFranchiseName: isCreatingNewFranchise ? newFranchiseName : null
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
    <>
      <Modal show={show} onHide={onHide} size="lg" centered contentClassName="bg-card text-main">
        <Modal.Header closeButton style={{ borderColor: 'var(--border-color)' }}>
          <Modal.Title>{movieToEdit ? 'Редагувати фільм' : 'Додати фільм'}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'var(--bg-main)' }}>
          <Form onSubmit={handleSubmit}>
            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">

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
                          placeholder="Назва (напр. Хмарочос)"
                          className="bg-input text-main border-secondary"
                        />
                        <Button variant="info" onClick={handleSearchTmdb} disabled={isSearching}>
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
                                <div className="small text-muted">{m.releaseDate ? m.releaseDate.split('-')[0] : 'Рік невідомий'}</div>
                              </div>
                            </ListGroup.Item>
                          ))}
                          <ListGroup.Item action onClick={() => setSearchResults([])} className="text-center text-danger bg-card border-secondary small">
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
                  <Form.Control name="posterUrl" value={formData.posterUrl} onChange={handleChange} className="bg-input text-main border-secondary" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>URL Трейлера</Form.Label>
                  <Form.Control name="trailerUrl" value={formData.trailerUrl} onChange={handleChange} className="bg-input text-main border-secondary" />
                </Form.Group>

                <div className="p-3 mb-3 border rounded shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                  <h6 className="mb-3 text-info">🔗 Прив'язка до франшизи (серії фільмів)</h6>
                  <Row>
                    <Col md={isCreatingNewFranchise ? 12 : 8} className="mb-2">
                      <Form.Group>
                        <Form.Label>Франшиза</Form.Label>
                        <Form.Select
                          value={isCreatingNewFranchise ? 'new' : franchiseId}
                          onChange={handleFranchiseChange}
                          className="bg-input text-main border-secondary"
                        >
                          <option value="">-- Без франшизи --</option>
                          <option value="new" className="fw-bold text-success">+ Створити нову франшизу</option>
                          {franchises.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    {isCreatingNewFranchise && (
                      <Col md={12} className="mb-2">
                        <Form.Group>
                          <Form.Label className="text-success">Назва нової франшизи</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Наприклад: Зоряні війни"
                            value={newFranchiseName}
                            onChange={(e) => setNewFranchiseName(e.target.value)}
                            className="bg-input text-main border-secondary"
                          />
                        </Form.Group>
                      </Col>
                    )}

                    {(franchiseId || isCreatingNewFranchise) && (
                      <Col md={4} className={isCreatingNewFranchise ? "mt-2" : "mb-2"}>
                        <Form.Group>
                          <Form.Label>Частина №</Form.Label>
                          <Form.Control
                            type="number"
                            min="1"
                            placeholder="Напр: 1"
                            value={orderInFranchise}
                            onChange={(e) => setOrderInFranchise(e.target.value)}
                            className="bg-input text-main border-secondary"
                          />
                        </Form.Group>
                      </Col>
                    )}
                  </Row>
                </div>

                <Form.Check type="checkbox" label="Це серіал?" name="isSeries" checked={formData.isSeries} onChange={handleChange} className="mb-3" />
              </Tab>

              <Tab eventKey="cast" title={`Актори (${movieCast.length})`}>
                <div className="p-3 border rounded mb-3 border-secondary shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">Додати актора</h6>
                    <Button variant="link" size="sm" className="text-info p-0 text-decoration-none fw-bold" onClick={() => setShowQuickAddActor(true)}>
                      + Створити нового актора в базі
                    </Button>
                  </div>
                  <Row className="g-2">
                    <Col md={6}>
                      <Form.Select value={selectedActorId} onChange={(e) => setSelectedActorId(e.target.value)} className="bg-input text-main border-secondary">
                        <option value="">Оберіть актора...</option>
                        {allActors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </Form.Select>
                    </Col>
                    <Col md={4}>
                      <Form.Control placeholder="Роль" value={roleName} onChange={(e) => setRoleName(e.target.value)} className="bg-input text-main border-secondary" />
                    </Col>
                    <Col md={2}>
                      <Button variant="success" onClick={handleAddActorToCast} className="w-100">Додати</Button>
                    </Col>
                  </Row>
                </div>

                <ListGroup style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {movieCast.length > 0 ? movieCast.map((item, index) => (
                    <ListGroup.Item key={`${item.actorId}-${index}`} className="d-flex justify-content-between align-items-center bg-card text-main border-secondary">
                      <div><strong className="text-info">{item.name}</strong> <span className="text-muted ms-2 small">як {item.role}</span></div>
                      <Button variant="outline-danger" size="sm" onClick={() => handleRemoveActor(item.actorId)}>✖</Button>
                    </ListGroup.Item>
                  )) : <p className="text-center text-muted mt-2">Список акторів порожній</p>}
                </ListGroup>
              </Tab>
            </Tabs>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="secondary" onClick={onHide}>Скасувати</Button>
              <Button variant="primary" type="submit">Зберегти фільм</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showQuickAddActor} onHide={() => setShowQuickAddActor(false)} centered contentClassName="bg-card text-main border-info shadow-lg">
        <Modal.Header closeButton style={{ borderColor: 'var(--border-color)' }}>
          <Modal.Title>Новий актор в базі</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'var(--bg-main)' }}>
          <Form.Group className="mb-3">
            <Form.Label>Ім'я</Form.Label>
            <Form.Control value={newActorData.name} onChange={(e) => setNewActorData({ ...newActorData, name: e.target.value })} className="bg-input text-main border-secondary" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>URL Фото</Form.Label>
            <Form.Control value={newActorData.photoUrl} onChange={(e) => setNewActorData({ ...newActorData, photoUrl: e.target.value })} className="bg-input text-main border-secondary" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Біографія</Form.Label>
            <Form.Control as="textarea" rows={3} value={newActorData.bio} onChange={(e) => setNewActorData({ ...newActorData, bio: e.target.value })} className="bg-input text-main border-secondary" />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer style={{ borderColor: 'var(--border-color)' }}>
          <Button variant="secondary" onClick={() => setShowQuickAddActor(false)}>Відміна</Button>
          <Button variant="info" onClick={handleQuickAddActorInDb}>Створити та обрати</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AdminMovieModal;