import { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { adminUserAwardsAPI } from '../services/api';

const AdminUserAwardModal = ({ show, onHide, targetUserId, onAwardAdded, awardToEdit }) => {
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('🏆');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const popularIcons = ['🏆', '👑', '🌟', '✍️', '🎮', '💯', '❤️', '🤓', '🚀', '🥇'];

    useEffect(() => {
        if (awardToEdit) {
            setName(awardToEdit.name);
            setIcon(awardToEdit.icon);
            setDescription(awardToEdit.description || '');
        } else {
            setName('');
            setIcon('🏆');
            setDescription('');
        }
    }, [awardToEdit, show]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (awardToEdit) {
                await adminUserAwardsAPI.editAward(awardToEdit.id, { userId: targetUserId, name, icon, description });
            } else {
                await adminUserAwardsAPI.issueAward({ userId: targetUserId, name, icon, description });
            }
            
            if (onAwardAdded) await onAwardAdded();
            
            onHide();
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
                    {awardToEdit ? '✏️ Редагувати досягнення' : '🎖️ Видати досягнення користувачу'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Назва</Form.Label>
                        <Form.Control type="text" required maxLength={50} value={name} onChange={(e) => setName(e.target.value)} className="bg-input text-main border-secondary" placeholder="напр., Легенда Kovix" />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Короткий опис</Form.Label>
                        <Form.Control type="text" maxLength={100} value={description} onChange={(e) => setDescription(e.target.value)} className="bg-input text-main border-secondary" placeholder="За що видана?" />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Іконка (Емодзі)</Form.Label>
                        <div className="d-flex gap-2 mb-2 flex-wrap">
                            {popularIcons.map(ic => (
                                <Button key={ic} variant={icon === ic ? "warning" : "outline-secondary"} className="fs-5 p-1" style={{ width: '40px', height: '40px' }} onClick={() => setIcon(ic)}>
                                    {ic}
                                </Button>
                            ))}
                        </div>
                        <Form.Control type="text" required maxLength={10} value={icon} onChange={(e) => setIcon(e.target.value)} className="bg-input text-main border-secondary" />
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

export default AdminUserAwardModal;