import React from 'react';
import { Box, Typography, TextField, Paper, Divider, Alert, Avatar } from '@mui/material';
import PrimaryButton from '../../../Components/Commons/PrimaryButton';
import SecondaryButton from '../../../Components/Commons/SecondaryButton';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CreateIcon from '@mui/icons-material/Create';

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5, flexWrap: 'wrap', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', p: 1, borderRadius: '12px', bgcolor: 'primary.light', color: 'primary.main' }}>
            <CreateIcon sx={{ fontSize: 20 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Daily Writing Challenge 🌅
          </Typography>
        </Box>
        <SecondaryButton 
          size="small" 
          onClick={onNextWarmup} 
          disabled={checkingWarmup} 
          sx={{ borderRadius: '12px', py: 0.5, px: 2 }}
        >
          Change Topic 🔄
        </SecondaryButton>
      </Box>

      {/* Speech Dialogue Bubble Layout */}
      <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start', mb: 4 }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: 'secondary.main',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '15px',
            border: '2px solid #ffffff',
            boxShadow: '0 4px 12px rgba(20, 184, 166, 0.25)',
            flexShrink: 0,
            mt: 0.5,
          }}
        >
          LA
        </Avatar>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            bgcolor: 'rgba(37, 99, 235, 0.03)',
            borderRadius: '0px 20px 20px 20px',
            border: '1.5px solid #EFF6FF',
            position: 'relative',
            flexGrow: 1,
          }}
        >
          <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.8, letterSpacing: '0.8px' }}>
            Luna AI Coach Prompt
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '15.5px', lineHeight: 1.5 }}>
            "{warmupPrompt}"
          </Typography>
        </Paper>
      </Box>

      <TextField
        fullWidth
        multiline
        rows={4}
        value={warmupInput}
        onChange={(e) => setWarmupInput(e.target.value)}
        placeholder="Type or speak your thoughts in English..."
        disabled={checkingWarmup}
        slotProps={{
          input: {
            sx: {
              borderRadius: 5, // 20px
              bgcolor: '#FFFFFF',
              boxShadow: 'inset 0 2px 4px rgba(15, 23, 42, 0.02)',
              p: 2.5,
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
            px: 3.5,
            py: 1.2,
            fontWeight: 800,
            transition: 'all 0.2s',
            ...(isWarmupRecording && {
              animation: 'pulseWarmupRing 1.8s infinite',
              '@keyframes pulseWarmupRing': {
                '0%': { transform: 'scale(0.98)', boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.4)' },
                '70%': { transform: 'scale(1.02)', boxShadow: '0 0 0 10px rgba(239, 68, 68, 0)' },
                '100%': { transform: 'scale(0.98)', boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' },
              }
            }),
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
            px: 4,
            py: 1.3,
            fontWeight: 800,
            boxShadow: '0 6px 16px rgba(37, 99, 235, 0.2)',
          }}
        >
          Analyze Writing
        </PrimaryButton>
      </Box>

      {warmupFeedback && (
        <Box sx={{ mt: 4.5 }}>
          <Divider sx={{ mb: 3.5 }} />
          <Typography variant="subtitle1" sx={{ mb: 2.5, fontWeight: 900, color: 'text.primary' }}>
            AI Analysis Feedback ✨
          </Typography>
          
          {warmupFeedback.isValid ? (
            <Alert
              icon={<CheckCircleOutlineIcon fontSize="inherit" />}
              severity="success"
              sx={{
                borderRadius: 5,
                fontWeight: 700,
                bgcolor: '#F0FDF4',
                border: '1.5px solid #BBF7D0',
                color: '#166534',
                p: 2.5,
              }}
            >
              Fantastic job! No spelling or grammar errors found. You expressed your response perfectly! 🎉
            </Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {warmupFeedback.errors.map((err, i) => (
                <Paper
                  key={i}
                  variant="outlined"
                  sx={{
                    p: 3,
                    bgcolor: '#FFFBEB',
                    borderColor: '#FDE68A',
                    borderRadius: 5,
                    borderLeft: '5px solid #F59E0B',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2.2,
                  }}
                >
                  <InfoOutlinedIcon color="warning" sx={{ mt: 0.3, fontSize: '22px' }} />
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 800, 
                          color: '#EF4444', 
                          backgroundColor: '#FEE2E2', 
                          padding: '2px 8px', 
                          borderRadius: '6px',
                          textTransform: 'uppercase' 
                        }}>
                          Original Text
                        </span>
                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#64748B', fontWeight: 600 }}>
                          "{err.uncleanText}"
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 800, 
                          color: '#2563EB', 
                          backgroundColor: '#EFF6FF', 
                          padding: '2px 8px', 
                          borderRadius: '6px',
                          textTransform: 'uppercase' 
                        }}>
                          Suggested Text
                        </span>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#1E3A8A' }}>
                          "{err.replacements.join(', ')}"
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="caption" sx={{ display: 'block', fontStyle: 'italic', color: '#78350F', fontWeight: 600, mt: 1 }}>
                      💡 Tip: {err.message}
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
