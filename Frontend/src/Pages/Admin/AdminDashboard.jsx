import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStats } from '../../api/adminApi';

const levelColors = {
    beginner: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', label: 'Beginner' },
    intermediate: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: 'Intermediate' },
    advanced: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', label: 'Advanced' },
};

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getAdminStats()
            .then(d => setData(d))
            .catch(() => setError('Failed to load dashboard stats.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingScreen />;
    if (error) return <ErrorScreen msg={error} />;

    const { stats, topScorers } = data;

    const statCards = [
        { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', sub: `${stats.activeUsers} active` },
        { label: 'Active Users', value: stats.activeUsers, icon: '⚡', color: '#E07B6A', bg: 'rgba(224,123,106,0.08)', sub: 'In system' },
        { label: 'My Lessons', value: stats.totalLessons, icon: '📚', color: '#4A9B9B', bg: 'rgba(74,155,155,0.08)', sub: 'Created by you' },
        { label: 'My Completions', value: stats.totalCompletions, icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.08)', sub: 'User lesson finishes' },
    ];

    return (
        <div>
            <style>{`
                .responsive-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 28px;
                }
                .responsive-actions-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    margin-bottom: 28px;
                }
                @media (max-width: 1024px) {
                    .responsive-stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .responsive-actions-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 600px) {
                    .responsive-stats-grid {
                        grid-template-columns: 1fr;
                    }
                    .responsive-actions-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            {/* Page Header */}
            <div style={styles.pageHeader}>
                <div>
                    <h1 style={styles.pageTitle}>Admin Dashboard</h1>
                    <p style={styles.pageSubtitle}>Monitor student accomplishments and maintain curriculum lessons.</p>
                </div>
                <div style={styles.headerDate}>
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stat Cards */}
            <div className="responsive-stats-grid">
                {statCards.map((card, i) => (
                    <div key={i} style={{ ...styles.statCard, background: card.bg, borderColor: `${card.color}20` }}>
                        <div style={{ ...styles.statIcon, background: `${card.color}18`, color: card.color }}>
                            {card.icon}
                        </div>
                        <div style={styles.statInfo}>
                            <div style={styles.statValue}>{card.value.toLocaleString()}</div>
                            <div style={styles.statLabel}>{card.label}</div>
                            <div style={{ ...styles.statSub, color: card.color }}>{card.sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Quick Actions</h2>
            </div>
            <div className="responsive-actions-grid">
                {[
                    { label: 'Create Lesson', icon: '➕📚', path: '/admin/lessons/new', color: '#E07B6A' },
                    { label: 'Manage Lessons', icon: '📝📚', path: '/admin/lessons', color: '#4A9B9B' },
                    { label: 'View Students', icon: '👥', path: '/admin/users', color: '#3b82f6' },
                    { label: 'Leaderboard Ranks', icon: '🏆', path: '/admin/leaderboard', color: '#f59e0b' },
                ].map((action, i) => (
                    <button
                        key={i}
                        style={{ ...styles.actionBtn, borderColor: `${action.color}30`, color: action.color }}
                        onClick={() => navigate(action.path)}
                    >
                        <span style={styles.actionIcon}>{action.icon}</span>
                        <span style={styles.actionLabel}>{action.label}</span>
                    </button>
                ))}
            </div>

            {/* Top Scorers */}
            <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>🏆 Top Scorers</h2>
                <button style={styles.viewAllBtn} onClick={() => navigate('/admin/leaderboard')}>
                    View Full Leaderboard →
                </button>
            </div>
            <div style={styles.card}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Rank</th>
                            <th style={styles.th}>User</th>
                            <th style={styles.th}>Lessons Finished</th>
                            <th style={styles.th}>Average Score</th>
                            <th style={styles.th}>Streak</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topScorers.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={styles.emptyCell}>No users have started practice sessions yet.</td>
                            </tr>
                        ) : (
                            topScorers.map((user, i) => {
                                const ranks = ['🥇', '🥈', '🥉'];
                                return (
                                    <tr key={user.id} style={styles.tr}>
                                        <td style={styles.td}>
                                            {ranks[i] ? (
                                                <span style={styles.rankBadge}>{ranks[i]}</span>
                                            ) : (
                                                <span style={styles.numBadge}>{i + 1}</span>
                                            )}
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.userCell}>
                                                <div style={styles.userAvatar}>
                                                    {user.name?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <div style={styles.userName}>{user.name}</div>
                                                    <div style={styles.userEmail}>{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.numBadge}>{user.totalCompleted} lessons</span>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.scoreWrap}>
                                                <div style={styles.scoreBar}>
                                                    <div 
                                                        style={{ 
                                                            ...styles.scoreFill, 
                                                            width: `${user.averageScore}%`, 
                                                            background: user.averageScore >= 80 ? '#10b981' : user.averageScore >= 60 ? '#f59e0b' : '#ef4444' 
                                                        }} 
                                                    />
                                                </div>
                                                <span style={styles.scoreNum}>{user.averageScore}%</span>
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.streakBadge}>🔥 {user.streak} days</span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function LoadingScreen() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
            <div style={{ width: 48, height: 48, border: '3px solid rgba(74,155,155,0.2)', borderTop: '3px solid #4A9B9B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: '#64748b', fontSize: 14 }}>Loading dashboard...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

function ErrorScreen({ msg }) {
    return <div style={{ color: '#ef4444', padding: 32, textAlign: 'center', fontSize: 14 }}>⚠️ {msg}</div>;
}

const styles = {
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
    pageTitle: { fontSize: 26, fontWeight: 700, color: '#f1f5f9', margin: 0, letterSpacing: '-0.5px' },
    pageSubtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
    headerDate: { fontSize: 12, color: '#475569', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', padding: '6px 14px', borderRadius: 20 },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 },
    statCard: { display: 'flex', alignItems: 'center', gap: 16, padding: '20px', borderRadius: 16, border: '1px solid', backdropFilter: 'blur(8px)', transition: 'transform 0.2s', cursor: 'default' },
    statIcon: { width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 },
    statInfo: { flex: 1 },
    statValue: { fontSize: 28, fontWeight: 800, color: '#f1f5f9', lineHeight: 1, letterSpacing: '-1px' },
    statLabel: { fontSize: 12, color: '#94a3b8', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' },
    statSub: { fontSize: 11, marginTop: 2, fontWeight: 500 },
    sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    sectionTitle: { fontSize: 16, fontWeight: 700, color: '#e2e8f0', margin: 0 },
    viewAllBtn: { background: 'transparent', border: 'none', color: '#4A9B9B', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
    actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 },
    actionBtn: { background: 'rgba(255,255,255,0.03)', border: '1px solid', borderRadius: 14, padding: '18px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s', fontFamily: 'inherit', fontSize: 14, fontWeight: 600 },
    actionIcon: { fontSize: 22 },
    actionLabel: {},
    card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    tr: { borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' },
    td: { padding: '14px 16px', fontSize: 13, color: '#cbd5e1', verticalAlign: 'middle' },
    emptyCell: { textAlign: 'center', color: '#475569', padding: 32, fontSize: 13 },
    rankBadge: { fontSize: 18, display: 'inline-block' },
    userCell: { display: 'flex', alignItems: 'center', gap: 10 },
    userAvatar: { width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#4A9B9B,#2D7D7D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0 },
    userName: { fontWeight: 600, color: '#f1f5f9', fontSize: 13 },
    userEmail: { fontSize: 11, color: '#64748b', marginTop: 1 },
    levelBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
    numBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', fontSize: 12, fontWeight: 600, color: '#e2e8f0' },
    scoreWrap: { display: 'flex', alignItems: 'center', gap: 8 },
    scoreBar: { flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' },
    scoreFill: { height: '100%', borderRadius: 3, transition: 'width 0.4s' },
    scoreNum: { fontSize: 12, fontWeight: 700, color: '#e2e8f0', minWidth: 32 },
    streakBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontSize: 12, fontWeight: 600 },
};
