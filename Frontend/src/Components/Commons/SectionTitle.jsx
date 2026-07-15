import React from 'react';
import { Box, Typography } from '@mui/material';

export default function SectionTitle({ title, subtitle, sx, ...props }) {
  return (
    <Box sx={{ mb: 3, ...sx }} {...props}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 900,
          color: 'text.primary',
          fontSize: { xs: '1.25rem', md: '1.5rem' },
          lineHeight: 1.2,
          mb: 0.5,
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
