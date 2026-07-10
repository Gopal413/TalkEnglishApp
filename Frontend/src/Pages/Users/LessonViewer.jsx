import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Button,
  CircularProgress, LinearProgress, Chip, IconButton, Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { getLessonByIdApi, completeLessonApi } from '../../api/authApi';

const TEAL = '#4A9B9B';
const CORAL = '#E07B6A';

const DIFFICULTY_STYLES = {
  beginner: { color: '#27AE60', bg: '#E8F8F1' },
  intermediate: { color: '#F39C12', bg: '#FEF9E7' },
  advanced: { color: '#E74C3C', bg: '#FDEDEC' },
};

// ── TTS Speaker ──────────────────────────────────────────────────────────────
function speakText(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.92;
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural')));
  if (preferred) utterance.voice = preferred;
  window.speechSynthesis.speak(utterance);
}

export default function LessonViewer() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Step navigation
  const [currentStep, setCurrentStep] = useState(0); // 0 to steps.length-1, then quiz

  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getLessonByIdApi(lessonId);
        setLesson(data.lesson);
        setIsCompleted(data.isCompleted);
        setCompletionData(data.completionData);
      } catch (err) {
        console.error('Failed to load lesson:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [lessonId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '70vh', gap: 2 }}>
        <CircularProgress sx={{ color: TEAL }} />
        <Typography variant="body2" color="text.secondary">Loading lesson...</Typography>
      </Box>
    );
  }

  if (!lesson) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h6" color="error">Lesson not found.</Typography>
        <Button onClick={() => navigate('/lessons')} sx={{ mt: 2 }}>Back to Lessons</Button>
      </Container>
    );
  }

  const totalSteps = lesson.steps.length;
  const diff = DIFFICULTY_STYLES[lesson.difficulty] || DIFFICULTY_STYLES.beginner;

  // ── Progress percent ───────────────────────────────────────────────────────
  const progressPct = showQuiz ? 100 : Math.round(((currentStep + 1) / totalSteps) * 100);

  // ── Quiz Handlers ──────────────────────────────────────────────────────────
  const handleSelectAnswer = (qIdx, optIdx) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitQuiz = async () => {
    let score = 0;
    lesson.quiz.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctIndex) score++;
    });
    setQuizScore(score);
    setQuizSubmitted(true);

    if (!isCompleted) {
      setSaving(true);
      try {
        await completeLessonApi(lessonId, score, lesson.quiz.length);
        setIsCompleted(true);
        setCompletionData({ score, total: lesson.quiz.length, percentage: Math.round((score / lesson.quiz.length) * 100) });
      } catch (err) {
        console.error('Failed to save completion:', err);
      } finally {
        setSaving(false);
      }
    }
  };

  const allAnswered = Object.keys(selectedAnswers).length === lesson.quiz.length;

  // ── Score Grade ────────────────────────────────────────────────────────────
  const getGrade = (pct) => {
    if (pct >= 90) return { grade: 'A+', color: '#27AE60', msg: 'Excellent! 🎉' };
    if (pct >= 80) return { grade: 'A', color: '#27AE60', msg: 'Very Good! 👏' };
    if (pct >= 60) return { grade: 'B', color: '#F39C12', msg: 'Good job! 👍' };
    return { grade: 'C', color: CORAL, msg: 'Keep practicing! 💪' };
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ bgcolor: '#F7F9FC', minHeight: '100vh', pb: 10 }}>
      {/* Top Progress Bar + Header */}
      <Box sx={{ background: 'linear-gradient(135deg, #1e3c72, #2a5298)', pt: 4, pb: 3, px: 2 }}>
        <Container maxWidth="sm">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <IconButton onClick={() => navigate('/lessons')} sx={{ color: '#fff', p: 0.5 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>Lessons Library</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Typography sx={{ fontSize: '28px' }}>{lesson.emoji}</Typography>
            <Box>
              <Typography variant="h6" fontWeight="800" color="#fff" sx={{ lineHeight: 1.2 }}>{lesson.title}</Typography>
              <Chip label={lesson.difficulty} size="small" sx={{ bgcolor: diff.bg, color: diff.color, fontWeight: 'bold', fontSize: '10px', height: '18px', mt: 0.5 }} />
            </Box>
          </Box>

          {/* Step progress bar */}
          <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
              {showQuiz ? 'Quiz' : `Step ${currentStep + 1} of ${totalSteps}`}
            </Typography>
            <Typography variant="caption" sx={{ color: '#fff', fontWeight: 'bold' }}>{progressPct}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPct}
            sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: CORAL, borderRadius: 3 } }}
          />
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ mt: 2, px: { xs: 2, sm: 3 } }}>

        {/* ── STEP VIEW ── */}
        {!showQuiz && (
          <Box>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', bgcolor: '#fff', mb: 2 }}>
              {/* Step title */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#1e3c72', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Typography variant="caption" sx={{ color: '#fff', fontWeight: 'bold', fontSize: '11px' }}>{currentStep + 1}</Typography>
                </Box>
                <Typography variant="body1" fontWeight="800" color="#1a1a2e">{lesson.steps[currentStep].title}</Typography>
              </Box>

              {/* Explanation */}
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 2.5 }}>
                {lesson.steps[currentStep].explanation}
              </Typography>

              <Divider sx={{ mb: 2 }} />

              {/* Example sentence with TTS button */}
              <Box sx={{ p: 2, bgcolor: '#F0F4FF', borderRadius: 2.5, border: '1px solid #C7D2FE', mb: lesson.steps[currentStep].tip ? 2 : 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6366F1', fontWeight: 'bold', display: 'block', mb: 0.5 }}>EXAMPLE</Typography>
                    <Typography variant="body2" sx={{ color: '#1a1a2e', fontStyle: 'italic', lineHeight: 1.7, fontWeight: '500' }}>
                      "{lesson.steps[currentStep].example}"
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => speakText(lesson.steps[currentStep].example)}
                    sx={{ bgcolor: '#fff', border: '1px solid #C7D2FE', flexShrink: 0, '&:hover': { bgcolor: '#EEF2FF' } }}
                  >
                    <VolumeUpIcon sx={{ fontSize: 16, color: '#6366F1' }} />
                  </IconButton>
                </Box>
              </Box>

              {/* Tip */}
              {lesson.steps[currentStep].tip && (
                <Box sx={{ p: 2, bgcolor: '#FFFBEB', borderRadius: 2.5, border: '1px solid #FDE68A', mt: 2 }}>
                  <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 'bold', display: 'block', mb: 0.5 }}>💡 TIP</Typography>
                  <Typography variant="body2" sx={{ color: '#92400E', lineHeight: 1.7 }}>
                    {lesson.steps[currentStep].tip}
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Navigation buttons */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => setCurrentStep(s => s - 1)}
                disabled={currentStep === 0}
                sx={{ flex: 1, borderRadius: 2.5, textTransform: 'none', fontWeight: 'bold', py: 1.2 }}
              >
                Previous
              </Button>
              {currentStep < totalSteps - 1 ? (
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => setCurrentStep(s => s + 1)}
                  sx={{ flex: 2, borderRadius: 2.5, textTransform: 'none', fontWeight: 'bold', py: 1.2, bgcolor: '#1e3c72', '&:hover': { bgcolor: '#2a5298' } }}
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => setShowQuiz(true)}
                  sx={{ flex: 2, borderRadius: 2.5, textTransform: 'none', fontWeight: 'bold', py: 1.2, bgcolor: CORAL, '&:hover': { bgcolor: '#C96A59' } }}
                >
                  {isCompleted ? 'View Quiz (Done)' : 'Take Quiz 📝'}
                </Button>
              )}
            </Box>
          </Box>
        )}

        {/* ── QUIZ VIEW ── */}
        {showQuiz && (
          <Box>
            {/* Already completed notice */}
            {isCompleted && completionData && !quizSubmitted && (
              <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 3, bgcolor: '#E8F8F1', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckCircleIcon sx={{ color: '#27AE60' }} />
                <Box>
                  <Typography variant="body2" fontWeight="700" color="#065F46">Quiz already completed!</Typography>
                  <Typography variant="caption" color="#065F46">
                    Your score: {completionData.score}/{completionData.total} ({completionData.percentage}%) — view only
                  </Typography>
                </Box>
              </Paper>
            )}

            <Typography variant="body1" fontWeight="800" color="#1a1a2e" sx={{ mb: 2 }}>
              📝 Quiz — {lesson.title}
            </Typography>

            {lesson.quiz.map((q, qIdx) => (
              <Paper key={qIdx} elevation={0} sx={{ p: 2.5, borderRadius: 3, mb: 2, border: '1px solid rgba(0,0,0,0.06)', bgcolor: '#fff' }}>
                <Typography variant="body2" fontWeight="700" color="#1a1a2e" sx={{ mb: 1.5 }}>
                  {qIdx + 1}. {q.question}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[qIdx] === optIdx;
                    const isCorrect = optIdx === q.correctIndex;
                    let bgColor = '#F9FAFB';
                    let borderColor = 'rgba(0,0,0,0.1)';
                    let textColor = '#374151';

                    if (quizSubmitted) {
                      if (isCorrect) { bgColor = '#E8F8F1'; borderColor = '#27AE60'; textColor = '#065F46'; }
                      else if (isSelected && !isCorrect) { bgColor = '#FDEDEC'; borderColor = CORAL; textColor = '#7F1D1D'; }
                    } else if (isSelected) {
                      bgColor = '#EEF2FF'; borderColor = '#6366F1'; textColor = '#3730A3';
                    }

                    return (
                      <Box
                        key={optIdx}
                        onClick={() => !isCompleted && handleSelectAnswer(qIdx, optIdx)}
                        sx={{
                          p: 1.5, borderRadius: 2, border: `1.5px solid ${borderColor}`,
                          bgcolor: bgColor, cursor: isCompleted ? 'default' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: 1.5,
                          transition: 'all 0.15s ease',
                          '&:hover': !isCompleted && !quizSubmitted ? { borderColor: '#6366F1', bgcolor: '#EEF2FF' } : {}
                        }}
                      >
                        <Box sx={{
                          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                          bgcolor: isSelected ? (quizSubmitted ? (isCorrect ? '#27AE60' : CORAL) : '#6366F1') : '#E5E7EB',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {quizSubmitted && isCorrect && <CheckCircleIcon sx={{ fontSize: 14, color: '#fff' }} />}
                          {quizSubmitted && isSelected && !isCorrect && <CancelIcon sx={{ fontSize: 14, color: '#fff' }} />}
                          {!quizSubmitted && isSelected && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#fff' }} />}
                        </Box>
                        <Typography variant="body2" sx={{ color: textColor, fontWeight: isSelected || (quizSubmitted && isCorrect) ? 'bold' : 'normal' }}>
                          {opt}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            ))}

            {/* Submit / Result */}
            {!quizSubmitted && !isCompleted && (
              <Button
                variant="contained"
                fullWidth
                disabled={!allAnswered || saving}
                onClick={handleSubmitQuiz}
                sx={{ py: 1.5, borderRadius: 2.5, fontWeight: 'bold', textTransform: 'none', fontSize: '15px', bgcolor: '#1e3c72', '&:hover': { bgcolor: '#2a5298' } }}
              >
                {saving ? <CircularProgress size={22} color="inherit" /> : `Submit Quiz (${Object.keys(selectedAnswers).length}/${lesson.quiz.length} answered)`}
              </Button>
            )}

            {/* Score Card */}
            {(quizSubmitted || isCompleted) && completionData && (
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, textAlign: 'center', bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.06)', mt: 1 }}>
                {(() => {
                  const pct = quizSubmitted
                    ? Math.round((quizScore / lesson.quiz.length) * 100)
                    : completionData.percentage;
                  const g = getGrade(pct);
                  const sc = quizSubmitted ? quizScore : completionData.score;
                  return (
                    <>
                      <EmojiEventsIcon sx={{ fontSize: 40, color: '#F39C12', mb: 1 }} />
                      <Typography variant="h4" fontWeight="900" sx={{ color: g.color, mb: 0.5 }}>{g.grade}</Typography>
                      <Typography variant="body1" fontWeight="700" color="#1a1a2e" sx={{ mb: 0.5 }}>{g.msg}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        You scored {sc} out of {lesson.quiz.length} ({pct}%)
                      </Typography>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => navigate('/lessons')}
                        sx={{ py: 1.2, borderRadius: 2.5, textTransform: 'none', fontWeight: 'bold', bgcolor: TEAL, '&:hover': { bgcolor: '#3a8a8a' } }}
                      >
                        Back to Lessons Library →
                      </Button>
                    </>
                  );
                })()}
              </Paper>
            )}

            <Button
              variant="text"
              startIcon={<ArrowBackIcon />}
              onClick={() => { setShowQuiz(false); setCurrentStep(totalSteps - 1); }}
              sx={{ mt: 1.5, textTransform: 'none', color: 'text.secondary', display: 'block', mx: 'auto' }}
            >
              Back to last step
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}
