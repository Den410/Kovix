import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { actorsAPI } from '../services/api';

function AdminActorModal({ show, onHide, actorToEdit, onSuccess }) {
    const [formData, setFormData] = useState({ name: '', bio: '', photoUrl: '' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (show && actorToEdit) {
            setFormData({
                name: actorToEdit.name || '',
                bio: actorToEdit.bio || '',
                photoUrl: actorToEdit.photoUrl || ''
            });
        }
    }, [show, actorToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const actorData = {
                id: actorToEdit.id,
                name: formData.name,
                bio: formData.bio,
                photoUrl: formData.photoUrl,
                birthDate: actorToEdit.birthDate || null
            };

            await actorsAPI.update(actorToEdit.id, actorData);

            onSuccess();
            onHide();
        } catch (error) {
            console.error("Помилка при оновленні:", error.response?.data);
            alert("Помилка: " + (error.response?.status === 400 ? "Невідповідність ID або даних" : "Серверна помилка"));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered contentClassName="bg-card text-main border-secondary">
            <Modal.Header closeButton style={{ borderColor: 'var(--border-color)' }}>
                <Modal.Title>Редагувати дані: {actorToEdit?.name}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body style={{ backgroundColor: 'var(--bg-main)' }}>
                    <Form.Group className="mb-3">
                        <Form.Label>Ім'я (Українською)</Form.Label>
                        <Form.Control
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="bg-input text-main border-secondary"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>URL Фото</Form.Label>
                        <Form.Control
                            value={formData.photoUrl}
                            onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                            className="bg-input text-main border-secondary"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Біографія</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={5}
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            className="bg-input text-main border-secondary"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer style={{ borderColor: 'var(--border-color)' }}>
                    <Button variant="secondary" onClick={onHide}>Скасувати</Button>
                    <Button variant="primary" type="submit" disabled={isSaving}>
                        {isSaving ? 'Збереження...' : 'Зберегти зміни'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default AdminActorModal;