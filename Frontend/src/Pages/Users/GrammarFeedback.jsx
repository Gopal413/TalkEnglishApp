import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Paper, Typography, Button } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MicIcon from '@mui/icons-material/Mic';
import { setTargetSentence } from '../../Redux/Slice/ConversationSlice';

export default function GrammarFeedback() {
  const dispatch = useDispatch();
  // Grab the real-time errors list from the central Redux store
  const { latestErrors } = useSelector((state) => state.conversation);

  // If there are no mistakes in the sentence, render absolutely nothing
  if (!latestErrors || latestErrors.length === 0) return null;

  const handlePracticeSentence = (text) => {
    if (text) {
      dispatch(setTargetSentence(text));
    }
  };

  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 2.5, 
        mb: 2.5, 
        bgcolor: '#FFFDF0',     // Soft educational yellow background
        borderColor: '#FFE082', // Mild warning border color
        borderRadius: '16px',
        boxShadow: '0 4px 14px rgba(255, 224, 130, 0.15)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <InfoOutlinedIcon fontSize="small" color="warning" />
        <Typography variant="caption" fontWeight="800" color="warning.main" sx={{ letterSpacing: '0.5px' }}>
          GENTLE ENGLISH TIP:
        </Typography>
      </Box>

      {latestErrors.map((err, i) => {
        const replacementText = err.replacements && err.replacements[0];
        return (
          <Box key={i} sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
            <Typography variant="caption" display="block" color="text.primary" sx={{ mb: 1.2, lineHeight: 1.5, fontSize: '12px' }}>
              Instead of <s style={{ color: '#D32F2F' }}>"{err.uncleanText}"</s>, try saying: <strong>{err.replacements.join(', ')}</strong> — <span style={{ fontStyle: 'italic', color: '#64748B' }}>{err.message}</span>
            </Typography>
            {replacementText && (
              <Button
                variant="outlined"
                size="small"
                color="primary"
                onClick={() => handlePracticeSentence(replacementText)}
                startIcon={<MicIcon sx={{ fontSize: 13 }} />}
                sx={{ 
                  textTransform: 'none', 
                  fontSize: '11px', 
                  borderRadius: '24px', 
                  px: 2,
                  py: 0.6,
                  fontWeight: '700',
                  borderWidth: '1px',
                  '&:hover': { borderWidth: '1px' }
                }}
              >
                Practice Saying "{replacementText}"
              </Button>
            )}
          </Box>
        );
      })}
    </Paper>
  );
}