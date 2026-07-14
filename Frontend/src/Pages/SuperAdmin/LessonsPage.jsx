import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllLessonsAdminApi, deleteLessonApi } from '../../api/superAdminApi';

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

export default function LessonsPage() {
    const navigate = useNavigate();
    const [lessons, setLessons] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('');
    const [diffFilter, setDiffFilter] = useState('');
    const [deleteModal, setDeleteModal] = useState(null);
    const [viewModal, setViewModal] = useState(null);
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
        } catch { showToast('Failed to load lessons.'); }
        finally { setLoading(false); }
    }, [search, catFilter, diffFilter]);

    useEffect(() => { fetchLessons(); }, [fetchLessons]);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteLessonApi(deleteModal.lessonId);
            showToast('🗑️ Lesson deleted.');
            setDeleteModal(null);
            fetchLessons();
        } catch (err) {
            showToast(err.response?.data?.error || 'Delete failed.');
            setDeleteModal(null);
        } finally { setDeleting(false); }
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
                    <span style={{ fontSize: 9, color: isCurrent ? '#a78bfa' : '#475569' }}>
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
                    <h1 style={styles.pageTitle}>📚 Curriculum Directory</h1>
                    <p style={styles.pageSubtitle}>{total} lessons · View and moderate syllabus content</p>
                </div>
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

            {/* Lessons Grid */}
            {loading ? (
                <div style={styles.loadingRow}><span style={styles.spinner} /> Loading lessons...</div>
            ) : lessons.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📚</div>
                    <div style={styles.emptyTitle}>No lessons found</div>
                    <div style={styles.emptySubtitle}>No curriculum lessons have been authored yet.</div>
                </div>
            ) : (
                <div style={styles.card}>
                    <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    {renderSortHeader('Lesson', 'title')}
                                    {renderSortHeader('Category', 'category')}
                                    {renderSortHeader('Level', 'difficulty')}
                                    {renderSortHeader('Steps', 'steps')}
                                    {renderSortHeader('Quiz', 'quiz')}
                                    {renderSortHeader('Duration', 'estimatedMinutes')}
                                    {renderSortHeader('Attended', 'completionsCount')}
                                    {renderSortHeader('Created By', 'createdByName')}
                                    {renderSortHeader('Date', 'createdAt')}
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedLessons.map(l => (
                                    <tr key={l.lessonId} style={styles.tr}>
                                        <td style={styles.td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <span style={styles.emoji}>{l.emoji}</span>
                                                <div>
                                                    <div style={styles.lessonTitle}>{l.title}</div>
                                                    <div style={styles.lessonId}>{l.lessonId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{ ...styles.badge, ...(categoryColors[l.category] || {}) }}>{l.category}</span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{ ...styles.badge, ...(diffColors[l.difficulty] || {}) }}>{l.difficulty}</span>
                                        </td>
                                        <td style={styles.td}><span style={styles.numBadge}>📝 {l.steps?.length || 0}</span></td>
                                        <td style={styles.td}><span style={styles.numBadge}>❓ {l.quiz?.length || 0}</span></td>
                                        <td style={styles.td}><span style={{ fontSize: 12, color: '#94a3b8' }}>⏱ {l.estimatedMinutes}m</span></td>
                                        <td style={styles.td}>
                                            <button
                                                style={{
                                                    background: l.completionsCount > 0 ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.03)',
                                                    border: l.completionsCount > 0 ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,255,255,0.06)',
                                                    color: l.completionsCount > 0 ? '#10b981' : '#64748b',
                                                    borderRadius: 8,
                                                    padding: '4px 10px',
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    cursor: l.completionsCount > 0 ? 'pointer' : 'default',
                                                    fontFamily: 'inherit',
                                                    outline: 'none'
                                                }}
                                                onClick={() => l.completionsCount > 0 && setCompletionsModal(l)}
                                            >
                                                👥 {l.completionsCount || 0}
                                            </button>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.creatorBadge}>{l.createdByName || 'System'}</span>
                                        </td>
                                        <td style={styles.td}><span style={{ fontSize: 11, color: '#64748b' }}>{new Date(l.createdAt).toLocaleDateString('en-IN')}</span></td>
                                        <td style={styles.td}>
                                            <div style={styles.actions}>
                                                <button style={styles.viewBtn} onClick={() => setViewModal(l)}>👁️ View</button>
                                                <button style={styles.deleteBtn} onClick={() => setDeleteModal(l)}>🗑️ Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {viewModal && (
                <div style={styles.overlay} onClick={e => e.target === e.currentTarget && setViewModal(null)}>
                    <div style={{ ...styles.modal, maxWidth: 640 }}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>📖 {viewModal.title} Details</h3>
                            <button style={styles.closeBtn} onClick={() => setViewModal(null)}>✕</button>
                        </div>
                        <div style={{ padding: 24, maxHeight: '70vh', overflowY: 'auto' }}>
                            <div style={{ marginBottom: 20 }}>
                                <span style={{ ...styles.badge, ...(categoryColors[viewModal.category] || {}) }}>{viewModal.category}</span>
                                <span style={{ ...styles.badge, ...(diffColors[viewModal.difficulty] || {}), marginLeft: 8 }}>{viewModal.difficulty}</span>
                                <span style={{ fontSize: 13, color: '#94a3b8', marginLeft: 12 }}>⏱️ {viewModal.estimatedMinutes} mins</span>
                            </div>
                            <p style={{ color: '#cbd5e1', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>{viewModal.description}</p>
                            
                            <h4 style={{ color: '#a78bfa', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6, fontSize: 14, fontWeight: 700 }}>Lesson Steps</h4>
                            {(viewModal.steps || []).map((step, idx) => (
                                <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 10, marginBottom: 16, border: '1px solid rgba(255,255,255,0.04)' }}>
                                    <div style={{ fontWeight: 600, color: '#f1f5f9', marginBottom: 8, fontSize: 13 }}>Step {idx + 1}: {step.title}</div>
                                    <p style={{ color: '#cbd5e1', fontSize: 13, margin: '0 0 8px 0', lineHeight: 1.5 }}>{step.explanation}</p>
                                    <div style={{ fontStyle: 'italic', color: '#10b981', fontSize: 12 }}>Example: "{step.example}"</div>
                                    {step.tip && <div style={{ color: '#f59e0b', fontSize: 11, marginTop: 4 }}>💡 Tip: {step.tip}</div>}
                                </div>
                            ))}

                            <h4 style={{ color: '#a78bfa', marginTop: 24, marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6, fontSize: 14, fontWeight: 700 }}>Quiz Questions</h4>
                            {(viewModal.quiz || []).map((q, idx) => (
                                <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 10, marginBottom: 16, border: '1px solid rgba(255,255,255,0.04)' }}>
                                    <div style={{ fontWeight: 600, color: '#f1f5f9', marginBottom: 8, fontSize: 13 }}>Q{idx + 1}: {q.question}</div>
                                    {(q.options || []).map((opt, oIdx) => (
                                        <div key={oIdx} style={{ fontSize: 13, color: oIdx === q.correctIndex ? '#10b981' : '#cbd5e1', fontWeight: oIdx === q.correctIndex ? 600 : 400, marginLeft: 8, padding: '2px 0' }}>
                                            {oIdx === q.correctIndex ? '✓' : '•'} {opt} {oIdx === q.correctIndex && '(Correct)'}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Completions Modal */}
            {completionsModal && (
                <div style={styles.overlay} onClick={e => e.target === e.currentTarget && setCompletionsModal(null)}>
                    <div style={{ ...styles.modal, maxWidth: 540 }}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>👥 Attendees: {completionsModal.title}</h3>
                            <button style={styles.closeBtn} onClick={() => setCompletionsModal(null)}>✕</button>
                        </div>
                        <div style={{ padding: 24, maxHeight: '60vh', overflowY: 'auto' }}>
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

            {/* Delete Confirm */}
            {deleteModal && (
                <div style={styles.overlay} onClick={e => e.target === e.currentTarget && setDeleteModal(null)}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Delete Lesson</h3>
                            <button style={styles.closeBtn} onClick={() => setDeleteModal(null)}>✕</button>
                        </div>
                        <div style={{ padding: 24 }}>
                            <p style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.6 }}>
                                Delete <strong style={{ color: '#f1f5f9' }}>{deleteModal.emoji} {deleteModal.title}</strong>?<br />
                                User completion records for this lesson will remain but the lesson will be gone.
                            </p>
                            <div style={styles.modalActions}>
                                <button style={styles.cancelBtn} onClick={() => setDeleteModal(null)}>Cancel</button>
                                <button style={{ ...styles.primaryBtn, background: 'linear-gradient(135deg,#ef4444,#dc2626)' }} onClick={handleDelete} disabled={deleting}>
                                    {deleting ? 'Deleting...' : 'Yes, Delete'}
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
    toast: { position: 'fixed', top: 20, right: 28, background: 'rgba(16,185,129,0.9)', color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, zIndex: 9999 },
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    pageTitle: { fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: 0 },
    pageSubtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
    primaryBtn: { background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit' },
    filterRow: { display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' },
    searchWrap: { flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 16px' },
    searchInput: { background: 'transparent', border: 'none', color: '#e2e8f0', fontSize: 14, flex: 1, outline: 'none', fontFamily: 'inherit' },
    select: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 14px', color: '#e2e8f0', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', outline: 'none' },
    card: { background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' },
    loadingRow: { display: 'flex', alignItems: 'center', gap: 12, padding: 40, color: '#64748b', fontSize: 13, justifyContent: 'center' },
    spinner: { display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(124,58,237,0.2)', borderTop: '2px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    emptyState: { textAlign: 'center', padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
    emptyIcon: { fontSize: 48 },
    emptyTitle: { fontSize: 18, fontWeight: 700, color: '#f1f5f9' },
    emptySubtitle: { fontSize: 13, color: '#64748b', marginBottom: 8 },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '12px 14px', fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)' },
    tr: { borderBottom: '1px solid rgba(255,255,255,0.03)' },
    td: { padding: '13px 14px', fontSize: 13, color: '#cbd5e1', verticalAlign: 'middle' },
    emoji: { fontSize: 24, lineHeight: 1 },
    lessonTitle: { fontWeight: 600, color: '#f1f5f9', fontSize: 13 },
    lessonId: { fontSize: 10, color: '#475569', marginTop: 1 },
    badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
    numBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', fontSize: 11, fontWeight: 600 },
    creatorBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: 'rgba(124,58,237,0.1)', color: '#a78bfa', fontSize: 11, fontWeight: 600 },
    actions: { display: 'flex', gap: 6 },
    viewBtn: { background: 'rgba(74,155,155,0.12)', border: '1px solid rgba(74,155,155,0.25)', color: '#4A9B9B', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit' },
    deleteBtn: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: '#13132a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 24px 80px rgba(0,0,0,0.6)', boxSizing: 'border-box' },
    modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
    modalTitle: { fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: 0 },
    closeBtn: { background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18 },
    modalActions: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 },
    cancelBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit' },
};
