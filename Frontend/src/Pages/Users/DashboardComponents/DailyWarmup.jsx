import React from 'react';
import { Box, Typography, TextField, Paper, Divider, Alert, CircularProgress } from '@mui/material';
import PrimaryButton from '../../../Components/Commons/PrimaryButton';
import SecondaryButton from '../../../Components/Commons/SecondaryButton';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function DailyWarmup({
  warmupPrompt,
  warmupInput,
  setWarmupInput,
  isWarmupRecording,
  checkingWarmup,
  warmupFeedback,
  onCheckWarmup,
  onNextWarmup,
  onStartWarmupVoice,
}) {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          Today's Writing Prompt
        </Typography>
        <SecondaryButton size="small" onClick={onNextWarmup} disabled={checkingWarmup} sx={{ borderRadius: '12px', py: 0.5, px: 2 }}>
          Change Prompt 🔄
        </SecondaryButton>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: 'rgba(37, 99, 235, 0.04)',
          borderRadius: 4, // 16px
          borderLeft: '4px solid #2563EB',
          mb: 3,
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '15px', lineHeight: 1.5 }}>
          "{warmupPrompt}"
        </Typography>
      </Paper>

      <TextField
        fullWidth
        multiline
        rows={4}
        value={warmupInput}
        onChange={(e) => setWarmupInput(e.target.value)}
        placeholder="Type or speak your response in English..."
        disabled={checkingWarmup}
        slotProps={{
          input: {
            sx: {
              borderRadius: 4, // 16px
              bgcolor: '#FAFBFC',
              '&:hover': { bgcolor: '#F4F5F7' },
            },
          },
        }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, flexWrap: 'wrap', gap: 2 }}>
        <SecondaryButton
          color={isWarmupRecording ? 'error' : 'primary'}
          onClick={onStartWarmupVoice}
          disabled={checkingWarmup}
          startIcon={isWarmupRecording ? <StopIcon /> : <MicIcon />}
          sx={{
            borderRadius: '24px',
            px: 3,
            py: 1,
            fontWeight: 700,
          }}
        >
          {isWarmupRecording ? 'Listening...' : 'Voice Dictate'}
        </SecondaryButton>

        <PrimaryButton
          onClick={onCheckWarmup}
          disabled={checkingWarmup || !warmupInput.trim()}
          loading={checkingWarmup}
          startIcon={<AutoFixHighIcon />}
          sx={{
            borderRadius: '24px',
            px: 3.5,
            py: 1.1,
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
          }}
        >
          Analyze Warm-up
        </PrimaryButton>
      </Box>

      {warmupFeedback && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 900 }}>
            Grammar Feedback
          </Typography>
          {warmupFeedback.isValid ? (
            <Alert
              icon={<CheckCircleOutlineIcon fontSize="inherit" />}
              severity="success"
              sx={{
                borderRadius: 4, // 16px
                fontWeight: 600,
                bgcolor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                color: '#166534',
              }}
            >
              Superb! No grammatical errors found. You expressed your thoughts correctly! 🎉
            </Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {warmupFeedback.errors.map((err, i) => (
                <Paper
                  key={i}
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    bgcolor: '#FFFBEB',
                    borderColor: '#FDE68A',
                    borderRadius: 4, // 16px
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.8,
                  }}
                >
                  <InfoOutlinedIcon color="warning" sx={{ mt: 0.3 }} />
                  <Box>
                    <Typography variant="body2" sx={{ mb: 0.8, color: '#1E293B', fontSize: '14px', fontWeight: 600 }}>
                      Instead of <s style={{ color: '#EF4444' }}>"{err.uncleanText}"</s>, try saying:{' '}
                      <strong style={{ color: '#2563EB', fontSize: '14.5px' }}>{err.replacements.join(', ')}</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', fontStyle: 'italic', color: 'text.secondary', fontWeight: 500 }}>
                      {err.message}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
