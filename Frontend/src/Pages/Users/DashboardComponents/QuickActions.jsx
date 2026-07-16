import React from 'react';
import { Box, Typography, Avatar, Chip, Paper } from '@mui/material';
import DashboardCard from '../../../Components/Commons/DashboardCard';
import PrimaryButton from '../../../Components/Commons/PrimaryButton';
import SecondaryButton from '../../../Components/Commons/SecondaryButton';

import SupportAgentIcon from '@mui/icons-material/SupportAgent';

export default function QuickActions({ stats, onNavigateChat, onNavigateProgress }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      
      {/* Luna Chat Quick Panel */}
      <DashboardCard 
        sx={{ 
          textAlign: 'center',
          pb: 3.5,
          position: 'relative',
          overflow: 'hidden',
          borderRadius:'50px',
          borderLeft: '5px solid #14B8A6', // Secondary accent border
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.05) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none',
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{
                width: 76,
                height: 76,
                bgcolor: 'secondary.light',
                color: 'secondary.main',
                border: '3px solid #ffffff',
                boxShadow: '0 8px 24px rgba(20, 184, 166, 0.15)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.08) rotate(-5deg)',
                }
              }}
            >
              <SupportAgentIcon sx={{ fontSize: 44 }} />
            </Avatar>
            {/* Green pulsing online badge */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 14,
                height: 14,
                borderRadius: '50%',
                bgcolor: '#22C55E',
                border: '2px solid #ffffff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                animation: 'pulseGreen 2s infinite',
                '@keyframes pulseGreen': {
                  '0%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.7)' },
                  '70%': { boxShadow: '0 0 0 8px rgba(34, 197, 94, 0)' },
                  '100%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0)' },
                }
              }}
            />
          </Box>
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.2, color: '#0F172A' }}>
          Luna AI Assistant
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2, fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Online • Adapts to your level
        </Typography>

        {/* Dynamic Coach Floating Bubble */}
        <Paper
          elevation={0}
          sx={{
            p: 1.8,
            bgcolor: '#F0FDFA',
            border: '1px solid #CCFBF1',
            borderRadius: '16px',
            textAlign: 'left',
            position: 'relative',
            mb: 3,
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '8px solid #CCFBF1',
            }
          }}
        >
          <Typography variant="body2" sx={{ color: '#0F766E', fontStyle: 'italic', fontWeight: 600, fontSize: '12px', lineHeight: 1.4, textAlign: 'center' }}>
            "Hi there! Ready for our daily conversation? Let's check out today's speaking topic!"
          </Typography>
        </Paper>

        <PrimaryButton
          fullWidth
          color="secondary"
          onClick={onNavigateChat}
          sx={{
            py: 1.4,
            fontWeight: 800,
            fontSize: '14.5px',
            borderRadius: '24px',
            boxShadow: '0 6px 16px rgba(20, 184, 166, 0.25)',
          }}
        >
          Launch Partner Chat
        </PrimaryButton>
      </DashboardCard>

      {/* Vocabulary Trophy Panel */}
      {stats?.uniqueVocabulary?.length > 0 && (
        <DashboardCard
          sx={{
            borderLeft: '5px solid #2563EB', // Primary accent border
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 950, color: '#0F172A', fontSize: '15px' }}>
              🏅 Vocabulary Unlocked
            </Typography>
            <SecondaryButton
              size="small"
              onClick={onNavigateProgress}
              sx={{
                py: 0.5,
                px: 1.8,
                fontSize: '11px',
                borderRadius: '10px',
                fontWeight: 700,
              }}
            >
              View All
            </SecondaryButton>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {stats.uniqueVocabulary.slice(0, 8).map((word) => (
              <Chip
                key={word}
                label={word}
                size="small"
                sx={{
                  bgcolor: '#EFF6FF',
                  color: 'primary.main',
                  fontWeight: 800,
                  fontSize: '11.5px',
                  borderRadius: '8px',
                  py: 1.6,
                  px: 0.8,
                  border: '1px solid #DBEAFE',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    bgcolor: 'primary.light',
                  }
                }}
              />
            ))}
            {stats.uniqueVocabulary.length > 8 && (
              <Chip
                label={`+${stats.uniqueVocabulary.length - 8} more`}
                size="small"
                sx={{
                  bgcolor: '#F8FAFC',
                  color: 'text.secondary',
                  fontSize: '11px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  border: '1.5px solid #E2E8F0',
                }}
              />
            )}
          </Box>
        </DashboardCard>
      )}
    </Box>
  );
}
