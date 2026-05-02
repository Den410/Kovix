import { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { adminMovieAwardsAPI } from '../services/api';

const AdminMovieAwardModal = ({ show, onHide, movieId, onAwardAdded, awardToEdit }) => {
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('🏆');
    const [loading, setLoading] = useState(false);

    const popularIcons = ['🏆', '👑', '🎬', '🌟', '🔥', '💎', '❤️', '🍿'];

    useEffect(() => {
        if (awardToEdit) {
            setName(awardToEdit.name);
            setIcon(awardToEdit.icon);
        } else {
            setName('');
            setIcon('🏆');
        }
    }, [awardToEdit, show]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (awardToEdit) {
                await adminMovieAwardsAPI.editAward(awardToEdit.id, { movieId, name, icon });
            } else {
                await adminMovieAwardsAPI.issueAward({ movieId, name, icon });
            }
            
            onHide();
            if (onAwardAdded) onAwardAdded();
        } catch (error) {
            alert(error.response?.data || "Помилка збереження нагороди");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered contentClassName="bg-card text-main border-secondary">
            <Modal.Header closeButton style={{ borderColor: 'var(--border-color)' }}>
                <Modal.Title className="fw-bold" style={{ color: 'var(--primary-color)' }}>
                    {awardToEdit ? '✏️ Редагувати нагороду' : '🎖️ Нагородити фільм'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Назва нагороди</Form.Label>
                        <Form.Control 
                            type="text" 
                            required 
                            maxLength={50}
                            placeholder="напр., Вибір редакції 2026"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Іконка (Емодзі)</Form.Label>
                        <div className="d-flex gap-2 mb-2 flex-wrap">
                            {popularIcons.map(ic => (
                                <Button 
                                    key={ic} 
                                    variant={icon === ic ? "warning" : "outline-secondary"} 
                                    className="fs-5 p-1" 
                                    style={{ width: '40px', height: '40px' }}
                                    onClick={() => setIcon(ic)}
                                >
                                    {ic}
                                </Button>
                            ))}
                        </div>
                        <Form.Control 
                            type="text" 
                            required 
                            maxLength={10}
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}
                        />
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-2">
                        <Button variant="secondary" onClick={onHide}>Скасувати</Button>
                        <Button variant="warning" type="submit" disabled={loading} className="fw-bold">
                            {loading ? <Spinner size="sm"/> : 'Зберегти'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AdminMovieAwardModal;