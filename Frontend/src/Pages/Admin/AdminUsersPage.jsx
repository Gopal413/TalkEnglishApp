import React, { useEffect, useState, useCallback } from 'react';
import { getAllUsersApi } from '../../api/adminApi';

const levelColors = {
    beginner: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', label: 'Beginner' },
    intermediate: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: 'Intermediate' },
    advanced: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', label: 'Advanced' },
    null: { bg: 'rgba(100,116,139,0.12)', color: '#64748b', label: 'Not Set' }
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
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
        } catch { 
            showToast('Failed to load users.'); 
        } finally { 
            setLoading(false); 
        }
    }, [search]);

    useEffect(() => { 
        fetchUsers(); 
    }, [fetchUsers]);

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
                    <span style={{ fontSize: 9, color: isCurrent ? '#4A9B9B' : '#64748b' }}>
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
                    <h1 style={styles.pageTitle}>👥 Students Directory</h1>
                    <p style={styles.pageSubtitle}>{total} registered students · Progress statistics (Read-Only)</p>
                </div>
            </div>

            {/* Search */}
            <div style={styles.searchWrap}>
                <span style={styles.searchIcon}>🔍</span>
                <input
                    type="text"
                    placeholder="Search students by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={styles.searchInput}
                />
            </div>

            {/* Users Table */}
            <div style={styles.card}>
                {loading ? (
                    <div style={styles.loadingRow}>
                        <div style={styles.spinner} /> Loading directory...
                    </div>
                ) : users.length === 0 ? (
                    <div style={styles.emptyState}>No students found matching your search.</div>
                ) : (
                    <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    {renderSortHeader('Student', 'name')}
                                    {renderSortHeader('Fluency Level', 'level')}
                                    {renderSortHeader('Lessons Finished', 'lessonsCompleted')}
                                    {renderSortHeader('Average Score', 'averageScore')}
                                    {renderSortHeader('Streak', 'streak')}
                                    {renderSortHeader('Contact Info', 'phone')}
                                    {renderSortHeader('Location', 'state')}
                                    {renderSortHeader('Status', 'isActive')}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedUsers.map(u => {
                                    const level = u.level || 'null';
                                    const lvlBadge = levelColors[level] || levelColors.null;
                                    return (
                                        <tr key={u._id} style={styles.tr}>
                                            <td style={styles.td}>
                                                <div style={styles.userCell}>
                                                    <div style={styles.userAvatar}>
                                                        {u.name?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <div style={styles.userName}>{u.name}</div>
                                                        <div style={styles.userEmail}>{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{ ...styles.levelBadge, background: lvlBadge.bg, color: lvlBadge.color }}>
                                                    {lvlBadge.label}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={styles.numBadge}>{u.lessonsCompleted} lessons</span>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.scoreWrap}>
                                                    <div style={styles.scoreBar}>
                                                        <div 
                                                            style={{ 
                                                                ...styles.scoreFill, 
                                                                width: `${u.averageScore}%`, 
                                                                background: u.averageScore >= 90 ? '#27AE60' : u.averageScore >= 70 ? '#f59e0b' : '#ef4444' 
                                                            }} 
                                                        />
                                                    </div>
                                                    <span style={styles.scoreNum}>{u.averageScore}%</span>
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={styles.streakBadge}>🔥 {u.streak || 0} days</span>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={{ fontSize: 13 }}>📞 {u.phone || 'N/A'}</div>
                                                <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>Age: {u.age || 'N/A'}</div>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={{ fontWeight: 500 }}>{u.state || 'N/A'}</div>
                                                <div style={{ fontSize: 11, color: '#64748b' }}>{u.country || 'N/A'}</div>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{ 
                                                    ...styles.statusBadge, 
                                                    background: u.isActive ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                                                    color: u.isActive ? '#10b981' : '#ef4444'
                                                }}>
                                                    {u.isActive ? 'Active' : 'Suspended'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    pageTitle: { fontSize: 26, fontWeight: 700, color: '#f1f5f9', margin: 0, letterSpacing: '-0.5px' },
    pageSubtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
    searchWrap: { position: 'relative', marginBottom: 20 },
    searchIcon: { position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: '#64748b' },
    searchInput: { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 16px 12px 44px', color: '#fff', fontSize: 14, outline: 'none', transition: 'all 0.2s', fontFamily: 'inherit', boxSizing: 'border-box' },
    card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '14px 16px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    tr: { borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' },
    td: { padding: '14px 16px', fontSize: 13, color: '#cbd5e1', verticalAlign: 'middle' },
    userCell: { display: 'flex', alignItems: 'center', gap: 10 },
    userAvatar: { width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#4A9B9B,#2D7D7D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0 },
    userName: { fontWeight: 600, color: '#f1f5f9' },
    userEmail: { fontSize: 11, color: '#64748b', marginTop: 1 },
    levelBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
    numBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', fontSize: 12, fontWeight: 600, color: '#e2e8f0' },
    scoreWrap: { display: 'flex', alignItems: 'center', gap: 8 },
    scoreBar: { flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' },
    scoreFill: { height: '100%', borderRadius: 3, transition: 'width 0.4s' },
    scoreNum: { fontSize: 12, fontWeight: 700, color: '#e2e8f0', minWidth: 32 },
    streakBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontSize: 12, fontWeight: 600 },
    statusBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
    toast: { position: 'fixed', bottom: 24, right: 24, background: '#12122a', border: '1px solid rgba(74, 155, 155, 0.25)', color: '#fff', padding: '12px 24px', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 1000, fontSize: 13, fontWeight: 600, animation: 'slideIn 0.3s ease' },
    loadingRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, gap: 12, color: '#64748b', fontSize: 14 },
    spinner: { width: 20, height: 20, border: '2px solid rgba(74,155,155,0.2)', borderTop: '2px solid #4A9B9B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    emptyState: { textAlign: 'center', color: '#64748b', padding: 48, fontSize: 14 },
};
