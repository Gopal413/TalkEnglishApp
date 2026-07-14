import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAdminByIdApi, demoteAdminApi } from '../../api/superAdminApi';

const categoryColors = {
    grammar: { bg: 'rgba(99,102,241,0.12)', color: '#818cf8' },
    vocabulary: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
    pronunciation: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    phrases: { bg: 'rgba(236,72,153,0.12)', color: '#f472b6' },
};
const diffColors = {
    beginner: { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
    intermediate: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
    advanced: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
};

export default function AdminDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');
    const [demoting, setDemoting] = useState(false);
    const [showDemoteConfirm, setShowDemoteConfirm] = useState(false);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    useEffect(() => {
        getAdminByIdApi(id)
            .then(setData)
            .catch(() => navigate('/superadmin/admins'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleDemote = async () => {
        setDemoting(true);
        try {
            await demoteAdminApi(id);
            showToast('Admin demoted to User.');
            setTimeout(() => navigate('/superadmin/admins'), 1500);
        } catch (err) {
            showToast(err.response?.data?.error || 'Demotion failed.');
        } finally { setDemoting(false); setShowDemoteConfirm(false); }
    };

    if (loading) return <div style={styles.center}><div style={styles.spinner} /></div>;
    if (!data) return null;

    const { admin, lessonsCreated, totalLessons } = data;

    return (
        <div>
            {toast && <div style={styles.toast}>{toast}</div>}

            {/* Back */}
            <button style={styles.backBtn} onClick={() => navigate('/superadmin/admins')}>← Back to Admins</button>

            {/* Profile Card */}
            <div style={styles.profileCard}>
                <div style={styles.profileAvatar}>{admin.name[0]?.toUpperCase()}</div>
                <div style={styles.profileInfo}>
                    <div style={styles.roleTag}>🛡️ Admin</div>
                    <h1 style={styles.profileName}>{admin.name}</h1>
                    <p style={styles.profileEmail}>{admin.email}</p>
                    <div style={styles.profileTags}>
                        <span style={{ ...styles.tag, background: admin.isActive ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: admin.isActive ? '#10b981' : '#f87171' }}>
                            {admin.isActive ? '✅ Active' : '⛔ Inactive'}
                        </span>
                        <span style={{ ...styles.tag, background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                            📚 {totalLessons} Lessons Created
                        </span>
                    </div>
                </div>
                <div style={styles.profileActions}>
                    <div style={styles.metaItem}>
                        <span style={styles.metaKey}>📍 Location</span>
                        <span style={styles.metaVal}>{admin.state ? `${admin.state}, ${admin.country}` : admin.country || '-'}</span>
                    </div>
                    <div style={styles.metaItem}>
                        <span style={styles.metaKey}>📱 Phone</span>
                        <span style={styles.metaVal}>{admin.phone || '-'}</span>
                    </div>
                    <div style={styles.metaItem}>
                        <span style={styles.metaKey}>📆 Joined</span>
                        <span style={styles.metaVal}>{new Date(admin.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <button style={styles.demoteBtn} onClick={() => setShowDemoteConfirm(true)}>
                        ⬇️ Demote to User
                    </button>
                </div>
            </div>

            {/* Lessons Created */}
            <h2 style={styles.sectionTitle}>📚 Lessons Created by {admin.name} ({totalLessons})</h2>
            <div style={styles.card}>
                {lessonsCreated.length === 0 ? (
                    <div style={styles.empty}>This admin hasn't created any lessons yet.</div>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                {['Lesson', 'Category', 'Difficulty', 'Duration', 'Created On'].map(h => (
                                    <th key={h} style={styles.th}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {lessonsCreated.map((l, i) => (
                                <tr key={i} style={styles.tr}>
                                    <td style={styles.td}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={styles.lessonEmoji}>{l.emoji}</span>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 13 }}>{l.title}</div>
                                                <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{l.lessonId}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{ ...styles.catBadge, ...(categoryColors[l.category] || {}) }}>{l.category}</span>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{ ...styles.catBadge, ...(diffColors[l.difficulty] || {}) }}>{l.difficulty}</span>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{ fontSize: 12, color: '#94a3b8' }}>⏱ {l.estimatedMinutes} min</span>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{ fontSize: 11, color: '#64748b' }}>{new Date(l.createdAt).toLocaleDateString('en-IN')}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Demote Confirm */}
            {showDemoteConfirm && (
                <div style={styles.overlay} onClick={e => e.target === e.currentTarget && setShowDemoteConfirm(false)}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>⬇️ Demote Admin</h3>
                            <button style={styles.closeBtn} onClick={() => setShowDemoteConfirm(false)}>✕</button>
                        </div>
                        <div style={{ padding: 24 }}>
                            <p style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.6 }}>
                                Demote <strong style={{ color: '#f1f5f9' }}>{admin.name}</strong> from Admin to User?<br />
                                They will lose admin access immediately.
                            </p>
                            <div style={styles.modalActions}>
                                <button style={styles.cancelBtn} onClick={() => setShowDemoteConfirm(false)}>Cancel</button>
                                <button style={{ ...styles.primaryBtn, background: 'linear-gradient(135deg,#f59e0b,#d97706)' }} onClick={handleDemote} disabled={demoting}>
                                    {demoting ? 'Demoting...' : 'Yes, Demote'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    center: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' },
    spinner: { width: 40, height: 40, border: '3px solid rgba(124,58,237,0.2)', borderTop: '3px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    toast: { position: 'fixed', top: 20, right: 28, background: 'rgba(16,185,129,0.9)', color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, zIndex: 9999 },
    backBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', marginBottom: 24 },
    profileCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(124,58,237,0.12)', borderRadius: 20, padding: 28, display: 'flex', gap: 24, marginBottom: 28, alignItems: 'flex-start' },
    profileAvatar: { width: 72, height: 72, borderRadius: 18, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff', flexShrink: 0, boxShadow: '0 8px 24px rgba(124,58,237,0.35)' },
    profileInfo: { flex: 1 },
    roleTag: { display: 'inline-block', background: 'rgba(124,58,237,0.15)', color: '#a78bfa', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, marginBottom: 6 },
    profileName: { fontSize: 22, fontWeight: 800, color: '#f1f5f9', margin: '0 0 4px' },
    profileEmail: { fontSize: 13, color: '#64748b', margin: '0 0 12px' },
    profileTags: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    tag: { display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
    profileActions: { display: 'flex', flexDirection: 'column', gap: 8, minWidth: 220 },
    metaItem: { display: 'flex', justifyContent: 'space-between', gap: 12 },
    metaKey: { fontSize: 12, color: '#64748b' },
    metaVal: { fontSize: 12, fontWeight: 600, color: '#cbd5e1' },
    demoteBtn: { background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', color: '#f59e0b', borderRadius: 10, padding: '9px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 12, fontFamily: 'inherit', marginTop: 8, textAlign: 'left' },
    sectionTitle: { fontSize: 16, fontWeight: 700, color: '#e2e8f0', margin: '0 0 14px' },
    card: { background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' },
    empty: { padding: 40, textAlign: 'center', color: '#475569', fontSize: 13 },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '12px 16px', fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)' },
    tr: { borderBottom: '1px solid rgba(255,255,255,0.03)' },
    td: { padding: '13px 16px', fontSize: 13, color: '#cbd5e1', verticalAlign: 'middle' },
    lessonEmoji: { fontSize: 22, lineHeight: 1 },
    catBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: '#13132a', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 24px 80px rgba(0,0,0,0.6)' },
    modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
    modalTitle: { fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: 0 },
    closeBtn: { background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18 },
    modalActions: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 },
    cancelBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit' },
    primaryBtn: { color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit' },
};
