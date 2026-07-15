import React from 'react';
import { Box, Typography } from '@mui/material';
import DashboardCard from '../../../Components/Commons/DashboardCard';
import ProgressBar from '../../../Components/Commons/ProgressBar';
import SecondaryButton from '../../../Components/Commons/SecondaryButton';
import MenuBookIcon from '@mui/icons-material/MenuBook';

export default function ContinueLearning({ lessonStats, onNavigate }) {
  const percent = lessonStats.total > 0
    ? Math.round((lessonStats.completed / lessonStats.total) * 100)
    : 0;

  return (
    <DashboardCard sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3.5 }}>
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
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2, mb: 0.5 }}>
            Structured Lessons
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Grammar, Vocab & Pronunciation syllabus
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 4.5 }}>
        <ProgressBar
          value={percent}
          label="Lessons Completed"
          showValue={true}
          color="#2563EB"
          trackColor="#F1F5F9"
          sx={{
            '& .MuiTypography-root': { fontWeight: 700, fontSize: '13px' },
          }}
        />
        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block', fontWeight: 600 }}>
          You have completed {lessonStats.completed} out of {lessonStats.total} total syllabus lessons.
        </Typography>
      </Box>

      <SecondaryButton fullWidth onClick={onNavigate}>
        Browse Syllabus
      </SecondaryButton>
    </DashboardCard>
  );
}
