import React from 'react';
import { Box, Typography, Avatar, Chip } from '@mui/material';
import DashboardCard from '../../../Components/Commons/DashboardCard';
import PrimaryButton from '../../../Components/Commons/PrimaryButton';
import SecondaryButton from '../../../Components/Commons/SecondaryButton';
import ForumIcon from '@mui/icons-material/Forum';

export default function QuickActions({ stats, onNavigateChat, onNavigateProgress }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Luna Chat Quick Panel */}
      <DashboardCard sx={{ textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'rgba(20, 184, 166, 0.08)',
              color: 'secondary.main',
              border: '3px solid #ffffff',
              boxShadow: '0 8px 24px rgba(20, 184, 166, 0.15)',
            }}
          >
            <ForumIcon sx={{ fontSize: 40 }} />
          </Avatar>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5 }}>
          Chat with Luna AI
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 3, fontWeight: 600 }}>
          Online &middot; Adapts difficulty in real-time
        </Typography>
        <PrimaryButton
          fullWidth
          color="secondary"
          onClick={onNavigateChat}
          sx={{
            py: 1.4,
            boxShadow: '0 4px 14px rgba(20, 184, 166, 0.2)',
          }}
        >
          Launch Partner Chat
        </PrimaryButton>
      </DashboardCard>

      {/* Vocabulary Trophy Panel */}
      {stats?.uniqueVocabulary?.length > 0 && (
        <DashboardCard>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
              🏅 Unlocked Vocabulary
            </Typography>
            <SecondaryButton
              size="small"
              onClick={onNavigateProgress}
              sx={{
                py: 0.5,
                px: 2,
                fontSize: '12px',
                borderRadius: '12px',
              }}
            >
              View All
            </SecondaryButton>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap' }}>
            {stats.uniqueVocabulary.slice(0, 8).map((word) => (
              <Chip
                key={word}
                label={word}
                size="small"
                sx={{
                  bgcolor: 'rgba(37, 99, 235, 0.06)',
                  color: 'primary.main',
                  fontWeight: 700,
                  fontSize: '11px',
                  borderRadius: '10px',
                  py: 1.5,
                  px: 0.5,
                  border: '1px solid rgba(37, 99, 235, 0.05)',
                }}
              />
            ))}
            {stats.uniqueVocabulary.length > 8 && (
              <Chip
                label={`+${stats.uniqueVocabulary.length - 8} more`}
                size="small"
                sx={{
                  bgcolor: 'background.default',
                  color: 'text.secondary',
                  fontSize: '11px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  border: '1px solid #E2E8F0',
                }}
              />
            )}
          </Box>
        </DashboardCard>
      )}
    </Box>
  );
}
