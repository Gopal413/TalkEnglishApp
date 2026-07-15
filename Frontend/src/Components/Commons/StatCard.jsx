import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

export default function StatCard({ label, value, icon, bg, textColor, sx, ...props }) {
  return (
    <MotionPaper
      elevation={0}
      whileHover={{ y: -4, boxShadow: '0px 12px 32px rgba(15, 23, 42, 0.06)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      sx={{
        p: 3,
        borderRadius: 5, // 20px
        bgcolor: bg || '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        border: '1px solid #E2E8F0',
        ...sx,
      }}
      {...props}
    >
      <Box
        sx={{
          p: 1.5,
          borderRadius: 4, // 16px
          bgcolor: '#FFFFFF',
          mb: 2,
          display: 'flex',
          boxShadow: '0px 4px 12px rgba(15, 23, 42, 0.03)',
          border: '1px solid #F1F5F9',
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 900,
          color: textColor || 'text.primary',
          fontSize: { xs: '24px', md: '28px' },
          lineHeight: 1.1,
          mb: 0.5,
        }}
      >
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
        {label}
      </Typography>
    </MotionPaper>
  );
}
