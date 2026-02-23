import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaShieldAlt, FaEye, FaLock, FaUserEdit } from 'react-icons/fa';

function PrivacyPage() {
    return (
        <Container className="mt-5 mb-5 text-main">
            <Row className="justify-content-center">
                <Col lg={10}>
                    <div className="text-center mb-5">
                        <h1 className="fw-bold display-4">Політика конфіденційності</h1>
                        <p className="text-muted">Діє з: 23 лютого 2026 року</p>
                    </div>

                    <Card className="bg-card border-0 shadow-sm rounded-4 mb-4">
                        <Card.Body className="p-4 p-md-5">
                            <section className="mb-5">
                                <h3 className="d-flex align-items-center gap-3 mb-4 text-info">
                                    <FaEye /> 1. Яку інформацію ми збираємо
                                </h3>
                                <p>Ми збираємо лише ті дані, які необхідні для функціонування сервісу:</p>
                                <ul>
                                    <li>Електронна пошта та ім'я при реєстрації.</li>
                                    <li>Ваші оцінки та відгуки про фільми/акторів.</li>
                                    <li>Технічні дані (IP-адреса, файли cookie) для стабільної роботи сайту.</li>
                                </ul>
                            </section>

                            <section className="mb-5">
                                <h3 className="d-flex align-items-center gap-3 mb-4 text-success">
                                    <FaLock /> 2. Як ми захищаємо дані
                                </h3>
                                <p>Безпека ваших даних є нашим пріоритетом. Ми використовуємо шифрування паролів та захищені протоколи передачі даних (HTTPS).</p>
                            </section>

                            <section className="mb-5">
                                <h3 className="d-flex align-items-center gap-3 mb-4 text-primary">
                                    <FaUserEdit /> 3. Ваші права
                                </h3>
                                <p>Ви маєте право у будь-який момент змінити свої дані у профілі або надіслати запит на повне видалення облікового запису разом з усіма вашими коментарями.</p>
                            </section>

                            <section>
                                <h3 className="d-flex align-items-center gap-3 mb-4 text-warning">
                                    <FaShieldAlt /> 4. Передача даних третім особам
                                </h3>
                                <p>Kovix не продає ваші дані. Ми передаємо анонімну інформацію лише сервісам аналітики (наприклад, Google Analytics) для покращення роботи інтерфейсу.</p>
                            </section>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default PrivacyPage;