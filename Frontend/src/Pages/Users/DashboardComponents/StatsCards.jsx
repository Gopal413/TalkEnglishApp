import React from 'react';
import { Grid } from '@mui/material';
import StatCard from '../../../Components/Commons/StatCard';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export default function StatsCards({ loadingStats, stats, conversationsDone }) {
  const cards = [
    {
      label: 'Day Streak',
      value: loadingStats ? '—' : (stats?.streak || 0),
      icon: <LocalFireDepartmentIcon sx={{ color: '#F97316', fontSize: 28 }} />,
      bg: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)', // Soft Orange Gradient
      textColor: '#C2410C',
      accentColor: '#F97316',
    },
    {
      label: 'Conversations',
      value: loadingStats ? '—' : conversationsDone,
      icon: <AutoGraphIcon sx={{ color: '#2563EB', fontSize: 28 }} />,
      bg: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', // Soft Blue Gradient
      textColor: '#1D4ED8',
      accentColor: '#2563EB',
    },
    {
      label: 'Unlocked Vocab',
      value: loadingStats ? '—' : (stats?.uniqueVocabulary?.length || 0),
      icon: <SchoolIcon sx={{ color: '#8B5CF6', fontSize: 28 }} />,
      bg: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)', // Soft Purple Gradient
      textColor: '#6D28D9',
      accentColor: '#8B5CF6',
    },
    {
      label: 'Average Accuracy',
      value: loadingStats ? '—' : `${stats?.averageScore || 0}%`,
      icon: <EmojiEventsIcon sx={{ color: '#14B8A6', fontSize: 28 }} />,
      bg: 'linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 100%)', // Soft Teal Gradient
      textColor: '#0F766E',
      accentColor: '#14B8A6',
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 5 }}>
      {cards.map((c) => (
        <Grid item xs={6} sm={3} key={c.label}>
          <StatCard
            label={c.label}
            value={c.value}
            icon={c.icon}
            bg={c.bg}
            textColor={c.textColor}
            accentColor={c.accentColor}
          />
        </Grid>
      ))}
    </Grid>
  );
}
