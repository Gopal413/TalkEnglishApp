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
        p: 2, 
        mb: 2, 
        bgcolor: '#fffde7',     // Soft educational yellow background
        borderColor: '#fff59d', // Mild warning border color
        borderRadius: 3 
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <InfoOutlinedIcon fontSize="small" color="warning" />
        <Typography variant="caption" fontWeight="bold" color="warning.main">
          GENTLE ENGLISH TIP:
        </Typography>
      </Box>

      {latestErrors.map((err, i) => {
        const replacementText = err.replacements && err.replacements[0];
        return (
          <Box key={i} sx={{ mb: 1.5, '&:last-child': { mb: 0 } }}>
            <Typography variant="caption" display="block" color="text.primary" sx={{ mb: 1 }}>
              Instead of <s>"{err.uncleanText}"</s>, try saying: <strong>{err.replacements.join(', ')}</strong> — <em>{err.message}</em>
            </Typography>
            {replacementText && (
              <Button
                variant="outlined"
                size="small"
                color="primary"
                onClick={() => handlePracticeSentence(replacementText)}
                startIcon={<MicIcon sx={{ fontSize: 14 }} />}
                sx={{ textTransform: 'none', fontSize: '11px', borderRadius: 2, py: 0.3 }}
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