import React from 'react';
import { Box, Typography, TextField, Paper, Divider, Alert } from '@mui/material';
import PrimaryButton from '../../../Components/Commons/PrimaryButton';
import SecondaryButton from '../../../Components/Commons/SecondaryButton';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function GrammarChecker({
  grammarInput,
  setGrammarInput,
  checkingGrammar,
  grammarFeedback,
  onCheckFreeformGrammar,
  onResetFreeform,
}) {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
        Writing Grammar Checker
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, fontSize: '14px', fontWeight: 600, color: 'text.secondary' }}>
        Paste a draft email, sentence, or article to analyze structural mistakes and receive suggestions.
      </Typography>

      <TextField
        fullWidth
        multiline
        rows={6}
        value={grammarInput}
        onChange={(e) => setGrammarInput(e.target.value)}
        placeholder="Enter your paragraph here..."
        disabled={checkingGrammar}
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

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <SecondaryButton onClick={onResetFreeform} disabled={checkingGrammar} sx={{ borderRadius: '24px', px: 3 }}>
          Clear
        </SecondaryButton>
        <PrimaryButton
          onClick={onCheckFreeformGrammar}
          disabled={checkingGrammar || !grammarInput.trim()}
          loading={checkingGrammar}
          startIcon={<AutoFixHighIcon />}
          sx={{
            borderRadius: '24px',
            px: 3.5,
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
          }}
        >
          Analyze Writing
        </PrimaryButton>
      </Box>

      {grammarFeedback && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 900 }}>
            Correction Details
          </Typography>
          {grammarFeedback.isValid ? (
            <Alert
              severity="success"
              sx={{
                borderRadius: 4, // 16px
                fontWeight: 600,
                bgcolor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                color: '#166534',
              }}
            >
              Everything looks great! No spelling or grammatical mistakes were detected in this paragraph. 🎉
            </Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {grammarFeedback.errors.map((err, i) => (
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
                      Mistake: <s style={{ color: '#EF4444' }}>"{err.uncleanText}"</s> → Replace with:{' '}
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
