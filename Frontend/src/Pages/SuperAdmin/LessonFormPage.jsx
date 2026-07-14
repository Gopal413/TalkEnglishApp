import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    createLessonApi as createLessonSuperApi, 
    updateLessonApi as updateLessonSuperApi, 
    getLessonAdminApi as getLessonSuperApi 
} from '../../api/superAdminApi';
import { 
    createLessonApi as createLessonAdminApi, 
    updateLessonApi as updateLessonAdminApi, 
    getLessonAdminApi as getLessonAdminApi 
} from '../../api/adminApi';

const EMPTY_STEP = { title: '', explanation: '', example: '', tip: '' };
const EMPTY_QUIZ = { question: '', options: ['', '', '', ''], correctIndex: 0 };

export default function LessonFormPage({ isAdminMode = false }) {
    const { id } = useParams(); // if id exists → edit mode
    const navigate = useNavigate();
    const isEdit = !!id;

    const getLesson = isAdminMode ? getLessonAdminApi : getLessonSuperApi;
    const createLesson = isAdminMode ? createLessonAdminApi : createLessonSuperApi;
    const updateLesson = isAdminMode ? updateLessonAdminApi : updateLessonSuperApi;
    const redirectPath = isAdminMode ? '/admin/lessons' : '/superadmin/lessons';

    const [form, setForm] = useState({
        lessonId: '', title: '', category: 'grammar', difficulty: 'beginner',
        description: '', estimatedMinutes: 5, emoji: '📖', unlockAfter: 0,
        steps: [{ ...EMPTY_STEP }],
        quiz: [{ ...EMPTY_QUIZ, options: ['', '', '', ''] }]
    });
    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    useEffect(() => {
        if (isEdit) {
            getLesson(id)
                .then(d => {
                    const l = d.lesson;
                    setForm({
                        lessonId: l.lessonId,
                        title: l.title,
                        category: l.category,
                        difficulty: l.difficulty,
                        description: l.description,
                        estimatedMinutes: l.estimatedMinutes,
                        emoji: l.emoji,
                        unlockAfter: l.unlockAfter,
                        steps: l.steps?.length ? l.steps : [{ ...EMPTY_STEP }],
                        quiz: l.quiz?.length ? l.quiz : [{ ...EMPTY_QUIZ, options: ['', '', '', ''] }],
                    });
                })
                .catch(() => navigate(redirectPath))
                .finally(() => setLoading(false));
        }
    }, [id, isEdit, getLesson, redirectPath, navigate]);

    const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

    // Steps helpers
    const setStep = (i, key, val) => setForm(f => {
        const steps = [...f.steps];
        steps[i] = { ...steps[i], [key]: val };
        return { ...f, steps };
    });
    const addStep = () => setForm(f => ({ ...f, steps: [...f.steps, { ...EMPTY_STEP }] }));
    const removeStep = (i) => setForm(f => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }));

    // Quiz helpers
    const setQuiz = (i, key, val) => setForm(f => {
        const quiz = [...f.quiz];
        quiz[i] = { ...quiz[i], [key]: val };
        return { ...f, quiz };
    });
    const setOption = (qi, oi, val) => setForm(f => {
        const quiz = [...f.quiz];
        const options = [...quiz[qi].options];
        options[oi] = val;
        quiz[qi] = { ...quiz[qi], options };
        return { ...f, quiz };
    });
    const addQuiz = () => setForm(f => ({ ...f, quiz: [...f.quiz, { ...EMPTY_QUIZ, options: ['', '', '', ''] }] }));
    const removeQuiz = (i) => setForm(f => ({ ...f, quiz: f.quiz.filter((_, idx) => idx !== i) }));

    const handleSubmit = async () => {
        setError('');
        setSubmitting(true);
        try {
            if (isEdit) {
                await updateLesson(id, form);
                showToast('✅ Lesson updated!');
            } else {
                await createLesson(form);
                showToast('✅ Lesson created!');
            }
            setTimeout(() => navigate(redirectPath), 1200);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save lesson.');
        } finally { setSubmitting(false); }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><div style={styles.spinner} /></div>;

    return (
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
            {toast && <div style={styles.toast}>{toast}</div>}
            <button style={styles.backBtn} onClick={() => navigate(redirectPath)}>← Back to Lessons</button>

            <h1 style={styles.pageTitle}>{isEdit ? '✏️ Edit Lesson' : '➕ Create New Lesson'}</h1>

            {/* SECTION 1: Basic Info */}
            <Section title="📋 Basic Information">
                <div style={styles.grid2}>
                    <Field label="Lesson ID" required>
                        <input style={styles.input} disabled={isEdit} placeholder="lesson_001" value={form.lessonId} onChange={e => setField('lessonId', e.target.value)} />
                        {!isEdit && <div style={styles.hint}>Unique ID, cannot be changed later.</div>}
                    </Field>
                    <Field label="Emoji">
                        <input style={styles.input} placeholder="📖" value={form.emoji} onChange={e => setField('emoji', e.target.value)} maxLength={4} />
                    </Field>
                </div>
                <Field label="Title" required>
                    <input style={styles.input} placeholder="e.g. Present Tense Basics" value={form.title} onChange={e => setField('title', e.target.value)} />
                </Field>
                <Field label="Description" required>
                    <textarea style={styles.textarea} rows={3} placeholder="Brief description of what students will learn..." value={form.description} onChange={e => setField('description', e.target.value)} />
                </Field>
                <div style={styles.grid3}>
                    <Field label="Category" required>
                        <select style={styles.input} value={form.category} onChange={e => setField('category', e.target.value)}>
                            <option value="grammar">Grammar</option>
                            <option value="vocabulary">Vocabulary</option>
                            <option value="pronunciation">Pronunciation</option>
                            <option value="phrases">Phrases</option>
                        </select>
                    </Field>
                    <Field label="Difficulty" required>
                        <select style={styles.input} value={form.difficulty} onChange={e => setField('difficulty', e.target.value)}>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </Field>
                    <Field label="Duration (minutes)">
                        <input style={styles.input} type="number" min={1} max={60} value={form.estimatedMinutes} onChange={e => setField('estimatedMinutes', Number(e.target.value))} />
                    </Field>
                </div>
                <Field label="Unlock After (# beginner lessons completed, 0 = always unlocked)">
                    <input style={styles.input} type="number" min={0} max={50} value={form.unlockAfter} onChange={e => setField('unlockAfter', Number(e.target.value))} />
                </Field>
            </Section>

            {/* SECTION 2: Lesson Steps */}
            <Section title={`📝 Lesson Steps (${form.steps.length})`} action={<button style={styles.addBtn} onClick={addStep}>+ Add Step</button>}>
                {form.steps.map((step, i) => (
                    <div key={i} style={styles.stepCard}>
                        <div style={styles.stepHeader}>
                            <span style={styles.stepNum}>Step {i + 1}</span>
                            {form.steps.length > 1 && (
                                <button style={styles.removeBtn} onClick={() => removeStep(i)}>✕ Remove</button>
                            )}
                        </div>
                        <div style={styles.grid2}>
                            <Field label="Step Title" required>
                                <input style={styles.input} placeholder="e.g. Subject + Verb" value={step.title} onChange={e => setStep(i, 'title', e.target.value)} />
                            </Field>
                            <Field label="Tip (optional)">
                                <input style={styles.input} placeholder="Quick grammar tip..." value={step.tip || ''} onChange={e => setStep(i, 'tip', e.target.value)} />
                            </Field>
                        </div>
                        <Field label="Explanation" required>
                            <textarea style={styles.textarea} rows={2} placeholder="Explain the concept..." value={step.explanation} onChange={e => setStep(i, 'explanation', e.target.value)} />
                        </Field>
                        <Field label="Example Sentence" required>
                            <input style={styles.input} placeholder='e.g. "She reads every morning."' value={step.example} onChange={e => setStep(i, 'example', e.target.value)} />
                        </Field>
                    </div>
                ))}
            </Section>

            {/* SECTION 3: Quiz */}
            <Section title={`❓ Quiz Questions (${form.quiz.length})`} action={<button style={styles.addBtn} onClick={addQuiz}>+ Add Question</button>}>
                {form.quiz.map((q, qi) => (
                    <div key={qi} style={styles.stepCard}>
                        <div style={styles.stepHeader}>
                            <span style={styles.stepNum}>Question {qi + 1}</span>
                            {form.quiz.length > 1 && (
                                <button style={styles.removeBtn} onClick={() => removeQuiz(qi)}>✕ Remove</button>
                            )}
                        </div>
                        <Field label="Question" required>
                            <input style={styles.input} placeholder="e.g. Which sentence uses present tense correctly?" value={q.question} onChange={e => setQuiz(qi, 'question', e.target.value)} />
                        </Field>
                        <div style={styles.optionsLabel}>Answer Options (select the correct one)</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {q.options.map((opt, oi) => (
                                <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <button
                                        style={{ ...styles.correctDot, ...(q.correctIndex === oi ? styles.correctDotActive : {}) }}
                                        onClick={() => setQuiz(qi, 'correctIndex', oi)}
                                        title="Mark as correct"
                                    >
                                        {q.correctIndex === oi ? '✓' : oi + 1}
                                    </button>
                                    <input
                                        style={{ ...styles.input, flex: 1 }}
                                        placeholder={`Option ${oi + 1}`}
                                        value={opt}
                                        onChange={e => setOption(qi, oi, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                        <div style={styles.correctHint}>✅ Option {q.correctIndex + 1} is the correct answer</div>
                    </div>
                ))}
            </Section>

            {/* Submit */}
            {error && <div style={styles.formError}>{error}</div>}
            <div style={styles.submitRow}>
                <button style={styles.cancelBtn} onClick={() => navigate('/superadmin/lessons')}>Cancel</button>
                <button style={styles.primaryBtn} onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Saving...' : isEdit ? '💾 Save Changes' : '🚀 Create Lesson'}
                </button>
            </div>
        </div>
    );
}

function Section({ title, children, action }) {
    return (
        <div style={styles.section}>
            <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>{title}</h2>
                {action}
            </div>
            {children}
        </div>
    );
}

function Field({ label, children, required }) {
    return (
        <div style={{ marginBottom: 14 }}>
            <label style={styles.label}>{label}{required && <span style={{ color: '#f87171' }}> *</span>}</label>
            {children}
        </div>
    );
}

const styles = {
    spinner: { width: 40, height: 40, border: '3px solid rgba(124,58,237,0.2)', borderTop: '3px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    toast: { position: 'fixed', top: 20, right: 28, background: 'rgba(16,185,129,0.9)', color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, zIndex: 9999 },
    backBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', marginBottom: 20 },
    pageTitle: { fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: '0 0 24px', letterSpacing: '-0.5px' },
    section: { background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, marginBottom: 20 },
    sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    sectionTitle: { fontSize: 15, fontWeight: 700, color: '#e2e8f0', margin: 0 },
    addBtn: { background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', color: '#a78bfa', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 12, fontFamily: 'inherit' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
    grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 },
    label: { display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 },
    input: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' },
    textarea: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', resize: 'vertical' },
    hint: { fontSize: 10, color: '#475569', marginTop: 4 },
    stepCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 18, marginBottom: 12 },
    stepHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    stepNum: { fontSize: 13, fontWeight: 700, color: '#a78bfa', background: 'rgba(124,58,237,0.12)', padding: '3px 12px', borderRadius: 20 },
    removeBtn: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', borderRadius: 8, padding: '4px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit' },
    optionsLabel: { fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10, marginTop: 4 },
    correctDot: { width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0, fontFamily: 'inherit', transition: 'all 0.2s' },
    correctDotActive: { background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', color: '#10b981' },
    correctHint: { fontSize: 11, color: '#10b981', marginTop: 10, fontWeight: 600 },
    formError: { color: '#f87171', fontSize: 13, marginBottom: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, padding: '12px 16px' },
    submitRow: { display: 'flex', gap: 12, justifyContent: 'flex-end', paddingBottom: 40 },
    cancelBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: 10, padding: '12px 24px', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'inherit' },
    primaryBtn: { background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' },
};
