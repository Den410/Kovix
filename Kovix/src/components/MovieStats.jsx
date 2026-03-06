import { useEffect, useState } from 'react';
import { Card, Row, Col, ProgressBar, Badge } from 'react-bootstrap';
import { statsAPI } from '../services/api';

const MovieStats = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        statsAPI.getStats()
            .then(res => setStats(res.data))
            .catch(err => {
                console.error("Stats fetch failed", err);
                setStats({ totalCount: 0 });
            });
    }, []);

    useEffect(() => {
        statsAPI.getStats().then(res => setStats(res.data));
    }, []);

    if (!stats) return null;

    const items = [
        { label: '📝 Планую', value: stats.planToWatchCount, avg: stats.planToWatchAvg, color: 'info' },
        { label: '🎬 Дивлюсь', value: stats.watchingCount, avg: stats.watchingAvg, color: 'primary' },
        { label: '✅ Завершено', value: stats.completedCount, avg: stats.completedAvg, color: 'success' },
        { label: '❌ Покинуто', value: stats.droppedCount, avg: stats.droppedAvg, color: 'danger' }
    ];

    return (
        <Card className="p-4 shadow-sm border-0 bg-card text-main">
            <h5 className="mb-4 fw-bold">📊 Ваша статистика переглядів</h5>

            <ProgressBar className="mb-4" style={{ height: '10px' }}>
                {items.map((item, idx) => (
                    <ProgressBar
                        key={idx}
                        now={stats.totalCount ? (item.value / stats.totalCount) * 100 : 0}
                        variant={item.color}
                    />
                ))}
            </ProgressBar>

            <Row className="g-3">
                {items.map((item, idx) => (
                    <Col key={idx} xs={6} md={3}>
                        <div className="text-center p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                            <h3 className={`fw-bold text-${item.color} mb-0`}>{item.value}</h3>
                            <div className="text-secondary small mb-2">{item.label}</div>
                            {item.avg > 0 && (
                                <Badge pill bg="dark" className="border border-secondary">
                                    ⭐ {item.avg}
                                </Badge>
                            )}
                        </div>
                    </Col>
                ))}
            </Row>
        </Card>
    );
};

export default MovieStats;