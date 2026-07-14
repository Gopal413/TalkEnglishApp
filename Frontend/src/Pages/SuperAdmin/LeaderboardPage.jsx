import React, { useEffect, useState } from 'react';
import { getLeaderboardApi as getSuperLeaderboardApi } from '../../api/superAdminApi';
import { getLeaderboardApi as getAdminLeaderboardApi } from '../../api/adminApi';

const levelColors = {
    beginner: { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
    intermediate: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
    advanced: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
};

const RANK_STYLES = {
    0: { bg: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff', label: '🥇 1st' },
    1: { bg: 'linear-gradient(135deg,#94a3b8,#64748b)', color: '#fff', label: '🥈 2nd' },
    2: { bg: 'linear-gradient(135deg,#cd7f32,#a0522d)', color: '#fff', label: '🥉 3rd' },
};

export default function LeaderboardPage({ isAdminMode = false }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const getLeaderboard = isAdminMode ? getAdminLeaderboardApi : getSuperLeaderboardApi;

    useEffect(() => {
        getLeaderboard()
            .then(d => setData(d.leaderboard || []))
            .catch(() => setError('Failed to load leaderboard.'))
            .finally(() => setLoading(false));
    }, [getLeaderboard]);

    const top3 = data.slice(0, 3);
    const rest = data.slice(3);

    return (
        <div>
            <div style={styles.pageHeader}>
                <div>
                    <h1 style={styles.pageTitle}>🏆 Leaderboard</h1>
                    <p style={styles.pageSubtitle}>Top scoring students across TalkEnglish · Sorted by average quiz score</p>
                </div>
                <div style={styles.totalBadge}>👥 {data.length} Active Users</div>
            </div>

            {loading && (
                <div style={styles.loadingRow}><span style={styles.spinner} /> Loading leaderboard...</div>
            )}
            {error && <div style={{ color: '#ef4444', textAlign: 'center', padding: 40 }}>{error}</div>}

            {!loading && !error && data.length === 0 && (
                <div style={styles.emptyState}>
                    <div style={{ fontSize: 48 }}>🏆</div>
                    <div style={styles.emptyTitle}>No data yet</div>
                    <div style={styles.emptySubtitle}>Users need to complete lessons to appear here.</div>
                </div>
            )}

            {/* Top 3 Podium */}
            {!loading && top3.length > 0 && (
                <>
                    <div style={styles.podiumRow}>
                        {/* 2nd */}
                        {top3[1] && <PodiumCard user={top3[1]} rank={1} />}
                        {/* 1st */}
                        {top3[0] && <PodiumCard user={top3[0]} rank={0} featured />}
                        {/* 3rd */}
                        {top3[2] && <PodiumCard user={top3[2]} rank={2} />}
                    </div>

                    {/* Rest of Table */}
                    {rest.length > 0 && (
                        <div style={styles.card}>
                            <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            {['Rank', 'Student', 'Level', 'Lessons Done', 'Avg Score', 'Streak 🔥', 'Joined'].map(h => (
                                                <th key={h} style={styles.th}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rest.map((u, i) => (
                                            <tr key={u.id} style={styles.tr}>
                                                <td style={styles.td}>
                                                    <span style={styles.rankNum}>#{i + 4}</span>
                                                </td>
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
                                                    <span style={{ ...styles.badge, ...(levelColors[u.level] || {}) }}>{u.level}</span>
                                                </td>
                                                <td style={styles.td}><span style={styles.numBadge}>{u.totalCompleted}</span></td>
                                                <td style={styles.td}>
                                                    <div style={styles.scoreWrap}>
                                                        <div style={styles.scoreBar}>
                                                            <div style={{ ...styles.scoreFill, width: `${u.averageScore}%`, background: u.averageScore >= 80 ? '#10b981' : u.averageScore >= 50 ? '#f59e0b' : '#ef4444' }} />
                                                        </div>
                                                        <span style={styles.scoreNum}>{u.averageScore}%</span>
                                                    </div>
                                                </td>
                                                <td style={styles.td}><span style={styles.streakBadge}>🔥 {u.streak}</span></td>
                                                <td style={styles.td}><span style={{ fontSize: 11, color: '#64748b' }}>{new Date(u.joinedAt).toLocaleDateString('en-IN')}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function PodiumCard({ user, rank, featured }) {
    const rs = RANK_STYLES[rank];
    return (
        <div style={{ ...styles.podiumCard, ...(featured ? styles.podiumCardFeatured : {}), order: rank === 1 ? 1 : rank === 0 ? 2 : 3 }}>
            <div style={{ ...styles.podiumRank, background: rs.bg, color: rs.color }}>{rs.label}</div>
            <div style={{ ...styles.podiumAvatar, ...(featured ? styles.podiumAvatarFeatured : {}) }}>
                {user.name[0]?.toUpperCase()}
            </div>
            <div style={styles.podiumName}>{user.name}</div>
            <div style={styles.podiumEmail}>{user.email}</div>
            <div style={styles.podiumScore}>{user.averageScore}%</div>
            <div style={styles.podiumLabel}>Avg Score</div>
            <div style={styles.podiumStats}>
                <div style={styles.podiumStat}>
                    <div style={styles.podiumStatVal}>{user.totalCompleted}</div>
                    <div style={styles.podiumStatKey}>Lessons</div>
                </div>
                <div style={styles.podiumStatDivider} />
                <div style={styles.podiumStat}>
                    <div style={styles.podiumStatVal}>🔥 {user.streak}</div>
                    <div style={styles.podiumStatKey}>Streak</div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
    pageTitle: { fontSize: 26, fontWeight: 800, color: '#f1f5f9', margin: 0, letterSpacing: '-0.5px' },
    pageSubtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
    totalBadge: { background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: '#a78bfa', padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600 },
    loadingRow: { display: 'flex', alignItems: 'center', gap: 12, padding: 40, color: '#64748b', fontSize: 13, justifyContent: 'center' },
    spinner: { display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(124,58,237,0.2)', borderTop: '2px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    emptyState: { textAlign: 'center', padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
    emptyTitle: { fontSize: 18, fontWeight: 700, color: '#f1f5f9' },
    emptySubtitle: { fontSize: 13, color: '#64748b' },
    podiumRow: { display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap' },
    podiumCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 220, transition: 'transform 0.2s' },
    podiumCardFeatured: { background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(79,70,229,0.08))', border: '1px solid rgba(124,58,237,0.25)', boxShadow: '0 8px 32px rgba(124,58,237,0.15)', transform: 'scale(1.04)' },
    podiumRank: { padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 800, marginBottom: 6 },
    podiumAvatar: { width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg,#475569,#334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' },
    podiumAvatarFeatured: { width: 72, height: 72, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 8px 24px rgba(124,58,237,0.4)' },
    podiumName: { fontWeight: 700, color: '#f1f5f9', fontSize: 15, textAlign: 'center' },
    podiumEmail: { fontSize: 11, color: '#64748b', textAlign: 'center', marginBottom: 8 },
    podiumScore: { fontSize: 32, fontWeight: 900, color: '#7c3aed', letterSpacing: '-1px', lineHeight: 1 },
    podiumLabel: { fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' },
    podiumStats: { display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '10px 16px' },
    podiumStat: { textAlign: 'center' },
    podiumStatVal: { fontWeight: 700, color: '#e2e8f0', fontSize: 14 },
    podiumStatKey: { fontSize: 10, color: '#64748b', marginTop: 2 },
    podiumStatDivider: { width: 1, height: 24, background: 'rgba(255,255,255,0.08)' },
    card: { background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '12px 16px', fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)' },
    tr: { borderBottom: '1px solid rgba(255,255,255,0.03)' },
    td: { padding: '14px 16px', fontSize: 13, color: '#cbd5e1', verticalAlign: 'middle' },
    rankNum: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', fontSize: 12, fontWeight: 700, color: '#94a3b8' },
    userCell: { display: 'flex', alignItems: 'center', gap: 10 },
    avatar: { width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#475569,#334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0 },
    userName: { fontWeight: 600, color: '#f1f5f9', fontSize: 13 },
    userEmail: { fontSize: 11, color: '#64748b' },
    badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
    numBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', fontSize: 12, fontWeight: 600 },
    scoreWrap: { display: 'flex', alignItems: 'center', gap: 8 },
    scoreBar: { flex: 1, height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' },
    scoreFill: { height: '100%', borderRadius: 3 },
    scoreNum: { fontSize: 12, fontWeight: 700, minWidth: 32, color: '#e2e8f0' },
    streakBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontSize: 12, fontWeight: 600 },
};
