import { useState, useEffect } from 'react';
import { Alert, Container, Button, Modal, Badge } from 'react-bootstrap';
import { newsAPI } from '../services/api';
import { FaTools, FaExclamationTriangle } from 'react-icons/fa';

const NewsBanner = () => {
    const [importantNews, setImportantNews] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [theme, setTheme] = useState('light');

    const fetchNews = async () => {
        try {
            const res = await newsAPI.getAll();
            const tech = res.data.find(n => n.category === 'Tech');
            const pinned = res.data.find(n => n.isPinned);
            setImportantNews(tech || pinned);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchNews();
        window.addEventListener('newsChanged', fetchNews);
        
        const updateTheme = () => {
            const dataTheme = document.documentElement.getAttribute('data-theme') || 'light';
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTheme(dataTheme);
        };
        
        updateTheme();
        const darkModeObserver = new MutationObserver(updateTheme);
        darkModeObserver.observe(document.documentElement, { attributes: true });
        
        return () => {
            window.removeEventListener('newsChanged', fetchNews);
            darkModeObserver.disconnect();
        };
    }, []);

    if (!importantNews) return null;

    const isTech = importantNews.category === 'Tech';

    return (
        <>
            <Container className="mt-3">
                <Alert 
                    variant={isTech ? "danger" : "warning"} 
                    className="d-flex flex-column flex-md-row align-items-md-center justify-content-between shadow-sm border-0 gap-3"
                >
                    <div className="d-flex align-items-center gap-3">
                        {isTech ? <FaTools size={24} className="flex-shrink-0" /> : <FaExclamationTriangle size={24} className="flex-shrink-0" />}
                        <div>
                            <div className="fw-bold fs-5">{importantNews.title}</div>
                            <div 
                                className="small" 
                                style={{ 
                                    display: '-webkit-box', 
                                    WebkitLineClamp: 2, 
                                    WebkitBoxOrient: 'vertical', 
                                    overflow: 'hidden',
                                    opacity: 0.9
                                }}
                            >
                                {importantNews.content}
                            </div>
                        </div>
                    </div>
                    
                    <Button 
                        variant={isTech ? (theme === 'dark' ? 'secondary' : 'danger') : 'primary'} 
                        size="sm" 
                        className="fw-bold text-nowrap align-self-end align-self-md-center px-3 py-2 shadow-sm"
                        onClick={() => setShowModal(true)}
                    >
                        Читати повністю
                    </Button>
                </Alert>
            </Container>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="bg-card text-main border-secondary">
                <Modal.Header closeButton style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
                    <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                        {isTech ? <FaTools className="text-danger" /> : <FaExclamationTriangle className="text-warning" />}
                        Оголошення
                    </Modal.Title>
                </Modal.Header>
                
                <Modal.Body className="bg-main">
                    <Badge bg={isTech ? 'danger' : 'warning'} text={isTech ? 'light' : 'dark'} className="mb-3 px-3 py-2 fs-6">
                        {isTech ? 'Технічні роботи' : 'Важлива інформація'}
                    </Badge>
                    
                    <h4 className="fw-bold mb-3" style={{ color: 'var(--text-main)' }}>
                        {importantNews.title}
                    </h4>
                    
                    <div className="fs-5" style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>
                        {importantNews.content}
                    </div>
                </Modal.Body>
                
                <Modal.Footer style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                    <Button variant={isTech ? (theme === 'dark' ? 'secondary' : 'danger') : "primary"} onClick={() => setShowModal(false)}>
                        Зрозуміло
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default NewsBanner;