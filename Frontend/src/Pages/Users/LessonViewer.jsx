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
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: '700' }}>Lessons Library</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8, mb: 2.5 }}>
            <Typography sx={{ fontSize: '32px' }}>{lesson.emoji}</Typography>
            <Box>
              <Typography variant="h6" fontWeight="900" color="#fff" sx={{ lineHeight: 1.2 }}>{lesson.title}</Typography>
              <Chip label={lesson.difficulty} size="small" sx={{ bgcolor: diff.bg, color: diff.color, fontWeight: '800', fontSize: '10px', height: '18px', mt: 0.5, borderRadius: '6px' }} />
            </Box>
          </Box>

          {/* Step progress bar */}
          <Box sx={{ mb: 0.8, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: '700' }}>
              {showQuiz ? 'Quiz' : `Step ${currentStep + 1} of ${totalSteps}`}
            </Typography>
            <Typography variant="caption" sx={{ color: '#fff', fontWeight: '900' }}>{progressPct}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPct}
            sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: CORAL, borderRadius: 4 } }}
          />
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ mt: 3.5, px: { xs: 2.5, sm: 3 } }}>

        {/* ── STEP VIEW ── */}
        {!showQuiz && (
          <Box>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3.5, 
                borderRadius: '24px', 
                border: '1px solid rgba(0,0,0,0.04)', 
                bgcolor: '#fff', 
                mb: 3,
                boxShadow: '0 8px 30px rgba(0,0,0,0.01)'
              }}
            >
              {/* Step title */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: '#205E5E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Typography variant="caption" sx={{ color: '#fff', fontWeight: '800', fontSize: '11px' }}>{currentStep + 1}</Typography>
                </Box>
                <Typography variant="body1" fontWeight="800" color="#1a1a2e">{lesson.steps[currentStep].title}</Typography>
              </Box>

              {/* Explanation */}
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 3, fontSize: '13.5px', fontWeight: '500' }}>
                {lesson.steps[currentStep].explanation}
              </Typography>

              <Divider sx={{ mb: 2.5 }} />

              {/* Example sentence with TTS button */}
              <Box sx={{ p: 2.5, bgcolor: '#F0F4FF', borderRadius: '16px', border: '1px solid #C7D2FE', mb: lesson.steps[currentStep].tip ? 2.5 : 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" sx={{ color: '#6366F1', fontWeight: '800', display: 'block', mb: 0.8, letterSpacing: '0.5px' }}>EXAMPLE</Typography>
                    <Typography variant="body2" sx={{ color: '#1E293B', fontStyle: 'italic', lineHeight: 1.7, fontWeight: '600', fontSize: '14px' }}>
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
                <Box sx={{ p: 2.5, bgcolor: '#FFFDF0', borderRadius: '16px', border: '1px solid #FFE082', mt: 2.5 }}>
                  <Typography variant="caption" sx={{ color: '#D97706', fontWeight: '800', display: 'block', mb: 0.8, letterSpacing: '0.5px' }}>💡 TIP</Typography>
                  <Typography variant="body2" sx={{ color: '#92400E', lineHeight: 1.7, fontSize: '13.5px', fontWeight: '500' }}>
                    {lesson.steps[currentStep].tip}
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Navigation buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => setCurrentStep(s => s - 1)}
                disabled={currentStep === 0}
                sx={{ 
                  flex: 1, 
                  borderRadius: '24px', 
                  textTransform: 'none', 
                  fontWeight: '700', 
                  py: 1.4,
                  borderWidth: '1.5px',
                  '&:hover': { borderWidth: '1.5px' }
                }}
              >
                Previous
              </Button>
              {currentStep < totalSteps - 1 ? (
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => setCurrentStep(s => s + 1)}
                  sx={{ 
                    flex: 2, 
                    borderRadius: '24px', 
                    textTransform: 'none', 
                    fontWeight: '700', 
                    py: 1.4, 
                    bgcolor: '#205E5E', 
                    '&:hover': { bgcolor: '#164343' },
                    boxShadow: '0 4px 14px rgba(32, 94, 94, 0.25)'
                  }}
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => setShowQuiz(true)}
                  sx={{ 
                    flex: 2, 
                    borderRadius: '24px', 
                    textTransform: 'none', 
                    fontWeight: '700', 
                    py: 1.4, 
                    bgcolor: CORAL, 
                    '&:hover': { bgcolor: '#C96A59' },
                    boxShadow: '0 4px 14px rgba(224, 123, 106, 0.25)'
                  }}
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
              <Paper elevation={0} sx={{ p: 2.2, mb: 3, borderRadius: '16px', bgcolor: '#E8F8F1', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', gap: 1.8 }}>
                <CheckCircleIcon sx={{ color: '#27AE60' }} />
                <Box>
                  <Typography variant="body2" fontWeight="800" color="#065F46">Quiz already completed!</Typography>
                  <Typography variant="caption" color="#065F46" sx={{ fontWeight: '500' }}>
                    Your score: {completionData.score}/{completionData.total} ({completionData.percentage}%) — view only
                  </Typography>
                </Box>
              </Paper>
            )}

            <Typography variant="h6" fontWeight="900" color="#1a1a2e" sx={{ mb: 2.5 }}>
              📝 Quiz — {lesson.title}
            </Typography>

            {lesson.quiz.map((q, qIdx) => (
              <Paper 
                key={qIdx} 
                elevation={0} 
                sx={{ 
                  p: 3.5, 
                  borderRadius: '24px', 
                  mb: 3, 
                  border: '1px solid rgba(0,0,0,0.04)', 
                  bgcolor: '#fff',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.01)'
                }}
              >
                <Typography variant="body2" fontWeight="800" color="#1a1a2e" sx={{ mb: 2, fontSize: '14.5px' }}>
                  {qIdx + 1}. {q.question}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[qIdx] === optIdx;
                    const isCorrect = optIdx === q.correctIndex;
                    let bgColor = '#F8FAFC';
                    let borderColor = 'rgba(0,0,0,0.05)';
                    let textColor = '#475569';

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
                          p: 1.8, 
                          borderRadius: '12px', 
                          border: `1.5px solid ${borderColor}`,
                          bgcolor: bgColor, 
                          cursor: isCompleted ? 'default' : 'pointer',
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': !isCompleted && !quizSubmitted ? { borderColor: '#6366F1', bgcolor: '#EEF2FF' } : {}
                        }}
                      >
                        <Box sx={{
                          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                          bgcolor: isSelected ? (quizSubmitted ? (isCorrect ? '#27AE60' : CORAL) : '#6366F1') : '#E2E8F0',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {quizSubmitted && isCorrect && <CheckCircleIcon sx={{ fontSize: 14, color: '#fff' }} />}
                          {quizSubmitted && isSelected && !isCorrect && <CancelIcon sx={{ fontSize: 14, color: '#fff' }} />}
                          {!quizSubmitted && isSelected && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#fff' }} />}
                        </Box>
                        <Typography variant="body2" sx={{ color: textColor, fontWeight: isSelected || (quizSubmitted && isCorrect) ? '700' : '500', fontSize: '13.5px' }}>
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
                sx={{ 
                  py: 1.6, 
                  borderRadius: '24px', 
                  fontWeight: '700', 
                  textTransform: 'none', 
                  fontSize: '15px', 
                  bgcolor: '#205E5E', 
                  '&:hover': { bgcolor: '#164343' },
                  boxShadow: '0 4px 14px rgba(32, 94, 94, 0.25)'
                }}
              >
                {saving ? <CircularProgress size={22} color="inherit" /> : `Submit Quiz (${Object.keys(selectedAnswers).length}/${lesson.quiz.length} answered)`}
              </Button>
            )}

            {/* Score Card */}
            {(quizSubmitted || isCompleted) && completionData && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  borderRadius: '24px', 
                  textAlign: 'center', 
                  bgcolor: '#fff', 
                  border: '1px solid rgba(0,0,0,0.04)', 
                  mt: 1,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.01)'
                }}
              >
                {(() => {
                  const pct = quizSubmitted
                    ? Math.round((quizScore / lesson.quiz.length) * 100)
                    : completionData.percentage;
                  const g = getGrade(pct);
                  const sc = quizSubmitted ? quizScore : completionData.score;
                  return (
                    <>
                      <EmojiEventsIcon sx={{ fontSize: 44, color: '#F39C12', mb: 1.5 }} />
                      <Typography variant="h4" fontWeight="900" sx={{ color: g.color, mb: 0.8 }}>{g.grade}</Typography>
                      <Typography variant="body1" fontWeight="800" color="#1a1a2e" sx={{ mb: 0.8 }}>{g.msg}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontWeight: '500' }}>
                        You scored {sc} out of {lesson.quiz.length} ({pct}%)
                      </Typography>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => navigate('/lessons')}
                        sx={{ 
                          py: 1.4, 
                          borderRadius: '24px', 
                          textTransform: 'none', 
                          fontWeight: '700', 
                          bgcolor: TEAL, 
                          '&:hover': { bgcolor: '#3a8a8a' },
                          boxShadow: '0 4px 12px rgba(74, 155, 155, 0.25)'
                        }}
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
              sx={{ mt: 2, textTransform: 'none', color: 'text.secondary', display: 'block', mx: 'auto', fontWeight: '700' }}
            >
              Back to last step
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}
