import React from 'react';
import { Box, Container, Grid, Avatar, Typography, Chip } from '@mui/material';
import ProgressBar from '../../../Components/Commons/ProgressBar';

export default function HeroSection({ user, lvl, goalPct, conversationsDone, levelTarget }) {
  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)',
        pt: { xs: 6, sm: 8 },
        pb: { xs: 8, sm: 10 },
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: { xs: '0 0 24px 24px', md: '0 0 32px 32px' },
        boxShadow: '0 10px 30px rgba(37, 99, 235, 0.15)',
        mb: 5,
      }}
    >
      {/* Decorative mesh glows */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -45,
          right: 120,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
        }}
      />

      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2.5, sm: 3.5 } }}>
              <Avatar
                sx={{
                  width: { xs: 72, sm: 88 },
                  height: { xs: 72, sm: 88 },
                  bgcolor: 'rgba(255,255,255,0.2)',
                  fontWeight: 900,
                  fontSize: { xs: '26px', sm: '32px' },
                  color: '#ffffff',
                  border: '3px solid rgba(255,255,255,0.4)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                }}
              >
                {(user?.name || 'U')[0].toUpperCase()}
              </Avatar>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.8px',
                    textTransform: 'uppercase',
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  Welcome back,
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 900,
                    lineHeight: 1.1,
                    fontSize: { xs: '1.8rem', sm: '2.5rem' },
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    mb: 1.2,
                  }}
                >
                  {user?.name || 'Learner'}
                </Typography>
                <Chip
                  label={`${lvl.label} Level`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '12px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    px: 0.5,
                  }}
                />
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box
              sx={{
                p: 3,
                borderRadius: 5, // 20px
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
              }}
            >
              <ProgressBar
                value={goalPct}
                label="Daily Goal Progress"
                showValue={true}
                color="#FFFFFF"
                trackColor="rgba(255, 255, 255, 0.2)"
                sx={{
                  '& .MuiTypography-root': { color: '#ffffff' },
                  '& .MuiLinearProgress-bar': {
                    backgroundImage: 'linear-gradient(135deg, #14B8A6 0%, #22C55E 100%) !important',
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255,255,255,0.85)',
                  mt: 1.5,
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                {conversationsDone}/{levelTarget} chat sessions completed today
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
