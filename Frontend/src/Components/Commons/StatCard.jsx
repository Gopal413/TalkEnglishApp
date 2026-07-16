import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

export default function StatCard({ label, value, icon, bg, textColor, accentColor, sx, ...props }) {
  return (
    <MotionPaper
      elevation={0}
      whileHover={{ 
        y: -6, 
        boxShadow: `0px 16px 36px rgba(15, 23, 42, 0.08)`,
        borderColor: accentColor || '#E2E8F0',
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: 6, // 24px
        background: bg || '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        border: '1.5px solid #F1F5F9',
        borderBottom: accentColor ? `4px solid ${accentColor}` : '1.5px solid #F1F5F9',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.2s ease',
        ...sx,
      }}
      {...props}
    >
      <Box
        sx={{
          p: 1.5,
          borderRadius: 4, // 16px
          bgcolor: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(10px)',
          mb: 1.8,
          display: 'flex',
          boxShadow: '0px 4px 12px rgba(15, 23, 42, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'scale(1.1) rotate(5deg)',
          }
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 950,
          color: textColor || 'text.primary',
          fontSize: { xs: '26px', sm: '30px' },
          lineHeight: 1.1,
          mb: 0.8,
          letterSpacing: '-0.5px',
        }}
      >
        {value}
      </Typography>
      <Typography 
        variant="caption" 
        sx={{ 
          color: '#475569', 
          fontWeight: 700, 
          fontSize: { xs: '11px', sm: '12px' },
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          opacity: 0.85,
        }}
      >
        {label}
      </Typography>
    </MotionPaper>
  );
}
