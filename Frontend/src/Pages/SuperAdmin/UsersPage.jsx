import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsersApi, createUserApi, updateUserApi, deleteUserApi, toggleUserStatusApi } from '../../api/superAdminApi';

const INITIAL_FORM = { name: '', email: '', password: '', phone: '', age: '', state: '', country: '' };
const levelColors = {
    beginner: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
    intermediate: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    advanced: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
    null: { bg: 'rgba(100,116,139,0.12)', color: '#64748b' },
};

export default function UsersPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'delete'
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(INITIAL_FORM);
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState('');

    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllUsersApi({ search });
            setUsers(data.users || []);
            setTotal(data.total || 0);
        } catch { showToast('Failed to load users.'); }
        finally { setLoading(false); }
    }, [search]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const openCreate = () => { setForm(INITIAL_FORM); setFormError(''); setModal('create'); };
    const openEdit = (u) => { setSelected(u); setForm({ name: u.name, email: u.email, password: '', phone: u.phone || '', age: u.age || '', state: u.state || '', country: u.country || '' }); setFormError(''); setModal('edit'); };
    const openDelete = (u) => { setSelected(u); setModal('delete'); };

    const handleSubmit = async () => {
        setFormError('');
        setSubmitting(true);
        try {
            if (modal === 'create') {
                await createUserApi(form);
                showToast('✅ User created successfully!');
            } else if (modal === 'edit') {
                await updateUserApi(selected._id, form);
                showToast('✅ User updated successfully!');
            }
            setModal(null);
            fetchUsers();
        } catch (err) {
            setFormError(err.response?.data?.error || 'Operation failed.');
        } finally { setSubmitting(false); }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            await deleteUserApi(selected._id);
            showToast('🗑️ User deleted.');
            setModal(null);
            fetchUsers();
        } catch (err) {
            showToast(err.response?.data?.error || 'Delete failed.');
            setModal(null);
        } finally { setSubmitting(false); }
    };

    const handleToggle = async (u) => {
        try {
            await toggleUserStatusApi(u._id);
            showToast(`User ${u.isActive ? 'deactivated' : 'activated'}.`);
            fetchUsers();
        } catch { showToast('Failed to toggle status.'); }
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedUsers = React.useMemo(() => {
        if (!sortField) return users;
        return [...users].sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];

            if (sortField === 'createdAt') {
                valA = new Date(valA);
                valB = new Date(valB);
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [users, sortField, sortDirection]);

    const renderSortHeader = (label, field) => {
        const isCurrent = sortField === field;
        return (
            <th
                key={field}
                style={{ ...styles.th, cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort(field)}
            >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {label}
                    <span style={{ fontSize: 9, color: isCurrent ? '#a78bfa' : '#64748b' }}>
                        {isCurrent ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                </div>
            </th>
        );
    };

    return (
        <div>
            {/* Toast */}
            {toast && <div style={styles.toast}>{toast}</div>}

            {/* Header */}
            <div style={styles.pageHeader}>
                <div>
                    <h1 style={styles.pageTitle}>👥 Users Management</h1>
                    <p style={styles.pageSubtitle}>{total} total users · Full CRUD control</p>
                </div>
                <button style={styles.primaryBtn} onClick={openCreate}>+ Add User</button>
            </div>

            {/* Search */}
            <div style={styles.searchWrap}>
                <span style={styles.searchIcon}>🔍</span>
                <input
                    style={styles.searchInput}
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <div style={styles.card}>
                {loading ? (
                    <div style={styles.loadingRow}><span style={styles.spinner} /> Loading users...</div>
                ) : (
                    <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    {renderSortHeader('User', 'name')}
                                    {renderSortHeader('Level', 'level')}
                                    {renderSortHeader('Streak 🔥', 'streak')}
                                    {renderSortHeader('Lessons Done', 'lessonsCompleted')}
                                    {renderSortHeader('Avg Score', 'averageScore')}
                                    {renderSortHeader('Status', 'isActive')}
                                    {renderSortHeader('Joined', 'createdAt')}
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedUsers.length === 0 && (
                                    <tr><td colSpan={8} style={styles.emptyCell}>No users found.</td></tr>
                                )}
                                {sortedUsers.map(u => (
                                    <tr key={u._id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <div style={styles.userCell}>
                                                <div style={styles.avatar}>{u.name[0]?.toUpperCase()}</div>
                                                <div>
                                                    <div style={styles.userName}>{u.name}</div>
                                                    <div style={styles.userEmail}>{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{ ...styles.badge, ...(levelColors[u.level] || levelColors.null) }}>
                                                {u.level || 'Not set'}
                                            </span>
                                        </td>
                                        <td style={styles.td}><span style={styles.streakBadge}>🔥 {u.streak || 0}</span></td>
                                        <td style={styles.td}><span style={styles.numBadge}>{u.lessonsCompleted}</span></td>
                                        <td style={styles.td}>
                                            <div style={styles.scoreWrap}>
                                                <div style={styles.scoreBar}>
                                                    <div style={{ ...styles.scoreFill, width: `${u.averageScore}%`, background: u.averageScore >= 80 ? '#10b981' : u.averageScore >= 50 ? '#f59e0b' : '#ef4444' }} />
                                                </div>
                                                <span style={styles.scoreNum}>{u.averageScore}%</span>
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <button
                                                style={{ ...styles.toggleBtn, ...(u.isActive ? styles.toggleActive : styles.toggleInactive) }}
                                                onClick={() => handleToggle(u)}
                                            >
                                                {u.isActive ? '✅ Active' : '⛔ Inactive'}
                                            </button>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.dateBadge}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</span>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.actions}>
                                                <button style={styles.viewBtn} onClick={() => navigate(`/superadmin/users/${u._id}`)}>👁 View</button>
                                                <button style={styles.editBtn} onClick={() => openEdit(u)}>✏️</button>
                                                <button style={styles.deleteBtn} onClick={() => openDelete(u)}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {(modal === 'create' || modal === 'edit') && (
                <Modal title={modal === 'create' ? 'Add New User' : 'Edit User'} onClose={() => setModal(null)}>
                    <FormGrid form={form} setForm={setForm} showPassword={modal === 'create'} />
                    {formError && <div style={styles.formError}>{formError}</div>}
                    <div style={styles.modalActions}>
                        <button style={styles.cancelBtn} onClick={() => setModal(null)}>Cancel</button>
                        <button style={styles.primaryBtn} onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Saving...' : modal === 'create' ? 'Create User' : 'Save Changes'}
                        </button>
                    </div>
                </Modal>
            )}

            {/* Delete Confirm Modal */}
            {modal === 'delete' && (
                <Modal title="Delete User" onClose={() => setModal(null)}>
                    <p style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.6 }}>
                        Are you sure you want to delete <strong style={{ color: '#f1f5f9' }}>{selected?.name}</strong>?<br />
                        This action <strong style={{ color: '#ef4444' }}>cannot be undone</strong>.
                    </p>
                    <div style={styles.modalActions}>
                        <button style={styles.cancelBtn} onClick={() => setModal(null)}>Cancel</button>
                        <button style={{ ...styles.primaryBtn, background: 'linear-gradient(135deg,#ef4444,#dc2626)' }} onClick={handleDelete} disabled={submitting}>
                            {submitting ? 'Deleting...' : 'Yes, Delete'}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

function FormGrid({ form, setForm, showPassword }) {
    const fields = [
        { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
        { key: 'email', label: 'Email Address', type: 'email', placeholder: 'john@example.com' },
        ...(showPassword ? [{ key: 'password', label: 'Password', type: 'password', placeholder: 'Min 6 characters' }] : []),
        { key: 'phone', label: 'Phone Number', type: 'text', placeholder: '9876543210' },
        { key: 'age', label: 'Age', type: 'number', placeholder: '22' },
        { key: 'state', label: 'State', type: 'text', placeholder: 'Maharashtra' },
        { key: 'country', label: 'Country', type: 'text', placeholder: 'India' },
    ];
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            {fields.map(f => (
                <div key={f.key} style={f.key === 'email' ? { gridColumn: '1/-1' } : {}}>
                    <label style={styles.label}>{f.label}</label>
                    <input
                        style={styles.input}
                        type={f.type}
                        placeholder={f.placeholder}
                        value={form[f.key] || ''}
                        onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    />
                </div>
            ))}
        </div>
    );
}

function Modal({ title, children, onClose }) {
    return (
        <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={styles.modal}>
                <div style={styles.modalHeader}>
                    <h3 style={styles.modalTitle}>{title}</h3>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>
                <div style={styles.modalBody}>{children}</div>
            </div>
        </div>
    );
}

const styles = {
    toast: { position: 'fixed', top: 20, right: 28, background: 'rgba(16,185,129,0.9)', color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, zIndex: 9999, backdropFilter: 'blur(8px)' },
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    pageTitle: { fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: 0, letterSpacing: '-0.5px' },
    pageSubtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
    primaryBtn: { background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit' },
    searchWrap: { display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 16px', marginBottom: 20 },
    searchIcon: { fontSize: 15, opacity: 0.6 },
    searchInput: { background: 'transparent', border: 'none', color: '#e2e8f0', fontSize: 14, flex: 1, outline: 'none', fontFamily: 'inherit' },
    card: { background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' },
    loadingRow: { display: 'flex', alignItems: 'center', gap: 12, padding: 32, color: '#64748b', fontSize: 13, justifyContent: 'center' },
    spinner: { display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(124,58,237,0.2)', borderTop: '2px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '12px 16px', fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)' },
    tr: { borderBottom: '1px solid rgba(255,255,255,0.03)' },
    td: { padding: '13px 16px', fontSize: 13, color: '#cbd5e1', verticalAlign: 'middle' },
    emptyCell: { textAlign: 'center', color: '#475569', padding: 40, fontSize: 13 },
    userCell: { display: 'flex', alignItems: 'center', gap: 10 },
    avatar: { width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0 },
    userName: { fontWeight: 600, color: '#f1f5f9', fontSize: 13 },
    userEmail: { fontSize: 11, color: '#64748b' },
    badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
    streakBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontSize: 12, fontWeight: 600 },
    numBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', fontSize: 12, fontWeight: 600 },
    scoreWrap: { display: 'flex', alignItems: 'center', gap: 8 },
    scoreBar: { flex: 1, height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' },
    scoreFill: { height: '100%', borderRadius: 3 },
    scoreNum: { fontSize: 12, fontWeight: 700, minWidth: 30 },
    toggleBtn: { border: 'none', borderRadius: 20, padding: '4px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'inherit' },
    toggleActive: { background: 'rgba(16,185,129,0.1)', color: '#10b981' },
    toggleInactive: { background: 'rgba(239,68,68,0.1)', color: '#ef4444' },
    dateBadge: { fontSize: 11, color: '#64748b' },
    actions: { display: 'flex', gap: 6 },
    viewBtn: { background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit' },
    editBtn: { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' },
    deleteBtn: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
    modal: { background: '#13132a', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 20, width: '100%', maxWidth: 560, boxShadow: '0 24px 80px rgba(0,0,0,0.6)', maxHeight: '90vh', overflow: 'auto' },
    modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
    modalTitle: { fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: 0 },
    closeBtn: { background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18, padding: 4 },
    modalBody: { padding: '24px' },
    label: { display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 },
    input: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' },
    formError: { color: '#f87171', fontSize: 13, marginBottom: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, padding: '10px 14px' },
    modalActions: { display: 'flex', gap: 10, justifyContent: 'flex-end' },
    cancelBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit' },
};
