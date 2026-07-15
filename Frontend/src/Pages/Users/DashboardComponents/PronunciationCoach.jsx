import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import PrimaryButton from '../../../Components/Commons/PrimaryButton';
import SecondaryButton from '../../../Components/Commons/SecondaryButton';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircle';

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
      return { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534' };
    } else if (score >= 60) {
      return { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' };
    } else {
      return { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B' };
    }
  };

  const feedbackStyle = pronFeedback ? getFeedbackConfig(pronFeedback.score) : null;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          Pronunciation Practice
        </Typography>
        <SecondaryButton size="small" onClick={onNextPronSentence} disabled={isPronRecording} sx={{ borderRadius: '12px', py: 0.5, px: 2 }}>
          Change Sentence 🔄
        </SecondaryButton>
      </Box>

      <Typography variant="body2" sx={{ mb: 2, fontSize: '14px', fontWeight: 600, color: 'text.secondary' }}>
        Click the microphone button and read this sentence aloud:
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: '#F1F5F9',
          borderRadius: 4, // 16px
          borderLeft: '4px solid #3B82F6',
          fontStyle: 'italic',
          fontSize: '18px',
          fontWeight: 700,
          color: '#1E293B',
          mb: 3,
        }}
      >
        "{pronunciationSentence}"
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <PrimaryButton
          color={isPronRecording ? 'error' : 'primary'}
          onClick={onStartPronunciationVoice}
          startIcon={isPronRecording ? <StopIcon /> : <MicIcon />}
          sx={{
            py: 1.6,
            px: 4.5,
            borderRadius: '28px',
            minWidth: '240px',
            fontWeight: 800,
            fontSize: '15px',
            boxShadow: isPronRecording
              ? '0 4px 15px rgba(239, 68, 68, 0.25)'
              : '0 4px 15px rgba(37, 99, 235, 0.25)',
          }}
        >
          {isPronRecording ? 'Listening Closely...' : 'Read Aloud'}
        </PrimaryButton>
      </Box>

      {pronTranscription && (
        <Box sx={{ mt: 2, p: 2.5, bgcolor: '#F8FAFC', borderRadius: 4, border: '1px solid #E2E8F0' }}>
          <Typography variant="caption" display="block" sx={{ fontWeight: 700, mb: 0.5, color: 'text.secondary' }}>
            What we heard:
          </Typography>
          <Typography variant="body1" sx={{ color: '#1E293B', fontStyle: 'italic', fontWeight: 600 }}>
            "{pronTranscription}"
          </Typography>
        </Box>
      )}

      {pronFeedback && feedbackStyle && (
        <Box
          sx={{
            mt: 4,
            p: 3,
            borderRadius: 4, // 16px
            bgcolor: feedbackStyle.bg,
            borderLeft: `5px solid ${feedbackStyle.text}`,
            display: 'flex',
            gap: 2.5,
            alignItems: 'center',
          }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: '36px', color: feedbackStyle.text }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: feedbackStyle.text, fontSize: '18px' }}>
              Accuracy Score: {pronFeedback.score}%
            </Typography>
            {pronFeedback.mispronouncedWords.length > 0 ? (
              <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600, color: 'text.primary' }}>
                Oops! Try practicing these words again:{' '}
                <strong style={{ textDecoration: 'underline', color: '#EF4444' }}>
                  {pronFeedback.mispronouncedWords.join(', ')}
                </strong>
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600, color: feedbackStyle.text }}>
                Perfect pronunciation! Excellent work! 🎉
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
