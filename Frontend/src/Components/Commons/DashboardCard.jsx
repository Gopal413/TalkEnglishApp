import React from 'react';
import { Paper } from '@mui/material';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

export default function DashboardCard({ children, sx, ...props }) {
  return (
    <MotionPaper
      elevation={0}
      whileHover={{ y: -4, boxShadow: '0px 16px 32px rgba(15, 23, 42, 0.05)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      sx={{
        p: { xs: 3, sm: 4 },
        borderRadius: 2, // 24px
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        position: 'relative',
        ...sx,
      }}
      {...props}
    >
      {children}
    </MotionPaper>
  );
}
