import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getAllAdminsApi, createAdminApi, updateAdminApi, deleteAdminApi,
    toggleAdminStatusApi, promoteToAdminApi
} from '../../api/superAdminApi';
import { getAllUsersApi } from '../../api/superAdminApi';

const INITIAL_FORM = { name: '', email: '', password: '', phone: '', age: '', state: '', country: '' };

export default function AdminsPage() {
    const navigate = useNavigate();
    const [admins, setAdmins] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(INITIAL_FORM);
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState('');
    // For promote-user modal
    const [promoteModal, setPromoteModal] = useState(false);
    const [users, setUsers] = useState([]);
    const [promoteSearch, setPromoteSearch] = useState('');
    const [promoteLoading, setPromoteLoading] = useState(false);

    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(''), 3000); };

    const fetchAdmins = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllAdminsApi({ search });
            setAdmins(data.admins || []);
            setTotal(data.total || 0);
        } catch { showToast('Failed to load admins.', 'error'); }
        finally { setLoading(false); }
    }, [search]);

    useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

    const openCreate = () => { setForm(INITIAL_FORM); setFormError(''); setModal('create'); };
    const openEdit = (a) => { setSelected(a); setForm({ name: a.name, email: a.email, password: '', phone: a.phone || '', age: a.age || '', state: a.state || '', country: a.country || '' }); setFormError(''); setModal('edit'); };
    const openDelete = (a) => { setSelected(a); setModal('delete'); };

    const handleSubmit = async () => {
        setFormError('');
        setSubmitting(true);
        try {
            if (modal === 'create') {
                await createAdminApi(form);
                showToast('✅ Admin created successfully!');
            } else if (modal === 'edit') {
                await updateAdminApi(selected._id, form);
                showToast('✅ Admin updated!');
            }
            setModal(null);
            fetchAdmins();
        } catch (err) {
            setFormError(err.response?.data?.error || 'Operation failed.');
        } finally { setSubmitting(false); }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            await deleteAdminApi(selected._id);
            showToast('🗑️ Admin deleted.');
            setModal(null);
            fetchAdmins();
        } catch (err) {
            showToast(err.response?.data?.error || 'Delete failed.', 'error');
            setModal(null);
        } finally { setSubmitting(false); }
    };

    const handleToggle = async (a) => {
        try {
            const res = await toggleAdminStatusApi(a._id);
            showToast(`Admin status ${res.isActive ? 'activated' : 'deactivated'}.`);
            fetchAdmins();
        } catch { showToast('Failed to toggle admin status.', 'error'); }
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedAdmins = React.useMemo(() => {
        if (!sortField) return admins;
        return [...admins].sort((a, b) => {
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
    }, [admins, sortField, sortDirection]);

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

    const openPromoteModal = async () => {
        setPromoteLoading(true);
        setPromoteModal(true);
        try {
            const data = await getAllUsersApi({ limit: 100 });
            setUsers(data.users || []);
        } catch { showToast('Failed to load users.', 'error'); }
        finally { setPromoteLoading(false); }
    };

    const handlePromote = async (userId) => {
        try {
            await promoteToAdminApi(userId);
            showToast('✅ User promoted to Admin successfully!');
            setPromoteModal(false);
            fetchAdmins();
        } catch (err) {
            showToast(err.response?.data?.error || 'Promotion failed.', 'error');
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(promoteSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(promoteSearch.toLowerCase())
    );

    return (
        <div>
            {/* Toast */}
            {toast && (
                <div style={{ ...styles.toast, background: toast.type === 'error' ? 'rgba(239,68,68,0.9)' : 'rgba(16,185,129,0.9)' }}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div style={styles.pageHeader}>
                <div>
                    <h1 style={styles.pageTitle}>🛡️ Admins Management</h1>
                    <p style={styles.pageSubtitle}>{total} admins · Manage platform administrators</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button style={styles.secondaryBtn} onClick={openPromoteModal}>⬆️ Promote User</button>
                    <button style={styles.primaryBtn} onClick={openCreate}>+ New Admin</button>
                </div>
            </div>

            {/* Search */}
            <div style={styles.searchWrap}>
                <span style={styles.searchIcon}>🔍</span>
                <input style={styles.searchInput} placeholder="Search admins..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {/* Admins Table */}
            <div style={styles.card}>
                {loading ? (
                    <div style={styles.loadingRow}><span style={styles.spinner} /> Loading admins...</div>
                ) : (
                    <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    {renderSortHeader('Admin', 'name')}
                                    {renderSortHeader('Location', 'state')}
                                    {renderSortHeader('Lessons Created', 'lessonsCreated')}
                                    {renderSortHeader('Status', 'isActive')}
                                    {renderSortHeader('Joined', 'createdAt')}
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedAdmins.length === 0 && (
                                    <tr><td colSpan={6} style={styles.emptyCell}>No admins found. Create one!</td></tr>
                                )}
                                {sortedAdmins.map(a => (
                                    <tr key={a._id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <div style={styles.userCell}>
                                                <div style={{ ...styles.avatar, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}>
                                                    {a.name[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={styles.userName}>{a.name}</div>
                                                    <div style={styles.userEmail}>{a.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{ fontSize: 12, color: '#94a3b8' }}>
                                                {a.state ? `${a.state}, ${a.country}` : a.country || '-'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.lessonsCreatedBadge}>📚 {a.lessonsCreated}</span>
                                        </td>
                                        <td style={styles.td}>
                                            <button
                                                style={{ ...styles.toggleBtn, ...(a.isActive ? styles.toggleActive : styles.toggleInactive) }}
                                                onClick={() => handleToggle(a)}
                                            >
                                                {a.isActive ? '✅ Active' : '⛔ Inactive'}
                                            </button>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{ fontSize: 11, color: '#64748b' }}>{new Date(a.createdAt).toLocaleDateString('en-IN')}</span>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.actions}>
                                                <button style={styles.viewBtn} onClick={() => navigate(`/superadmin/admins/${a._id}`)}>👁 View</button>
                                                <button style={styles.editBtn} onClick={() => openEdit(a)}>✏️</button>
                                                <button style={styles.deleteBtn} onClick={() => openDelete(a)}>🗑️</button>
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
                <Modal title={modal === 'create' ? 'Create New Admin' : 'Edit Admin'} onClose={() => setModal(null)}>
                    <AdminFormGrid form={form} setForm={setForm} showPassword={modal === 'create'} />
                    {formError && <div style={styles.formError}>{formError}</div>}
                    <div style={styles.modalActions}>
                        <button style={styles.cancelBtn} onClick={() => setModal(null)}>Cancel</button>
                        <button style={styles.primaryBtn} onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Saving...' : modal === 'create' ? 'Create Admin' : 'Save Changes'}
                        </button>
                    </div>
                </Modal>
            )}

            {/* Delete Modal */}
            {modal === 'delete' && (
                <Modal title="Remove Admin" onClose={() => setModal(null)}>
                    <p style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.6 }}>
                        Delete admin <strong style={{ color: '#f1f5f9' }}>{selected?.name}</strong>?<br />
                        This <strong style={{ color: '#ef4444' }}>cannot be undone</strong>. Their created lessons will remain.
                    </p>
                    <div style={styles.modalActions}>
                        <button style={styles.cancelBtn} onClick={() => setModal(null)}>Cancel</button>
                        <button style={{ ...styles.primaryBtn, background: 'linear-gradient(135deg,#ef4444,#dc2626)' }} onClick={handleDelete} disabled={submitting}>
                            {submitting ? 'Deleting...' : 'Yes, Delete'}
                        </button>
                    </div>
                </Modal>
            )}

            {/* Promote User Modal */}
            {promoteModal && (
                <Modal title="⬆️ Promote User to Admin" onClose={() => setPromoteModal(false)}>
                    <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
                        Select a user to promote them to Admin role.
                    </p>
                    <div style={styles.searchWrap}>
                        <span style={styles.searchIcon}>🔍</span>
                        <input style={styles.searchInput} placeholder="Search users..." value={promoteSearch} onChange={e => setPromoteSearch(e.target.value)} />
                    </div>
                    <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {promoteLoading && <div style={{ textAlign: 'center', color: '#64748b', padding: 20 }}>Loading users...</div>}
                        {filteredUsers.map(u => (
                            <div key={u._id} style={styles.promoteRow}>
                                <div style={styles.promoteAvatar}>{u.name[0]?.toUpperCase()}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 13 }}>{u.name}</div>
                                    <div style={{ fontSize: 11, color: '#64748b' }}>{u.email}</div>
                                </div>
                                <button style={styles.promoteBtn} onClick={() => handlePromote(u._id)}>Promote →</button>
                            </div>
                        ))}
                        {!promoteLoading && filteredUsers.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#475569', padding: 20, fontSize: 13 }}>No users found.</div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
}

function AdminFormGrid({ form, setForm, showPassword }) {
    const fields = [
        { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Admin Name' },
        { key: 'email', label: 'Email', type: 'email', placeholder: 'admin@talkenglish.com' },
        ...(showPassword ? [{ key: 'password', label: 'Password', type: 'password', placeholder: 'Secure password' }] : []),
        { key: 'phone', label: 'Phone', type: 'text', placeholder: '9876543210' },
        { key: 'age', label: 'Age', type: 'number', placeholder: '25' },
        { key: 'state', label: 'State', type: 'text', placeholder: 'Delhi' },
        { key: 'country', label: 'Country', type: 'text', placeholder: 'India' },
    ];
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            {fields.map(f => (
                <div key={f.key} style={f.key === 'email' ? { gridColumn: '1/-1' } : {}}>
                    <label style={styles.label}>{f.label}</label>
                    <input style={styles.input} type={f.type} placeholder={f.placeholder} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
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
    toast: { position: 'fixed', top: 20, right: 28, color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, zIndex: 9999 },
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    pageTitle: { fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: 0, letterSpacing: '-0.5px' },
    pageSubtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
    primaryBtn: { background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit' },
    secondaryBtn: { background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: '#a78bfa', borderRadius: 10, padding: '10px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit' },
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
    avatar: { width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0 },
    userName: { fontWeight: 600, color: '#f1f5f9', fontSize: 13 },
    userEmail: { fontSize: 11, color: '#64748b' },
    lessonsCreatedBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: 20, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontSize: 12, fontWeight: 600 },
    toggleBtn: { border: 'none', borderRadius: 20, padding: '4px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'inherit' },
    toggleActive: { background: 'rgba(16,185,129,0.1)', color: '#10b981' },
    toggleInactive: { background: 'rgba(239,68,68,0.1)', color: '#ef4444' },
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
    promoteRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' },
    promoteAvatar: { width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0 },
    promoteBtn: { background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' },
};
