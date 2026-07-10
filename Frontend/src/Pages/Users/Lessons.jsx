import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Paper, Chip,
  CircularProgress, Tab, Tabs, LinearProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { getAllLessonsApi } from '../../api/authApi';

const TEAL = '#4A9B9B';
const CORAL = '#E07B6A';

const CATEGORY_TABS = ['all', 'grammar', 'vocabulary', 'pronunciation', 'phrases'];
const CATEGORY_LABELS = {
  all: 'All',
  grammar: 'Grammar ✏️',
  vocabulary: 'Vocabulary 📖',
  pronunciation: 'Pronunciation 👅',
  phrases: 'Phrases 💬'
};

const DIFFICULTY_STYLES = {
  beginner:     { color: '#27AE60', bg: '#E8F8F1', label: 'Beginner' },
  intermediate: { color: '#F39C12', bg: '#FEF9E7', label: 'Intermediate' },
  advanced:     { color: '#E74C3C', bg: '#FDEDEC', label: 'Advanced' },
};

export default function Lessons() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getAllLessonsApi();
        setLessons(data.lessons || []);
        setTotalCompleted(data.totalCompleted || 0);
      } catch (err) {
        console.error('Failed to load lessons:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = activeTab === 0
    ? lessons
    : lessons.filter(l => l.category === CATEGORY_TABS[activeTab]);

  const totalLessons = lessons.length;
  const progressPct = totalLessons > 0
    ? Math.round((totalCompleted / totalLessons) * 100)
    : 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '70vh', gap: 2 }}>
        <CircularProgress sx={{ color: TEAL }} />
        <Typography variant="body2" color="text.secondary">Loading lessons...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F7F9FC', minHeight: '100vh', pb: 10 }}>

      {/* ── Hero Header ── */}
      <Box sx={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', pt: 5, pb: 5, px: 3, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
        <Container maxWidth="md">
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', mb: 0.5 }}>English Learning</Typography>
          <Typography variant="h5" fontWeight="800" color="#fff" sx={{ mb: 0.5 }}>Lessons Library 📚</Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>
            Structured lessons to build your grammar, vocabulary &amp; pronunciation
          </Typography>

          {/* Overall Progress */}
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.12)', mt: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 'bold' }}>
                Overall Progress
              </Typography>
              <Typography variant="caption" sx={{ color: '#fff', fontWeight: '800' }}>
                {totalCompleted}/{totalLessons} completed
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPct}
              sx={{
                height: 7, borderRadius: 4,
                bgcolor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': { bgcolor: CORAL, borderRadius: 4 }
              }}
            />
          </Paper>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ mt: 2, px: { xs: 2, sm: 3 } }}>

        {/* ── Category Filter Tabs ── */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, bgcolor: '#fff', borderRadius: '12px 12px 0 0', px: 1 }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 'bold', fontSize: '13px', minWidth: { xs: 70, sm: 'auto' } },
              '& .Mui-selected': { color: `${TEAL} !important` },
              '& .MuiTabs-indicator': { bgcolor: TEAL }
            }}
          >
            {CATEGORY_TABS.map(cat => (
              <Tab key={cat} label={CATEGORY_LABELS[cat]} />
            ))}
          </Tabs>
        </Box>

        {/* ── Stats Row (only when lessons exist) ── */}
        {totalLessons > 0 && (
          <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
            {[
              { label: 'Total Lessons', value: totalLessons,                    color: '#1e3c72', bg: '#EEF2FF' },
              { label: 'Completed',     value: totalCompleted,                  color: '#27AE60', bg: '#E8F8F1' },
              { label: 'Remaining',     value: totalLessons - totalCompleted,   color: CORAL,     bg: '#FDF0EE' },
            ].map(s => (
              <Paper key={s.label} elevation={0} sx={{ p: 1.5, borderRadius: 2.5, bgcolor: s.bg, flex: 1, minWidth: 80, textAlign: 'center', border: '1px solid rgba(0,0,0,0.04)' }}>
                <Typography variant="h6" fontWeight="900" sx={{ color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>{s.label}</Typography>
              </Paper>
            ))}
          </Box>
        )}

        {/* ── Empty State — no lessons yet ── */}
        {totalLessons === 0 && (
          <Paper elevation={0} sx={{ p: 5, borderRadius: 3, textAlign: 'center', bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
            <Box sx={{ fontSize: '54px', mb: 2 }}>📚</Box>
            <Typography variant="h6" fontWeight="800" color="#1a1a2e" sx={{ mb: 1 }}>
              Lessons Coming Soon
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320, mx: 'auto', lineHeight: 1.7 }}>
              Our admin team is preparing structured lessons for you. Check back soon — Grammar, Vocabulary, Pronunciation &amp; Phrase lessons will appear here.
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <MenuBookIcon sx={{ fontSize: 32, color: '#D1D5DB' }} />
            </Box>
          </Paper>
        )}

        {/* ── Filtered Empty State (category has no lessons) ── */}
        {totalLessons > 0 && filtered.length === 0 && (
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, textAlign: 'center', bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.05)' }}>
            <Typography variant="body2" color="text.secondary">
              No lessons in this category yet.
            </Typography>
          </Paper>
        )}

        {/* ── Lesson Cards Grid ── */}
        {filtered.length > 0 && (
          <Grid container spacing={2}>
            {filtered.map(lesson => {
              const diff = DIFFICULTY_STYLES[lesson.difficulty] || DIFFICULTY_STYLES.beginner;
              return (
                <Grid item xs={12} sm={6} key={lesson.lessonId}>
                  <Paper
                    elevation={0}
                    onClick={() => !lesson.isLocked && navigate(`/lessons/${lesson.lessonId}`)}
                    sx={{
                      p: 2.5, borderRadius: 3,
                      border: '1px solid rgba(0,0,0,0.06)',
                      bgcolor: lesson.isLocked ? '#F9FAFB' : '#fff',
                      cursor: lesson.isLocked ? 'not-allowed' : 'pointer',
                      opacity: lesson.isLocked ? 0.65 : 1,
                      transition: 'all 0.18s ease',
                      '&:hover': !lesson.isLocked
                        ? { transform: 'translateY(-2px)', boxShadow: '0 6px 24px rgba(0,0,0,0.08)' }
                        : {},
                      position: 'relative', overflow: 'hidden'
                    }}
                  >
                    {/* Completed green left stripe */}
                    {lesson.isCompleted && (
                      <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: '#27AE60', borderRadius: '3px 0 0 3px' }} />
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      {/* Emoji Icon */}
                      <Box sx={{
                        width: 48, height: 48, borderRadius: 2.5, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: lesson.isCompleted ? '#E8F8F1' : lesson.isLocked ? '#F3F4F6' : '#EEF2FF',
                        fontSize: '22px'
                      }}>
                        {lesson.isLocked ? '🔒' : lesson.emoji}
                      </Box>

                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight="700" sx={{ color: '#1a1a2e', lineHeight: 1.3, pr: 1 }}>
                            {lesson.title}
                          </Typography>
                          {lesson.isCompleted
                            ? <CheckCircleIcon sx={{ color: '#27AE60', fontSize: 18, flexShrink: 0 }} />
                            : lesson.isLocked
                            ? <LockIcon sx={{ color: '#9CA3AF', fontSize: 16, flexShrink: 0 }} />
                            : <ArrowForwardIosIcon sx={{ color: '#D1D5DB', fontSize: 12, flexShrink: 0, mt: 0.5 }} />
                          }
                        </Box>

                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontSize: '11px', lineHeight: 1.4 }}>
                          {lesson.description}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <Chip
                            label={diff.label}
                            size="small"
                            sx={{ bgcolor: diff.bg, color: diff.color, fontWeight: 'bold', fontSize: '10px', height: '20px' }}
                          />
                          <Chip
                            label={lesson.category}
                            size="small"
                            sx={{ bgcolor: '#EEF2FF', color: '#1e3c72', fontWeight: '600', fontSize: '10px', height: '20px', textTransform: 'capitalize' }}
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, ml: 'auto' }}>
                            <AccessTimeIcon sx={{ fontSize: 11, color: '#9CA3AF' }} />
                            <Typography variant="caption" sx={{ fontSize: '10px', color: '#9CA3AF' }}>
                              ~{lesson.estimatedMinutes} min
                            </Typography>
                          </Box>
                        </Box>

                        {/* Show quiz score if completed */}
                        {lesson.isCompleted && lesson.completionData && (
                          <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ color: '#27AE60', fontWeight: 'bold', fontSize: '11px' }}>
                              Quiz: {lesson.completionData.score}/{lesson.completionData.total} ({lesson.completionData.percentage}%)
                            </Typography>
                          </Box>
                        )}

                        {lesson.isLocked && (
                          <Typography variant="caption" sx={{ color: '#F39C12', fontSize: '10px', display: 'block', mt: 0.5 }}>
                            🔒 Complete beginner lessons to unlock
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
