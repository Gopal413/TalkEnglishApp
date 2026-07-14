import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllLessonsAdminApi, deleteLessonApi } from '../../api/adminApi';
import { useAuth } from '../../context/AuthContext';

const categoryColors = {
    grammar: { bg: 'rgba(74, 155, 155, 0.12)', color: '#4A9B9B' },
    vocabulary: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
    pronunciation: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    phrases: { bg: 'rgba(236,72,153,0.12)', color: '#f472b6' },
};
const diffColors = {
    beginner: { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
    intermediate: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
    advanced: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
};

export default function AdminLessonsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [lessons, setLessons] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('');
    const [diffFilter, setDiffFilter] = useState('');
    const [deleteModal, setDeleteModal] = useState(null);
    const [completionsModal, setCompletionsModal] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState('');

    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const fetchLessons = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllLessonsAdminApi({ search, category: catFilter, difficulty: diffFilter });
            setLessons(data.lessons || []);
            setTotal(data.total || 0);
        } catch { 
            showToast('Failed to load lessons.'); 
        } finally { 
            setLoading(false); 
        }
    }, [search, catFilter, diffFilter]);

    useEffect(() => { 
        fetchLessons(); 
    }, [fetchLessons]);

    const handleDelete = async () => {
        if (!deleteModal) return;
        setDeleting(true);
        try {
            await deleteLessonApi(deleteModal.lessonId);
            showToast('🗑️ Lesson deleted.');
            setDeleteModal(null);
            fetchLessons();
        } catch (err) {
            showToast(err.response?.data?.error || 'Delete failed.');
            setDeleteModal(null);
        } finally { 
            setDeleting(false); 
        }
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedLessons = React.useMemo(() => {
        if (!sortField) return lessons;
        return [...lessons].sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];

            if (sortField === 'steps' || sortField === 'quiz') {
                valA = valA?.length || 0;
                valB = valB?.length || 0;
            }

            if (sortField === 'createdAt') {
                valA = new Date(valA);
                valB = new Date(valB);
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [lessons, sortField, sortDirection]);

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
                    <span style={{ fontSize: 9, color: isCurrent ? '#4A9B9B' : '#475569' }}>
                        {isCurrent ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                </div>
            </th>
        );
    };

    return (
        <div>
            {toast && <div style={styles.toast}>{toast}</div>}

            {/* Header */}
            <div style={styles.pageHeader}>
                <div>
                    <h1 style={styles.pageTitle}>📚 Curriculum Lessons</h1>
                    <p style={styles.pageSubtitle}>{total} total lessons · Manage or create lessons</p>
                </div>
                <button style={styles.primaryBtn} onClick={() => navigate('/admin/lessons/new')}>+ Create Lesson</button>
            </div>

            {/* Filters */}
            <div style={styles.filterRow}>
                <div style={styles.searchWrap}>
                    <span>🔍</span>
                    <input style={styles.searchInput} placeholder="Search lessons..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select style={styles.select} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                    <option value="">All Categories</option>
                    <option value="grammar">Grammar</option>
                    <option value="vocabulary">Vocabulary</option>
                    <option value="pronunciation">Pronunciation</option>
                    <option value="phrases">Phrases</option>
                </select>
                <select style={styles.select} value={diffFilter} onChange={e => setDiffFilter(e.target.value)}>
                    <option value="">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                </select>
            </div>

            {/* Lessons Table */}
            <div style={styles.card}>
                {loading ? (
                    <div style={styles.loadingRow}><span style={styles.spinner} /> Loading lessons...</div>
                ) : lessons.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>📚</div>
                        <div style={styles.emptyTitle}>No lessons found</div>
                        <div style={styles.emptySubtitle}>Create a new lesson to get started in your syllabus.</div>
                        <button style={styles.primaryBtn} onClick={() => navigate('/admin/lessons/new')}>+ Create Lesson</button>
                    </div>
                ) : (
                    <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    {renderSortHeader('Lesson', 'title')}
                                    {renderSortHeader('Category', 'category')}
                                    {renderSortHeader('Difficulty', 'difficulty')}
                                    {renderSortHeader('Est. Time', 'estimatedMinutes')}
                                    {renderSortHeader('Attended', 'completionsCount')}
                                    {renderSortHeader('Creator', 'createdByName')}
                                    <th style={styles.th}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedLessons.map(lesson => {
                                    const catColor = categoryColors[lesson.category] || categoryColors.grammar;
                                    const diffColor = diffColors[lesson.difficulty] || diffColors.beginner;

                                    // All admins have full CRUD permissions on all curriculum lessons
                                    const isOwner = true;

                                    return (
                                        <tr key={lesson.lessonId} style={styles.tr}>
                                            <td style={styles.td}>
                                                <div style={styles.lessonTitleWrap}>
                                                    <span style={styles.lessonEmoji}>{lesson.emoji || '📖'}</span>
                                                    <div>
                                                        <div style={styles.lessonTitle}>{lesson.title}</div>
                                                        <div style={styles.lessonIdText}>ID: {lesson.lessonId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{ ...styles.badge, background: catColor.bg, color: catColor.color }}>
                                                    {lesson.category}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{ ...styles.badge, background: diffColor.bg, color: diffColor.color }}>
                                                    {lesson.difficulty}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={styles.timeLabel}>⏱️ {lesson.estimatedMinutes || 5} min</span>
                                            </td>
                                            <td style={styles.td}>
                                                <button
                                                    style={{
                                                        background: lesson.completionsCount > 0 ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.03)',
                                                        border: lesson.completionsCount > 0 ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,255,255,0.06)',
                                                        color: lesson.completionsCount > 0 ? '#10b981' : '#64748b',
                                                        borderRadius: 8,
                                                        padding: '4px 10px',
                                                        fontSize: 11,
                                                        fontWeight: 600,
                                                        cursor: lesson.completionsCount > 0 ? 'pointer' : 'default',
                                                        fontFamily: 'inherit',
                                                        outline: 'none'
                                                    }}
                                                    onClick={() => lesson.completionsCount > 0 && setCompletionsModal(lesson)}
                                                >
                                                    👥 {lesson.completionsCount || 0}
                                                </button>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.creatorName}>
                                                    {lesson.createdByName || 'System'}
                                                </div>
                                                <div style={styles.creatorRole}>
                                                    {isOwner ? '⚡ You (Owner)' : 'Staff'}
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                {isOwner ? (
                                                    <div style={styles.actionsCell}>
                                                        <button 
                                                            style={styles.editBtn} 
                                                            onClick={() => navigate(`/admin/lessons/${lesson.lessonId}/edit`)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button 
                                                            style={styles.deleteBtn} 
                                                            onClick={() => setDeleteModal(lesson)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div style={styles.lockedCell}>
                                                        <span style={styles.lockIcon}>🔒</span> Locked
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {deleteModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalCard}>
                        <h3 style={styles.modalTitle}>Delete Lesson</h3>
                        <p style={styles.modalText}>
                            Are you sure you want to permanently delete <strong>{deleteModal.title}</strong>? This action is irreversible.
                        </p>
                        <div style={styles.modalButtons}>
                            <button 
                                style={styles.cancelBtn} 
                                onClick={() => setDeleteModal(null)} 
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button 
                                style={styles.confirmDeleteBtn} 
                                onClick={handleDelete} 
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting...' : 'Delete Permanently'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Completions Modal */}
            {completionsModal && (
                <div style={styles.modalOverlay} onClick={e => e.target === e.currentTarget && setCompletionsModal(null)}>
                    <div style={{ ...styles.modalCard, maxWidth: 540 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <h3 style={{ ...styles.modalTitle, margin: 0 }}>👥 Attendees: {completionsModal.title}</h3>
                            <button style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18 }} onClick={() => setCompletionsModal(null)}>✕</button>
                        </div>
                        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
                                The following students completed this lesson:
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {(completionsModal.completions || []).length === 0 ? (
                                    <div style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                                        No students have completed this lesson yet.
                                    </div>
                                ) : (
                                    (completionsModal.completions || []).map((c, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 13 }}>{c.name}</div>
                                                <div style={{ color: '#64748b', fontSize: 11, marginTop: 1 }}>{c.email}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ color: '#10b981', fontWeight: 600, fontSize: 13 }}>{c.percentage}% Score</div>
                                                <div style={{ color: '#64748b', fontSize: 10, marginTop: 2 }}>{new Date(c.completedAt).toLocaleDateString('en-IN')}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    pageTitle: { fontSize: 26, fontWeight: 700, color: '#f1f5f9', margin: 0, letterSpacing: '-0.5px' },
    pageSubtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
    primaryBtn: { background: 'linear-gradient(135deg,#4A9B9B,#2D7D7D)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: 12, fontWeight: 600, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 12px rgba(74, 155, 155, 0.25)', transition: 'all 0.2s' },
    filterRow: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
    searchWrap: { position: 'relative', flex: 1, minWidth: 240, display: 'flex', alignItems: 'center' },
    searchInput: { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '10px 16px 10px 38px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
    select: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '10px 16px', color: '#cbd5e1', fontSize: 13, cursor: 'pointer', outline: 'none' },
    card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '14px 16px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    tr: { borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' },
    td: { padding: '14px 16px', fontSize: 13, color: '#cbd5e1', verticalAlign: 'middle' },
    lessonTitleWrap: { display: 'flex', alignItems: 'center', gap: 12 },
    lessonEmoji: { fontSize: 24 },
    lessonTitle: { fontWeight: 600, color: '#f1f5f9' },
    lessonIdText: { fontSize: 11, color: '#64748b', marginTop: 1 },
    badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: 'capitalize' },
    timeLabel: { fontSize: 12, fontWeight: 500 },
    creatorName: { fontWeight: 500, color: '#e2e8f0' },
    creatorRole: { fontSize: 11, color: '#64748b', marginTop: 1 },
    actionsCell: { display: 'flex', gap: 8 },
    editBtn: { background: 'rgba(74, 155, 155, 0.1)', border: '1px solid rgba(74, 155, 155, 0.25)', color: '#4A9B9B', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' },
    deleteBtn: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' },
    lockedCell: { fontSize: 12, color: '#475569', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 },
    lockIcon: { fontSize: 12 },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' },
    modalCard: { background: '#12122a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400, boxShadow: '0 12px 32px rgba(0,0,0,0.5)', boxSizing: 'border-box' },
    modalTitle: { fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: '0 0 12px' },
    modalText: { fontSize: 13, color: '#94a3b8', margin: '0 0 24px', lineHeight: 1.5 },
    modalButtons: { display: 'flex', justifyContent: 'flex-end', gap: 12 },
    cancelBtn: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
    confirmDeleteBtn: { background: '#ef4444', border: 'none', color: '#fff', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,0.2)' },
    toast: { position: 'fixed', bottom: 24, right: 24, background: '#12122a', border: '1px solid rgba(74, 155, 155, 0.25)', color: '#fff', padding: '12px 24px', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 1000, fontSize: 13, fontWeight: 600 },
    loadingRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, gap: 12, color: '#64748b', fontSize: 14 },
    spinner: { width: 20, height: 20, border: '2px solid rgba(74,155,155,0.2)', borderTop: '2px solid #4A9B9B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    emptyState: { textAlign: 'center', color: '#64748b', padding: 48, fontSize: 14 },
    emptyIcon: { fontSize: 44, marginBottom: 12 },
    emptyTitle: { fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 },
    emptySubtitle: { fontSize: 13, color: '#64748b', marginBottom: 16 }
};
