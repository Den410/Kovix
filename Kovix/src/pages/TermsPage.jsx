import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaGavel, FaUserShield, FaExclamationTriangle, FaCommentSlash } from 'react-icons/fa';

function TermsPage() {
    return (
        <Container className="mt-5 mb-5 text-main">
            <Row className="justify-content-center">
                <Col lg={10}>
                    <div className="text-center mb-5">
                        <h1 className="fw-bold display-4">Правила Kovix</h1>
                        <p className="text-muted lead">Останнє оновлення: 22 лютого 2026 року</p>
                    </div>

                    <Card className="bg-card border-0 shadow-sm rounded-4 mb-4">
                        <Card.Body className="p-4 p-md-5">
                            <section className="mb-5">
                                <h3 className="d-flex align-items-center gap-3 mb-4 text-warning">
                                    <FaGavel /> 1. Загальні положення
                                </h3>
                                <p>Вітаємо на Kovix — платформі для любителів кіно та серіалів. Користуючись нашим сайтом, ви погоджуєтеся з наведеними нижче правилами. Команда Kovix залишає за собою право змінювати ці правила в будь-який час.</p>
                            </section>

                            <section className="mb-5">
                                <h3 className="d-flex align-items-center gap-3 mb-4 text-primary">
                                    <FaUserShield /> 2. Реєстрація та безпека
                                </h3>
                                <ul>
                                    <li>Користувач несе відповідальність за безпеку свого облікового запису та пароля.</li>
                                    <li>Заборонено використовувати чужі персональні дані або видавати себе за іншу особу.</li>
                                    <li>Один користувач може мати лише один основний обліковий запис.</li>
                                </ul>
                            </section>

                            <section className="mb-5">
                                <h3 className="d-flex align-items-center gap-3 mb-4 text-danger">
                                    <FaCommentSlash /> 3. Правила спілкування та відгуків
                                </h3>
                                <p>Ми цінуємо свободу слова, але не толеруємо токсичність. На Kovix заборонено:</p>
                                <div className="ps-3 border-start border-3 border-danger mb-3">
                                    <ul className="mb-0">
                                        <li>Образи інших користувачів, акторів чи творців контенту.</li>
                                        <li>Використання нецензурної лексики (навіть завуальованої).</li>
                                        <li>Спойлери до фільмів без відповідного попередження.</li>
                                        <li>Пропаганда ненависті, дискримінація за будь-якою ознакою.</li>
                                        <li>Реклама сторонніх ресурсів та спам у коментарях.</li>
                                    </ul>
                                </div>
                            </section>

                            <section className="mb-5">
                                <h3 className="d-flex align-items-center gap-3 mb-4 text-warning">
                                    <FaExclamationTriangle /> 4. Модерація та блокування
                                </h3>
                                <p>Адміністрація сайту має право:</p>
                                <ul>
                                    <li>Видаляти контент (відгуки, коментарі), що порушує правила.</li>
                                    <li>Тимчасово або назавжди блокувати доступ користувачам за систематичні порушення.</li>
                                    <li>Оскаржити дії модераторів можна через форму зворотного зв'язку в профілі.</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="mb-4">5. Інтелектуальна власність</h3>
                                <p>Весь контент (описи, логотипи, дизайн), створений командою Kovix, є нашою інтелектуальною власністю.</p>
                            </section>
                        </Card.Body>
                    </Card>

                    <div className="text-center text-muted small">
                        Користуючись Kovix, ви допомагаєте зробити кіноспільноту кращою. Дякуємо! 🎬
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default TermsPage;