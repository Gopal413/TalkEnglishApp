import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Paper,
  CircularProgress, Chip, LinearProgress, Avatar
} from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import { getUserProgress } from '../../api/authApi';

const TEAL = '#4A9B9B';
const CORAL = '#E07B6A';

// Grade badge based on score
function getGrade(score) {
  if (score >= 90) return { grade: 'A+', color: '#27AE60', bg: '#E8F8F1', label: 'Excellent' };
  if (score >= 80) return { grade: 'A', color: '#27AE60', bg: '#E8F8F1', label: 'Very Good' };
  if (score >= 70) return { grade: 'B', color: '#F39C12', bg: '#FEF9E7', label: 'Good' };
  if (score >= 60) return { grade: 'C', color: '#E67E22', bg: '#FDF2E9', label: 'Fair' };
  return { grade: 'D', color: '#E74C3C', bg: '#FDEDEC', label: 'Keep Practicing' };
}

export default function Progress() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await getUserProgress();
        setStats(data);
      } catch (err) {
        setError("Unable to load progress. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '70vh', gap: 2 }}>
        <CircularProgress size={40} sx={{ color: TEAL }} />
        <Typography variant="body2" color="text.secondary">Loading your progress...</Typography>
      </Box>
    );
  }

  if (error || !stats) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, textAlign: 'center', border: '1px solid #FDEDEC', bgcolor: '#FFF5F5' }}>
          <Typography variant="h6" color="error" gutterBottom>⚠️ Stats Unavailable</Typography>
          <Typography variant="body2" color="text.secondary">{error || "Something went wrong."}</Typography>
        </Paper>
      </Container>
    );
  }

  const conversationsCompleted = stats.totalConversations || 0;
  const levelTarget = 10;
  const percentCompleted = Math.min(Math.round((conversationsCompleted / levelTarget) * 100), 100);
  const avgScore = stats.averageScore || 0;
  const grade = getGrade(avgScore);

  const formatTime = (seconds) => {
    if (!seconds) return '0 mins';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m === 0 ? `${s}s` : s === 0 ? `${m}m` : `${m}m ${s}s`;
  };

  return (
    <Box sx={{ bgcolor: '#F7F9FC', minHeight: '100vh', pb: 10 }}>
      {/* Hero Header */}
      <Box sx={{ background: `linear-gradient(135deg, ${TEAL} 0%, #2D7D7D 100%)`, pt: 5, pb: 4, px: 3, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />
        <Container maxWidth="sm">
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', mb: 0.5 }}>Learning Summary</Typography>
          <Typography variant="h5" fontWeight="800" color="#fff" sx={{ mb: 0.5 }}>Your Progress 📊</Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>
            Tracking your English learning journey
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ mt: 2 }}>
        {/* ── Overall Score Grade Card ── */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, mb: 2.5, border: '1px solid rgba(0,0,0,0.05)', bgcolor: '#fff', display: 'flex', gap: 3, alignItems: 'center' }}>
          {/* Big Grade Badge */}
          <Box sx={{
            width: 80, height: 80, borderRadius: 4,
            bgcolor: grade.bg, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            border: `2px solid ${grade.color}30`
          }}>
            <Typography sx={{ fontSize: '28px', fontWeight: '900', color: grade.color, lineHeight: 1 }}>{grade.grade}</Typography>
            <Typography sx={{ fontSize: '9px', color: grade.color, fontWeight: 'bold', mt: 0.3 }}>{grade.label}</Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Overall Accuracy Score</Typography>
            <Typography variant="h4" fontWeight="900" sx={{ color: grade.color, lineHeight: 1, mb: 0.5 }}>{avgScore}%</Typography>
            <Box sx={{ height: 6, bgcolor: grade.bg, borderRadius: 3, overflow: 'hidden', mb: 0.5 }}>
              <Box sx={{ width: `${avgScore}%`, height: '100%', bgcolor: grade.color, borderRadius: 3, transition: 'width 1s ease' }} />
            </Box>
            <Typography variant="caption" color="text.secondary">Based on {conversationsCompleted} sessions</Typography>
          </Box>
        </Paper>

        {/* ── Quick Stats ── */}
        <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
          {[
            { label: 'Day Streak', value: stats.streak || 0, icon: <LocalFireDepartmentIcon sx={{ color: '#FF6B35' }} />, bg: '#FFF3ED', color: '#FF6B35' },
            { label: 'Practice Time', value: formatTime(stats.totalPracticeTime), icon: <QueryBuilderIcon sx={{ color: TEAL }} />, bg: '#E8F4F4', color: TEAL },
            { label: 'Sessions Done', value: conversationsCompleted, icon: <CheckCircleIcon sx={{ color: '#27AE60' }} />, bg: '#E8F8F1', color: '#27AE60' },
            { label: 'Words Learned', value: stats.uniqueVocabulary?.length || 0, icon: <AutoStoriesIcon sx={{ color: '#7B68EE' }} />, bg: '#F0EEFF', color: '#7B68EE' },
          ].map((s) => (
            <Grid item xs={6} key={s.label}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.05)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {React.cloneElement(s.icon, { sx: { ...s.icon.props.sx, fontSize: 16 } })}
                  </Box>
                  <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                </Box>
                <Typography variant="h5" fontWeight="900" sx={{ color: '#1a1a2e' }}>{s.value}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* ── Level Progress ── */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, mb: 2.5, border: '1px solid rgba(0,0,0,0.05)', bgcolor: '#fff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" fontWeight="800" color="#1a1a2e">Level Progress</Typography>
            <Chip label={`${percentCompleted}% complete`} size="small" sx={{ bgcolor: '#E8F4F4', color: TEAL, fontWeight: 'bold', fontSize: '11px', height: '22px' }} />
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            {['Beginner', 'Intermediate', 'Advanced'].map((lvl, i) => {
              const levels = ['beginner', 'intermediate', 'advanced'];
              const userLvlIndex = levels.indexOf(stats?.level || 'beginner');
              const isActive = userLvlIndex === i;
              const isPast = userLvlIndex > i;
              return (
                <Box key={lvl} sx={{ flex: 1 }}>
                  <Box sx={{ height: 6, borderRadius: 3, bgcolor: (isActive || isPast) ? TEAL : '#E5E7EB', mb: 0.5, position: 'relative', overflow: 'hidden' }}>
                    {isActive && (
                      <Box sx={{ width: `${percentCompleted}%`, height: '100%', bgcolor: CORAL, position: 'absolute', top: 0, left: 0, borderRadius: 3, transition: 'width 1s ease' }} />
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ fontSize: '10px', color: isActive ? TEAL : isPast ? '#9CA3AF' : '#D1D5DB', fontWeight: isActive ? 'bold' : 'normal' }}>
                    {isActive && '● '}{lvl}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          <Typography variant="caption" color="text.secondary">
            {levelTarget - conversationsCompleted > 0
              ? `${levelTarget - conversationsCompleted} more sessions to reach next level`
              : '🎉 Level complete! Keep going!'
            }
          </Typography>
        </Paper>

        {/* ── Skill Breakdown ── */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, mb: 2.5, border: '1px solid rgba(0,0,0,0.05)', bgcolor: '#fff' }}>
          <Typography variant="body2" fontWeight="800" color="#1a1a2e" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon sx={{ fontSize: 18, color: TEAL }} /> Skill Breakdown
          </Typography>

          {[
            { skill: 'Conversation Fluency', score: Math.min(avgScore + 5, 100), color: TEAL },
            { skill: 'Grammar Accuracy', score: avgScore, color: CORAL },
            { skill: 'Vocabulary Range', score: Math.min((stats.uniqueVocabulary?.length || 0) * 5, 100), color: '#7B68EE' },
            { skill: 'Pronunciation', score: Math.max(avgScore - 10, 0), color: '#F39C12' },
          ].map((item) => {
            const g = getGrade(item.score);
            return (
              <Box key={item.skill} sx={{ mb: 1.8 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                  <Typography variant="caption" fontWeight="600" color="#1a1a2e">{item.skill}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Chip label={g.grade} size="small" sx={{ bgcolor: g.bg, color: g.color, fontWeight: 'bold', fontSize: '10px', height: '18px', px: 0 }} />
                    <Typography variant="caption" fontWeight="bold" sx={{ color: item.color }}>{item.score}%</Typography>
                  </Box>
                </Box>
                <Box sx={{ height: 6, bgcolor: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{ width: `${item.score}%`, height: '100%', bgcolor: item.color, borderRadius: 3, transition: 'width 1s ease 0.2s' }} />
                </Box>
              </Box>
            );
          })}
        </Paper>

        {/* ── Vocabulary Words Grid ── */}
        {stats?.uniqueVocabulary?.length > 0 && (
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, mb: 2.5, border: '1px solid rgba(0,0,0,0.05)', bgcolor: '#fff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <EmojiEventsIcon sx={{ color: '#F39C12', fontSize: 20 }} />
              <Typography variant="body2" fontWeight="800" color="#1a1a2e">
                Vocabulary Unlocked ({stats.uniqueVocabulary.length} words)
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
              {stats.uniqueVocabulary.map((word, i) => (
                <Chip
                  key={word}
                  label={word}
                  size="small"
                  icon={i < 3 ? <StarIcon sx={{ fontSize: '12px !important', color: '#F39C12 !important' }} /> : undefined}
                  sx={{
                    bgcolor: i < 3 ? '#FEF9E7' : '#F7F9FC',
                    color: i < 3 ? '#F39C12' : '#4B5563',
                    fontWeight: i < 3 ? 'bold' : 'normal',
                    border: `1px solid ${i < 3 ? '#FADBA4' : '#E5E7EB'}`,
                    fontSize: '12px',
                    height: '28px',
                    '&:hover': { bgcolor: '#E8F4F4', color: TEAL }
                  }}
                />
              ))}
            </Box>
          </Paper>
        )}

        {/* ── Recommendation Card ── */}
        {stats?.recommendation && (
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, background: 'linear-gradient(135deg, #1a1a2e, #16213e)', border: `1px solid ${TEAL}30` }}>
            <Typography variant="caption" sx={{ color: TEAL, fontWeight: 'bold', display: 'block', mb: 1 }}>
              💡 AI COACHING TIP
            </Typography>
            <Typography variant="body2" sx={{ color: '#fff', lineHeight: 1.6 }}>
              {stats.recommendation}
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
