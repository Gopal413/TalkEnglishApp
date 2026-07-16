import React from 'react';
import { Box, Typography, Card, CardContent, Chip, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '../../../Components/Commons/DashboardCard';
import ProgressBar from '../../../Components/Commons/ProgressBar';
import SecondaryButton from '../../../Components/Commons/SecondaryButton';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function ContinueLearning({ lessonStats, nextLesson, onNavigate }) {
  const navigate = useNavigate();

  const percent = lessonStats.total > 0
    ? Math.round((lessonStats.completed / lessonStats.total) * 100)
    : 0;

  const handleLessonStart = () => {
    if (nextLesson && !nextLesson.isLocked) {
      navigate(`/lessons/${nextLesson.lessonId}`);
    } else {
      navigate('/lessons');
    }
  };

  return (
    <DashboardCard sx={{ mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: '16px',
            bgcolor: 'primary.light',
            color: 'primary.main',
            display: 'flex',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)',
          }}
        >
          <MenuBookIcon sx={{ fontSize: 26 }} />
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2, mb: 0.2 }}>
            Syllabus Lessons
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Grammar, Vocab & Pronunciation
          </Typography>
        </Box>
      </Box>

      {/* Progress Metric */}
      <Box sx={{ mb: 3.5 }}>
        <ProgressBar
          value={percent}
          label="Lessons Completed"
          showValue={true}
          color="#2563EB"
          trackColor="#F1F5F9"
          sx={{
            mb: 1.2,
            '& .MuiTypography-root': { fontWeight: 800, fontSize: '13px' },
          }}
        />
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600, fontSize: '11.5px' }}>
          You completed {lessonStats.completed} of {lessonStats.total} total lessons.
        </Typography>
      </Box>

      {/* "Next Up" Lesson Section */}
      {nextLesson ? (
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 800, 
              color: 'primary.main', 
              textTransform: 'uppercase', 
              letterSpacing: '1px',
              display: 'block',
              mb: 1.5
            }}
          >
            🚀 Recommended Next Up
          </Typography>
          
          <Paper
            elevation={0}
            onClick={handleLessonStart}
            sx={{
              p: 2.5,
              borderRadius: 4, // 16px
              bgcolor: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: '#F0FDFA',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.05)',
              }
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Box 
                sx={{ 
                  width: 44, 
                  height: 44, 
                  borderRadius: '12px', 
                  bgcolor: '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '22px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  flexShrink: 0
                }}
              >
                {nextLesson.emoji || '📖'}
              </Box>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 850, 
                    color: '#0F172A', 
                    fontSize: '14.5px', 
                    mb: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {nextLesson.title}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary', 
                    display: 'block',
                    mb: 1.5,
                    fontSize: '11.5px',
                    fontWeight: 500,
                    lineHeight: 1.3
                  }}
                >
                  {nextLesson.description}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip
                    label={nextLesson.category}
                    size="small"
                    sx={{
                      bgcolor: 'primary.light',
                      color: 'primary.main',
                      fontWeight: 800,
                      fontSize: '10px',
                      height: '18px',
                      textTransform: 'capitalize',
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, fontSize: '10.5px' }}>
                    • ~{nextLesson.estimatedMinutes || 5} mins
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      ) : (
        /* If all lessons are completed */
        lessonStats.total > 0 && lessonStats.completed === lessonStats.total && (
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 4,
              bgcolor: '#F0FDF4',
              border: '1.5px solid #BBF7D0',
              textAlign: 'center',
              mb: 3,
            }}
          >
            <CheckCircleIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#166534', mb: 0.5 }}>
              All caught up! 🎉
            </Typography>
            <Typography variant="caption" sx={{ color: '#166534', opacity: 0.85, fontWeight: 600 }}>
              You've completed all structured syllabus lessons. Great work!
            </Typography>
          </Paper>
        )
      )}

      {/* Primary Actions Button */}
      <SecondaryButton fullWidth onClick={onNavigate}>
        Browse All Lessons
      </SecondaryButton>
    </DashboardCard>
  );
}
