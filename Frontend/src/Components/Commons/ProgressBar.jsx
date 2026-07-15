import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

export default function ProgressBar({ value, label, showValue = true, height = 8, color, trackColor, sx, ...props }) {
  return (
    <Box sx={{ width: '100%', ...sx }} {...props}>
      {(label || showValue) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          {label && (
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {label}
            </Typography>
          )}
          {showValue && (
            <Typography variant="caption" sx={{ fontWeight: 900, color: color || 'primary.main' }}>
              {value}%
            </Typography>
          )}
        </Box>
      )}
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: height,
          borderRadius: height / 2,
          bgcolor: trackColor || 'rgba(37, 99, 235, 0.08)',
          '& .MuiLinearProgress-bar': {
            borderRadius: height / 2,
            backgroundImage: color
              ? `linear-gradient(135deg, ${color} 0%, ${color} 100%)`
              : 'linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)',
          },
        }}
      />
    </Box>
  );
}
