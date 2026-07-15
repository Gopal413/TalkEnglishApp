import React from 'react';
import { Paper } from '@mui/material';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

export default function GradientCard({ children, gradient, sx, ...props }) {
  const gradientStyle = gradient || 'linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)';
  return (
    <MotionPaper
      elevation={0}
      whileHover={{ y: -4, boxShadow: '0px 12px 32px rgba(15, 23, 42, 0.08)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      sx={{
        background: gradientStyle,
        color: '#FFFFFF',
        p: 3,
        borderRadius: 6, // 24px
        position: 'relative',
        overflow: 'hidden',
        border: 'none',
        ...sx,
      }}
      {...props}
    >
      {children}
    </MotionPaper>
  );
}
