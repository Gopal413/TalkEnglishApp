import React from 'react';
import { Box, Container, Grid, Avatar, Typography, Chip } from '@mui/material';
import ProgressBar from '../../../Components/Commons/ProgressBar';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function HeroSection({ user, lvl, goalPct, conversationsDone, levelTarget }) {
  // Determine motivational status based on goal progress
  const getMotivationalMsg = (pct) => {
    if (pct >= 100) return 'Daily Goal Achieved! Excellent job! 🏆';
    if (pct >= 50) return 'More than halfway! Keep the momentum! ⚡';
    if (pct > 0) return 'Great start! Let\'s reach today\'s target! 🚀';
    return 'Start your first chat with Luna AI to kick off today! 💬';
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #14B8A6 100%)',
        pt: { xs: 8, sm: 10 },
        pb: { xs: 10, sm: 12 },
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 2,
        boxShadow: '0 20px 40px rgba(37, 99, 235, 0.15)',
        mt:1,
        mx:1,
        mb: 5,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 60%)',
          pointerEvents: 'none',
        }
      }}
    >
      {/* Dynamic Animated Glowing Circles */}
      <Box
        sx={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.25) 0%, rgba(255,255,255,0) 70%)',
          animation: 'pulseGlow 8s ease-in-out infinite alternate',
          '@keyframes pulseGlow': {
            '0%': { transform: 'scale(1) translate(0, 0)', opacity: 0.6 },
            '100%': { transform: 'scale(1.15) translate(-20px, 20px)', opacity: 0.9 },
          }
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -80,
          left: '10%',
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(255,255,255,0) 70%)',
          animation: 'pulseGlow2 10s ease-in-out infinite alternate',
          '@keyframes pulseGlow2': {
            '0%': { transform: 'scale(1) translate(0, 0)', opacity: 0.5 },
            '100%': { transform: 'scale(1.2) translate(15px, -15px)', opacity: 0.8 },
          }
        }}
      />

      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'center' }, gap: { xs: 3, sm: 4 }, textAlign: { xs: 'center', sm: 'left' } }}>
              <Avatar
                sx={{
                  width: { xs: 90, sm: 110 },
                  height: { xs: 90, sm: 110 },
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  fontWeight: 900,
                  fontSize: { xs: '32px', sm: '40px' },
                  color: '#ffffff',
                  border: '4px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.25)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05) rotate(3deg)',
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                  }
                }}
              >
                {(user?.name || 'U')[0].toUpperCase()}
              </Avatar>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    display: 'block',
                    mb: 0.8,
                  }}
                >
                  Welcome back,
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 950,
                    lineHeight: 1.1,
                    fontSize: { xs: '2.2rem', sm: '3rem', md: '3.4rem' },
                    textShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    mb: 1.5,
                    letterSpacing: '-1px',
                  }}
                >
                  {user?.name || 'Learner'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                  <Chip
                    icon={<WorkspacePremiumIcon style={{ color: '#ffffff', fontSize: 16 }} />}
                    label={`${lvl.label} Level`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '12.5px',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      py: 1.8,
                      px: 0.5,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    }}
                  />
                  <Chip
                    icon={<AutoAwesomeIcon style={{ color: '#FCD34D', fontSize: 14 }} />}
                    label="TalkEnglish Scholar"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(20, 184, 166, 0.3)',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '12.5px',
                      border: '1px solid rgba(20, 184, 166, 0.4)',
                      py: 1.8,
                      px: 0.5,
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box
              sx={{
                p: 3.5,
                borderRadius: 6, // 24px
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(25px)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                }
              }}
            >
              <ProgressBar
                value={goalPct}
                label="Daily Goal Progress"
                showValue={true}
                color="#FFFFFF"
                trackColor="rgba(255, 255, 255, 0.2)"
                sx={{
                  mb: 1,
                  '& .MuiTypography-root': { color: '#ffffff', fontWeight: 800 },
                  '& .MuiLinearProgress-root': { height: 10, borderRadius: 5 },
                  '& .MuiLinearProgress-bar': {
                    backgroundImage: 'linear-gradient(135deg, #14B8A6 0%, #10B981 100%) !important',
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  mt: 1.5,
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                {conversationsDone}/{levelTarget} chat sessions completed today
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#A7F3D0',
                  mt: 1,
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {getMotivationalMsg(goalPct)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
