import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCookieBite } from 'react-icons/fa';

function CookiePopup() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('kovix_cookie_consent');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('kovix_cookie_consent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="cookie-popup-container shadow-lg p-3 rounded-4 border border-secondary">
            <div className="d-flex flex-column flex-md-row align-items-center gap-3">
                <div className="cookie-icon bg-warning-subtle p-2 rounded-circle text-warning d-flex align-items-center justify-content-center">
                    <FaCookieBite size={24} />
                </div>
                
                <div className="flex-grow-1 text-center text-md-start">
                    <p className="mb-0 text-main small lh-sm">
                        Ми використовуємо файли cookie, щоб зробити ваш досвід на <strong>Kovix</strong> приємнішим. 
                        Продовжуючи, ви погоджуєтеся з нашими{' '}
                        <Link to="/terms" className="text-warning text-decoration-none fw-bold">правилами користування</Link>
                        {' '}та{' '}
                        <Link to="/privacy" className="text-warning text-decoration-none fw-bold">політикою конфіденційності</Link>.
                    </p>
                </div>

                <div className="d-flex gap-2">
                    <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        className="rounded-pill px-3" 
                        onClick={() => setIsVisible(false)}
                    >
                        Пізніше
                    </Button>
                    <Button 
                        variant="warning" 
                        size="sm" 
                        className="rounded-pill px-4 fw-bold" 
                        onClick={handleAccept}
                    >
                        Згоден!
                    </Button>
                </div>
            </div>

            <style>{`
                .cookie-popup-container {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    right: 20px;
                    max-width: 800px;
                    margin: 0 auto;
                    background-color: var(--bg-card);
                    z-index: 9999;
                    animation: slideUp 0.5s ease-out;
                }

                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                @media (min-width: 768px) {
                    .cookie-popup-container {
                        left: 30px;
                        right: auto;
                        width: 650px;
                    }
                }

                .cookie-icon {
                    min-width: 45px;
                    height: 45px;
                }
            `}</style>
        </div>
    );
}

export default CookiePopup;