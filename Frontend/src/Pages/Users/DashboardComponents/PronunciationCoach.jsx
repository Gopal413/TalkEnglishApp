import React from 'react';
import { Box, Typography, Paper, Divider, IconButton, Chip } from '@mui/material';
import PrimaryButton from '../../../Components/Commons/PrimaryButton';
import SecondaryButton from '../../../Components/Commons/SecondaryButton';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircle';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function PronunciationCoach({
  pronunciationSentence,
  isPronRecording,
  pronTranscription,
  pronFeedback,
  onStartPronunciationVoice,
  onNextPronSentence,
}) {
  const getFeedbackConfig = (score) => {
    if (score >= 85) {
      return { 
        bg: '#F0FDF4', 
        border: '#BBF7D0', 
        text: '#166534', 
        accent: '#22C55E', 
        emoji: '🎉', 
        msg: 'Perfect pronunciation! Excellent work!' 
      };
    } else if (score >= 60) {
      return { 
        bg: '#FFFBEB', 
        border: '#FDE68A', 
        text: '#92400E', 
        accent: '#F59E0B', 
        emoji: '👍', 
        msg: 'Good effort! Let\'s practice the mispronounced words.' 
      };
    } else {
      return { 
        bg: '#FEF2F2', 
        border: '#FECACA', 
        text: '#991B1B', 
        accent: '#EF4444', 
        emoji: '💪', 
        msg: 'Keep trying! Speak clearly and try again.' 
      };
    }
  };

  const feedbackStyle = pronFeedback ? getFeedbackConfig(pronFeedback.score) : null;

  // Text-To-Speech Playback
  const handlePlayAudio = () => {
    if ('speechSynthesis' in window) {
      // Cancel any active speech first to avoid overlapping
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(pronunciationSentence);
      utterance.lang = 'en-US';
      utterance.rate = 0.85; // Slightly slower for clear instruction
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech audio is not supported in this browser.");
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary' }}>
          Pronunciation Coach 🎙️
        </Typography>
        <SecondaryButton 
          size="small" 
          onClick={onNextPronSentence} 
          disabled={isPronRecording} 
          sx={{ borderRadius: '12px', py: 0.5, px: 2 }}
        >
          Change Sentence 🔄
        </SecondaryButton>
      </Box>

      <Typography variant="body2" sx={{ mb: 2.5, fontSize: '14.5px', fontWeight: 600, color: 'text.secondary' }}>
        Listen to the correct pronunciation first, then tap the mic to read it aloud:
      </Typography>

      {/* Target Sentence Box */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: '#F8FAFC',
          borderRadius: 5,
          border: '1.5px dashed #CBD5E1',
          borderLeft: '5px solid #2563EB',
          position: 'relative',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: 2,
          mb: 4,
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: '#F1F5F9',
            borderColor: '#94A3B8',
          }
        }}
      >
        <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography 
            variant="body1" 
            sx={{ 
              fontStyle: 'italic', 
              fontSize: { xs: '18px', sm: '21px' }, 
              fontWeight: 800, 
              color: '#1E293B', 
              lineHeight: 1.4,
              letterSpacing: '-0.3px',
            }}
          >
            "{pronunciationSentence}"
          </Typography>
        </Box>
        
        {/* Listen Button */}
        <IconButton
          onClick={handlePlayAudio}
          sx={{
            bgcolor: 'primary.light',
            color: 'primary.main',
            p: 2,
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)',
            '&:hover': {
              bgcolor: 'primary.main',
              color: '#ffffff',
              transform: 'scale(1.08)',
            },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          title="Listen to native speaker"
        >
          <VolumeUpIcon sx={{ fontSize: 24 }} />
        </IconButton>
      </Paper>

      {/* Main Microphone Button Area */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <PrimaryButton
          color={isPronRecording ? 'error' : 'primary'}
          onClick={onStartPronunciationVoice}
          startIcon={isPronRecording ? <StopIcon /> : <MicIcon />}
          sx={{
            py: 1.8,
            px: 5,
            borderRadius: '30px',
            minWidth: '260px',
            fontWeight: 800,
            fontSize: '15.5px',
            boxShadow: isPronRecording
              ? '0 8px 24px rgba(239, 68, 68, 0.3)'
              : '0 8px 24px rgba(37, 99, 235, 0.2)',
            position: 'relative',
            ...(isPronRecording && {
              animation: 'pulseRing 1.8s infinite',
              '@keyframes pulseRing': {
                '0%': { transform: 'scale(0.98)', boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.5)' },
                '70%': { transform: 'scale(1.03)', boxShadow: '0 0 0 16px rgba(239, 68, 68, 0)' },
                '100%': { transform: 'scale(0.98)', boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' },
              }
            }),
          }}
        >
          {isPronRecording ? 'Listening closely...' : 'Tap & Read Aloud'}
        </PrimaryButton>
        {isPronRecording && (
          <Typography variant="caption" sx={{ mt: 1.5, color: 'error.main', fontWeight: 700, display: 'block', animation: 'blink 1.2s infinite', '@keyframes blink': { '0%, 100%': { opacity: 0.6 }, '50%': { opacity: 1 } } }}>
            🔴 Speaking now... Speak clearly.
          </Typography>
        )}
      </Box>

      {/* What we heard Transcript */}
      {pronTranscription && (
        <Box sx={{ mt: 2, p: 2.5, bgcolor: '#FAFBFC', borderRadius: 4, border: '1.5px solid #F1F5F9' }}>
          <Typography variant="caption" display="block" sx={{ fontWeight: 800, mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Speech Transcript:
          </Typography>
          <Typography variant="body1" sx={{ color: '#0F172A', fontStyle: 'italic', fontWeight: 700, fontSize: '15.5px' }}>
            "{pronTranscription}"
          </Typography>
        </Box>
      )}

      {/* Accuracy Feedback Panel */}
      {pronFeedback && feedbackStyle && (
        <Box
          sx={{
            mt: 4,
            p: 3.5,
            borderRadius: 5,
            bgcolor: feedbackStyle.bg,
            border: `1.5px solid ${feedbackStyle.border}`,
            borderLeft: `6px solid ${feedbackStyle.accent}`,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 3,
            alignItems: 'center',
          }}
        >
          {/* Animated Gauge Ring */}
          <Box 
            sx={{ 
              position: 'relative', 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: `conic-gradient(${feedbackStyle.accent} ${pronFeedback.score * 3.6}deg, #E2E8F0 0deg)`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              flexShrink: 0
            }}
          >
            <Box 
              sx={{ 
                width: 68, 
                height: 68, 
                borderRadius: '50%', 
                bgcolor: '#ffffff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexDirection: 'column' 
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 950, color: feedbackStyle.text, lineHeight: 1, fontSize: '18px' }}>
                {pronFeedback.score}%
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '8px', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
                Score
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h6" sx={{ fontWeight: 900, color: feedbackStyle.text, fontSize: '17px', mb: 0.5 }}>
              {feedbackStyle.emoji} {feedbackStyle.msg}
            </Typography>
            {pronFeedback.mispronouncedWords.length > 0 ? (
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                  Practice target words again:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                  {pronFeedback.mispronouncedWords.map((word, i) => (
                    <Chip
                      key={i}
                      label={word}
                      size="small"
                      color="error"
                      variant="outlined"
                      sx={{
                        fontWeight: 800,
                        fontSize: '12px',
                        borderRadius: '8px',
                        borderWidth: '1.5px',
                        color: '#EF4444',
                        borderColor: '#FCA5A5',
                        bgcolor: '#FEF2F2',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 700, color: '#15803D' }}>
                Wow! Excellent job. Keep it up! ✨
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
