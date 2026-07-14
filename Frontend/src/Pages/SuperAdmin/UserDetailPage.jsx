import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserByIdApi } from '../../api/superAdminApi';

const categoryColors = {
    grammar: { bg: 'rgba(99,102,241,0.12)', color: '#818cf8' },
    vocabulary: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
    pronunciation: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    phrases: { bg: 'rgba(236,72,153,0.12)', color: '#f472b6' },
};

export default function UserDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUserByIdApi(id)
            .then(setData)
            .catch(() => navigate('/superadmin/users'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div style={styles.center}><div style={styles.spinner} /></div>;
    if (!data) return null;

    const { user, conversationCount, totalCompleted, averageScore } = data;
    const progressCards = [
        { label: 'Lessons Completed', value: totalCompleted, icon: '📚', color: '#7c3aed' },
        { label: 'Average Score', value: `${averageScore}%`, icon: '🎯', color: averageScore >= 80 ? '#10b981' : averageScore >= 50 ? '#f59e0b' : '#ef4444' },
        { label: 'Current Streak', value: `${user.streak || 0} days`, icon: '🔥', color: '#f59e0b' },
        { label: 'AI Conversations', value: conversationCount, icon: '🤖', color: '#3b82f6' },
    ];

    return (
        <div>
            {/* Back */}
            <button style={styles.backBtn} onClick={() => navigate('/superadmin/users')}>← Back to Users</button>

            {/* Profile Header */}
            <div style={styles.profileCard}>
                <div style={styles.profileAvatar}>{user.name[0]?.toUpperCase()}</div>
                <div style={styles.profileInfo}>
                    <h1 style={styles.profileName}>{user.name}</h1>
                    <p style={styles.profileEmail}>{user.email}</p>
                    <div style={styles.profileTags}>
                        <span style={{ ...styles.tag, background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                            {user.isActive ? '✅ Active' : '⛔ Inactive'}
                        </span>
                        <span style={{ ...styles.tag, background: 'rgba(124,58,237,0.12)', color: '#a78bfa' }}>
                            {user.level || 'No level'}
                        </span>
                        <span style={{ ...styles.tag, background: 'rgba(59,130,246,0.12)', color: '#60a5fa' }}>
                            🎯 {user.goal || 'No goal'}
                        </span>
                    </div>
                </div>
                <div style={styles.profileMeta}>
                    <div style={styles.metaRow}><span style={styles.metaKey}>📱 Phone</span><span style={styles.metaVal}>{user.phone || '-'}</span></div>
                    <div style={styles.metaRow}><span style={styles.metaKey}>📅 Age</span><span style={styles.metaVal}>{user.age || '-'}</span></div>
                    <div style={styles.metaRow}><span style={styles.metaKey}>📍 State</span><span style={styles.metaVal}>{user.state || '-'}</span></div>
                    <div style={styles.metaRow}><span style={styles.metaKey}>🌍 Country</span><span style={styles.metaVal}>{user.country || '-'}</span></div>
                    <div style={styles.metaRow}><span style={styles.metaKey}>📆 Joined</span><span style={styles.metaVal}>{new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                </div>
            </div>

            {/* Progress Stats */}
            <h2 style={styles.sectionTitle}>📈 Progress Overview</h2>
            <div style={styles.statsGrid}>
                {progressCards.map((c, i) => (
                    <div key={i} style={{ ...styles.statCard, borderColor: `${c.color}20` }}>
                        <div style={{ ...styles.statIcon, background: `${c.color}15`, color: c.color }}>{c.icon}</div>
                        <div>
                            <div style={{ ...styles.statValue, color: c.color }}>{c.value}</div>
                            <div style={styles.statLabel}>{c.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Completed Lessons */}
            <h2 style={styles.sectionTitle}>📚 Completed Lessons ({totalCompleted})</h2>
            <div style={styles.card}>
                {user.completedLessons?.length === 0 ? (
                    <div style={styles.empty}>No lessons completed yet.</div>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                {['Lesson', 'Category', 'Score', 'Progress', 'Completed On'].map(h => (
                                    <th key={h} style={styles.th}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {user.completedLessons?.map((c, i) => (
                                <tr key={i} style={styles.tr}>
                                    <td style={styles.td}>
                                        <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{c.emoji} {c.lessonTitle}</div>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{ ...styles.catBadge, ...(categoryColors[c.category] || {}) }}>
                                            {c.category || '-'}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{c.score}/{c.total}</td>
                                    <td style={styles.td}>
                                        <div style={styles.scoreWrap}>
                                            <div style={styles.scoreBar}>
                                                <div style={{ ...styles.scoreFill, width: `${c.percentage}%`, background: c.percentage >= 80 ? '#10b981' : c.percentage >= 50 ? '#f59e0b' : '#ef4444' }} />
                                            </div>
                                            <span style={{ fontSize: 12, fontWeight: 700, minWidth: 32, color: '#e2e8f0' }}>{c.percentage}%</span>
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{ fontSize: 11, color: '#64748b' }}>{new Date(c.completedAt).toLocaleDateString('en-IN')}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

const styles = {
    center: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' },
    spinner: { width: 40, height: 40, border: '3px solid rgba(124,58,237,0.2)', borderTop: '3px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    backBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', marginBottom: 24 },
    profileCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(124,58,237,0.12)', borderRadius: 20, padding: 28, display: 'flex', gap: 24, marginBottom: 28, alignItems: 'flex-start' },
    profileAvatar: { width: 72, height: 72, borderRadius: 18, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff', flexShrink: 0, boxShadow: '0 8px 24px rgba(124,58,237,0.3)' },
    profileInfo: { flex: 1 },
    profileName: { fontSize: 22, fontWeight: 800, color: '#f1f5f9', margin: '0 0 4px' },
    profileEmail: { fontSize: 13, color: '#64748b', margin: '0 0 12px' },
    profileTags: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    tag: { display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
    profileMeta: { display: 'flex', flexDirection: 'column', gap: 6, minWidth: 200 },
    metaRow: { display: 'flex', justifyContent: 'space-between', gap: 16 },
    metaKey: { fontSize: 12, color: '#64748b' },
    metaVal: { fontSize: 12, fontWeight: 600, color: '#cbd5e1' },
    sectionTitle: { fontSize: 16, fontWeight: 700, color: '#e2e8f0', margin: '0 0 14px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 },
    statCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid', borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 },
    statIcon: { width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 },
    statValue: { fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' },
    statLabel: { fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 2 },
    card: { background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden', marginBottom: 28 },
    empty: { padding: 40, textAlign: 'center', color: '#475569', fontSize: 13 },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '12px 16px', fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)' },
    tr: { borderBottom: '1px solid rgba(255,255,255,0.03)' },
    td: { padding: '13px 16px', fontSize: 13, color: '#cbd5e1', verticalAlign: 'middle' },
    catBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
    scoreWrap: { display: 'flex', alignItems: 'center', gap: 8 },
    scoreBar: { flex: 1, height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' },
    scoreFill: { height: '100%', borderRadius: 3 },
};
