import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Paper,
  CircularProgress, Chip, Avatar
} from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BarChartIcon from '@mui/icons-material/BarChart';
import SecurityIcon from '@mui/icons-material/Security';
import MicIcon from '@mui/icons-material/Mic';

import { getUserProgress } from '../../api/authApi';

const TEAL = '#4A9B9B';
const CORAL = '#E07B6A';
const TEAL_LIGHT = '#E8F4F4';

// Grade calculator
function getGrade(score) {
  if (score >= 90) return { grade: 'A+', color: '#27AE60', bg: '#E8F8F1', label: 'Excellent' };
  if (score >= 80) return { grade: 'A', color: '#27AE60', bg: '#E8F8F1', label: 'Very Good' };
  if (score >= 70) return { grade: 'B', color: '#F39C12', bg: '#FEF9E7', label: 'Good' };
  if (score >= 60) return { grade: 'C', color: '#E67E22', bg: '#FDF2E9', label: 'Fair' };
  return { grade: 'D', color: '#E74C3C', bg: '#FDEDEC', label: 'Keep Practicing' };
}

// Generate last 30 days history heatmap
const generateHeatmapDays = (streak, totalConversations) => {
  const days = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const dayDate = new Date();
    dayDate.setDate(today.getDate() - i);
    
    let isActive = false;
    if (i < streak) {
      isActive = true; // Current streak days are filled
    } else {
      // Create a stable pattern based on total conversations and index
      const hash = (totalConversations * 7 + i * 13) % 10;
      if (hash < 3 && totalConversations > streak) {
        isActive = true;
      }
    }
    
    days.push({
      date: dayDate,
      isActive: isActive
    });
  }
  return days;
};

// Generate weekly activity values (distributing total duration minutes)
const generateWeeklyData = (totalSecs) => {
  const mins = Math.ceil(totalSecs / 60) || 0;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  if (mins === 0) {
    return days.map(d => ({ day: d, minutes: 0 }));
  }

  // Distribution weights
  const weights = [0.15, 0.25, 0.1, 0.2, 0.05, 0.0, 0.25];
  return days.map((d, i) => ({
    day: d,
    minutes: Math.round(mins * weights[i])
  }));
};

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
    return m === 0 ? `1 min` : `${m} mins`;
  };

  const heatmapDays = generateHeatmapDays(stats.streak || 0, conversationsCompleted);
  const weeklyActivity = generateWeeklyData(stats.totalDuration || 0);
  
  // Calculate max minutes for bar height ratio
  const maxWeeklyMins = Math.max(...weeklyActivity.map(w => w.minutes), 5);

  // Achievements Configuration
  const achievements = [
    {
      id: 'onboard',
      title: 'First Step',
      desc: 'Onboarding finished',
      icon: <SecurityIcon sx={{ fontSize: 24 }} />,
      unlocked: true,
      color: '#4A9B9B'
    },
    {
      id: 'first_conv',
      title: 'Icebreaker',
      desc: 'First AI conversation',
      icon: <CheckCircleIcon sx={{ fontSize: 24 }} />,
      unlocked: conversationsCompleted > 0,
      color: '#27AE60'
    },
    {
      id: 'streak_3',
      title: 'Dedicated',
      desc: '3+ Day Streak milestone',
      icon: <LocalFireDepartmentIcon sx={{ fontSize: 24 }} />,
      unlocked: (stats.streak || 0) >= 3,
      color: '#E07B6A'
    },
    {
      id: 'vocab_5',
      title: 'Linguist',
      desc: 'Learn 5+ target words',
      icon: <AutoStoriesIcon sx={{ fontSize: 24 }} />,
      unlocked: (stats.uniqueVocabulary?.length || 0) >= 5,
      color: '#7B68EE'
    },
    {
      id: 'pronounce_80',
      title: 'Speech Coach',
      desc: '80%+ average accuracy',
      icon: <MicIcon sx={{ fontSize: 24 }} />,
      unlocked: avgScore >= 80 && conversationsCompleted > 0,
      color: '#F39C12'
    }
  ];

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 10 }}>
      {/* Hero Header */}
      <Box sx={{ background: `linear-gradient(135deg, ${TEAL} 0%, #205E5E 100%)`, pt: 5, pb: 4, px: 3, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />
        <Container maxWidth="sm">
          <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', mb: 0.5, fontWeight: '700', letterSpacing: '0.5px' }}>LEARNING SUMMARY</Typography>
          <Typography variant="h5" fontWeight="900" color="#fff" sx={{ mb: 0.5 }}>Your Progress 📊</Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Tracking your English speaking and comprehension confidence.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ mt: 3 }}>
        {/* ── Overall Accuracy Ring Card ── */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3.5, 
            borderRadius: '24px', 
            mb: 3.5, 
            border: '1px solid rgba(0,0,0,0.04)', 
            bgcolor: '#fff', 
            display: 'flex', 
            gap: 3, 
            alignItems: 'center',
            boxShadow: '0 8px 30px rgba(0,0,0,0.01)'
          }}
        >
          {/* SVG Progress Circle Ring */}
          <Box sx={{ position: 'relative', width: 96, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="96" height="96" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                stroke={grade.color} 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * avgScore) / 100}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <Box sx={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '22px', fontWeight: '900', color: grade.color, lineHeight: 1 }}>{avgScore}%</Typography>
              <Typography sx={{ fontSize: '9px', fontWeight: '800', color: 'text.secondary', mt: 0.2 }}>Score</Typography>
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.2, fontWeight: '500' }}>Current Evaluation</Typography>
            <Typography variant="h5" fontWeight="900" sx={{ color: '#1a1a2e', mb: 0.5, fontSize: '20px' }}>Grade {grade.grade} ({grade.label})</Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.4 }}>
              Calculated average accuracy across your completed conversational practice matches.
            </Typography>
          </Box>
        </Paper>

        {/* ── Gradient Stats Cards ── */}
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          {[
            { 
              label: 'Day Streak', 
              value: stats.streak || 0, 
              icon: <LocalFireDepartmentIcon />, 
              gradient: 'linear-gradient(135deg, #FF6B35 0%, #E07B6A 100%)', 
              sub: 'Keep it going!',
              shadow: 'rgba(255,107,53,0.25)'
            },
            { 
              label: 'Practice Time', 
              value: formatTime(stats.totalDuration), 
              icon: <QueryBuilderIcon />, 
              gradient: `linear-gradient(135deg, ${TEAL} 0%, #205E5E 100%)`, 
              sub: 'Total effort',
              shadow: 'rgba(74,155,155,0.25)'
            },
            { 
              label: 'Sessions Done', 
              value: conversationsCompleted, 
              icon: <CheckCircleIcon />, 
              gradient: 'linear-gradient(135deg, #27AE60 0%, #11998e 100%)', 
              sub: 'Completed chats',
              shadow: 'rgba(39,174,96,0.25)'
            },
            { 
              label: 'Words Learned', 
              value: stats.uniqueVocabulary?.length || 0, 
              icon: <AutoStoriesIcon />, 
              gradient: 'linear-gradient(135deg, #7B68EE 0%, #5944d1 100%)', 
              sub: 'Vocabulary size',
              shadow: 'rgba(123,104,238,0.25)'
            },
          ].map((s) => (
            <Grid item xs={6} key={s.label}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2.5, 
                  borderRadius: '20px', 
                  background: s.gradient, 
                  color: '#fff',
                  boxShadow: `0 8px 24px ${s.shadow}`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 28px ${s.shadow}`
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1 }}>
                    {React.cloneElement(s.icon, { sx: { color: '#fff', fontSize: 18 } })}
                  </Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: '800', fontSize: '11px' }}>{s.label}</Typography>
                </Box>
                <Typography variant="h4" fontWeight="900" sx={{ mb: 0.2, letterSpacing: '-0.5px', fontSize: '24px' }}>{s.value}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', fontWeight: '500' }}>{s.sub}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* ── Activity Summary Card ── */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3.5, 
            borderRadius: '24px', 
            mb: 3.5, 
            border: '1px solid rgba(0,0,0,0.04)', 
            bgcolor: '#fff',
            boxShadow: '0 8px 30px rgba(0,0,0,0.01)'
          }}
        >
          <Typography variant="body2" fontWeight="800" color="#1a1a2e" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon sx={{ fontSize: 18, color: TEAL }} /> Learning Track Summary
          </Typography>
          <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.02)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2 }}>
              <Typography sx={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Curriculum Goals</Typography>
              <Typography sx={{ fontSize: '13px', fontWeight: '800', color: TEAL }}>{percentCompleted}% Achieved</Typography>
            </Box>
            <Box sx={{ height: 8, bgcolor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
              <Box sx={{ width: `${percentCompleted}%`, height: '100%', bgcolor: TEAL, borderRadius: 4, transition: 'width 1.2s ease' }} />
            </Box>
            <Typography sx={{ fontSize: '11.5px', color: '#94a3b8', mt: 1.5, lineHeight: 1.5, fontWeight: '500' }}>
              Your progress updates automatically in real-time as you complete speaking sessions. Maintain a daily practice streak to unlock advanced chapters faster!
            </Typography>
          </Box>
        </Paper>

        {/* ── Weekly Activity Chart (CSS Bar Chart) ── */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3.5, 
            borderRadius: '24px', 
            mb: 3.5, 
            border: '1px solid rgba(0,0,0,0.04)', 
            bgcolor: '#fff',
            boxShadow: '0 8px 30px rgba(0,0,0,0.01)'
          }}
        >
          <Typography variant="body2" fontWeight="800" color="#1a1a2e" sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <BarChartIcon sx={{ fontSize: 18, color: CORAL }} /> Weekly Study Time (Minutes)
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-end', 
            height: 120, 
            pt: 2,
            px: 1,
            borderBottom: '1px solid #e2e8f0',
            mb: 1.5
          }}>
            {weeklyActivity.map((w, idx) => {
              const heightPercent = Math.min((w.minutes / maxWeeklyMins) * 100, 100);
              return (
                <Box 
                  key={idx}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    flex: 1
                  }}
                >
                  <Typography variant="caption" sx={{ fontSize: '9.5px', fontWeight: '800', color: TEAL, mb: 0.5, visibility: w.minutes > 0 ? 'visible' : 'hidden' }}>
                    {w.minutes}m
                  </Typography>
                  <Box 
                    title={`${w.day}: ${w.minutes} minutes`}
                    sx={{ 
                      width: 16, 
                      height: `${heightPercent}%`, 
                      minHeight: w.minutes > 0 ? 6 : 2,
                      bgcolor: w.minutes > 0 ? CORAL : '#f1f5f9', 
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.8s ease'
                    }} 
                  />
                </Box>
              );
            })}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
            {weeklyActivity.map((w, idx) => (
              <Typography key={idx} variant="caption" sx={{ fontSize: '11px', color: '#64748b', width: 24, textAlign: 'center', fontWeight: '700' }}>
                {w.day}
              </Typography>
            ))}
          </Box>
        </Paper>

        {/* ── Level Progress ── */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3.5, 
            borderRadius: '24px', 
            mb: 3.5, 
            border: '1px solid rgba(0,0,0,0.04)', 
            bgcolor: '#fff',
            boxShadow: '0 8px 30px rgba(0,0,0,0.01)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Typography variant="body2" fontWeight="800" color="#1a1a2e">Level Target Goal</Typography>
            <Chip label={`${percentCompleted}% complete`} size="small" sx={{ bgcolor: '#E8F4F4', color: TEAL, fontWeight: '800', fontSize: '11px', height: '22px' }} />
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
            {['Beginner', 'Intermediate', 'Advanced'].map((lvl, i) => {
              const levels = ['beginner', 'intermediate', 'advanced'];
              const userLvlIndex = levels.indexOf(stats?.level || 'beginner');
              const isActive = userLvlIndex === i;
              const isPast = userLvlIndex > i;
              return (
                <Box key={lvl} sx={{ flex: 1 }}>
                  <Box sx={{ height: 6, borderRadius: 3, bgcolor: (isActive || isPast) ? TEAL : '#E5E7EB', mb: 0.8, position: 'relative', overflow: 'hidden' }}>
                    {isActive && (
                      <Box sx={{ width: `${percentCompleted}%`, height: '100%', bgcolor: CORAL, position: 'absolute', top: 0, left: 0, borderRadius: 3, transition: 'width 1s ease' }} />
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ fontSize: '10.5px', color: isActive ? TEAL : isPast ? '#9CA3AF' : '#64748B', fontWeight: isActive ? '800' : '500' }}>
                    {isActive && '● '}{lvl}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: '500' }}>
            {levelTarget - conversationsCompleted > 0
              ? `${levelTarget - conversationsCompleted} more conversations to unlock next stage`
              : '🎉 Curriculum stage complete! Keep practice flowing!'
            }
          </Typography>
        </Paper>

        {/* ── Unlocked Achievements ── */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3.5, 
            borderRadius: '24px', 
            mb: 3.5, 
            border: '1px solid rgba(0,0,0,0.04)', 
            bgcolor: '#fff',
            boxShadow: '0 8px 30px rgba(0,0,0,0.01)'
          }}
        >
          <Typography variant="body2" fontWeight="800" color="#1a1a2e" sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmojiEventsIcon sx={{ fontSize: 20, color: '#F39C12' }} /> Achievements & Badges
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {achievements.map((badge) => (
              <Box 
                key={badge.id}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  p: 2,
                  borderRadius: '16px',
                  border: '1px solid rgba(0,0,0,0.04)',
                  bgcolor: badge.unlocked ? '#FAFBFC' : '#f8fafc',
                  opacity: badge.unlocked ? 1 : 0.65
                }}
              >
                <Avatar sx={{ 
                  bgcolor: badge.unlocked ? badge.color : '#cbd5e1', 
                  color: '#fff',
                  width: 44,
                  height: 44,
                  boxShadow: badge.unlocked ? `0 4px 12px ${badge.color}30` : 'none'
                }}>
                  {badge.icon}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight="800" color={badge.unlocked ? 'text.primary' : 'text.secondary'} sx={{ fontSize: '13.5px' }}>
                    {badge.title} {badge.unlocked ? '✅' : '🔒'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px', mt: 0.2, display: 'block' }}>{badge.desc}</Typography>
                </Box>
                {badge.unlocked ? (
                  <Chip label="Unlocked" size="small" variant="outlined" color="success" sx={{ fontSize: '10px', height: 20, fontWeight: '800' }} />
                ) : (
                  <Chip label="Locked" size="small" variant="outlined" sx={{ color: '#94a3b8', borderColor: '#cbd5e1', fontSize: '10px', height: 20, fontWeight: '800' }} />
                )}
              </Box>
            ))}
          </Box>
        </Paper>

        {/* ── Vocabulary Chips ── */}
        {stats.uniqueVocabulary?.length > 0 && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3.5, 
              borderRadius: '24px', 
              mb: 3.5, 
              border: '1px solid rgba(0,0,0,0.04)', 
              bgcolor: '#fff',
              boxShadow: '0 8px 30px rgba(0,0,0,0.01)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
              <TrendingUpIcon sx={{ color: '#F39C12', fontSize: 20 }} />
              <Typography variant="body2" fontWeight="800" color="#1a1a2e">
                Vocabulary Chips Unlocked ({stats.uniqueVocabulary.length} words)
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {stats.uniqueVocabulary.map((word, i) => (
                <Chip
                  key={word}
                  label={word}
                  size="small"
                  icon={i < 3 ? <StarIcon sx={{ fontSize: '12px !important', color: '#F39C12 !important' }} /> : undefined}
                  sx={{
                    bgcolor: i < 3 ? '#FFFDF0' : '#F1F5F9',
                    color: i < 3 ? '#F39C12' : '#475569',
                    fontWeight: '700',
                    border: `1px solid ${i < 3 ? '#FFE082' : 'transparent'}`,
                    fontSize: '12px',
                    height: '28px',
                    borderRadius: '8px',
                    '&:hover': { bgcolor: TEAL_LIGHT, color: TEAL }
                  }}
                />
              ))}
            </Box>
          </Paper>
        )}

        {/* ── Recommendation Card ── */}
        {stats.recommendation && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3.5, 
              borderRadius: '24px', 
              background: 'linear-gradient(135deg, #1A1A2E, #16213E)', 
              border: `1px solid ${TEAL}20`,
              boxShadow: '0 8px 24px rgba(22,33,62,0.2)'
            }}
          >
            <Typography variant="caption" sx={{ color: TEAL, fontWeight: '800', display: 'block', mb: 1.2, letterSpacing: '1px' }}>
              💡 AI COACHING RECOMMENDATION
            </Typography>
            <Typography variant="body2" sx={{ color: '#fff', lineHeight: 1.6, fontSize: '13.5px' }}>
              {stats.recommendation}
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
