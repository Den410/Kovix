import { useState, useEffect } from 'react';
import { Container, Table, Spinner, Form, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { adminUsersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../utils/apiConfig';
import defaultAvatarImg from '../assets/NotFoundAvatar.png';
import UserTitleBadge from '../components/UserTitleBadge';


const AdminRolesPage = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadUsers = async () => {
        try {
            const res = await adminUsersAPI.getAll();
            setUsers(res.data);
        } catch (e) {
            console.error("Помилка завантаження користувачів", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadUsers(); }, []);

    const handleRoleChange = async (userId, newRole) => {
        if (!window.confirm(`Ви впевнені, що хочете змінити роль на ${newRole}?`)) {
            loadUsers(); 
            return;
        }

        try {
            await adminUsersAPI.changeRole(userId, newRole);
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            alert("Роль успішно змінено!");
        } catch (error) {
            alert(error.response?.data || "Помилка при зміні ролі");
            loadUsers();
        }
    };

    const getRoleBadgeColor = (role) => {
        if (role === 'Admin') return 'danger';
        if (role === 'Reviewer') return 'warning';
        return 'primary';
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <Container className="mt-4 mb-5">
            <h2 className="fw-bold mb-4" style={{ color: 'var(--text-main)' }}>👥 Керування користувачами та ролями</h2>

            <div className="table-responsive rounded shadow-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
                <Table hover className="mb-0 align-middle" variant="dark" style={{ '--bs-table-bg': 'transparent' }}>
                    <thead style={{ borderBottom: '2px solid var(--border-color)' }}>
                        <tr>
                            <th className="py-3 px-4 text-muted">ID</th>
                            <th className="py-3 text-muted">Користувач</th>
                            <th className="py-3 text-muted">Email</th>
                            <th className="py-3 text-muted">Поточна роль</th>
                            <th className="py-3 px-4 text-muted text-end">Дія (Змінити роль)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td className="px-4 fw-bold text-muted">#{u.id}</td>
                                <td>
                                    <div className="d-flex align-items-center gap-3">
                                        <img 
                                            src={u.avatarUrl ? `${API_BASE_URL}${u.avatarUrl}` : defaultAvatarImg} 
                                            alt="avatar" 
                                            className="rounded-circle"
                                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                            onError={(e) => { e.target.src = defaultAvatarImg; }}
                                        />
                                        <Link to={`/users/${u.id}`} className="fw-bold text-main" style={{ textDecoration: 'none', color: 'var(--text-main)' }}>
                                            {u.username}
                                        </Link>
                                        <UserTitleBadge
                                            role={u.role}
                                            selectedAward={u.selectedAward}
                                        />
                                    </div>
                                </td>
                                <td className="text-muted">{u.email}</td>
                                <td>
                                    <Badge bg={getRoleBadgeColor(u.role)} className="px-3 py-2 fs-6">
                                        {u.role}
                                    </Badge>
                                </td>
                                <td className="px-4 text-end">
                                    <Form.Select 
                                        size="sm"
                                        value={u.role}
                                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                        disabled={u.id === currentUser?.id}
                                        className="bg-input text-main border-secondary d-inline-block w-auto"
                                        style={{ cursor: u.id === currentUser?.id ? 'not-allowed' : 'pointer' }}
                                    >
                                        <option value="User">Глядач (User)</option>
                                        <option value="Reviewer">Критик (Reviewer)</option>
                                        <option value="Admin">Адміністратор (Admin)</option>
                                    </Form.Select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </Container>
    );
};

export default AdminRolesPage;