import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';

const MotionButton = motion(Button);

export default function SecondaryButton({ children, loading, disabled, sx, ...props }) {
  return (
    <MotionButton
      variant="outlined"
      color="primary"
      disabled={disabled || loading}
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      sx={{
        py: 1.2,
        px: 3.5,
        ...sx,
      }}
      {...props}
    >
      {loading ? <CircularProgress size={20} color="inherit" /> : children}
    </MotionButton>
  );
}
