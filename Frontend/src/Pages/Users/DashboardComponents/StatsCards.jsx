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
      icon: <LocalFireDepartmentIcon sx={{ color: '#F97316', fontSize: 26 }} />,
      bg: '#FFF7ED', // Soft Orange
      textColor: '#C2410C',
    },
    {
      label: 'Conversations',
      value: loadingStats ? '—' : conversationsDone,
      icon: <AutoGraphIcon sx={{ color: '#2563EB', fontSize: 26 }} />,
      bg: '#EFF6FF', // Soft Blue
      textColor: '#1D4ED8',
    },
    {
      label: 'Unlocked Vocab',
      value: loadingStats ? '—' : (stats?.uniqueVocabulary?.length || 0),
      icon: <SchoolIcon sx={{ color: '#8B5CF6', fontSize: 26 }} />,
      bg: '#F5F3FF', // Soft Purple
      textColor: '#6D28D9',
    },
    {
      label: 'Average Accuracy',
      value: loadingStats ? '—' : `${stats?.averageScore || 0}%`,
      icon: <EmojiEventsIcon sx={{ color: '#14B8A6', fontSize: 26 }} />,
      bg: '#F0FDFA', // Soft Teal
      textColor: '#0F766E',
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
          />
        </Grid>
      ))}
    </Grid>
  );
}
