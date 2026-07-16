import React from 'react';
import { Box, Typography, TextField, Paper, Divider, Alert } from '@mui/material';
import PrimaryButton from '../../../Components/Commons/PrimaryButton';
import SecondaryButton from '../../../Components/Commons/SecondaryButton';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircle';
import EditNoteIcon from '@mui/icons-material/EditNote';

export default function GrammarChecker({
  grammarInput,
  setGrammarInput,
  checkingGrammar,
  grammarFeedback,
  onCheckFreeformGrammar,
  onResetFreeform,
}) {
  const charCount = grammarInput.length;
  const wordCount = grammarInput.trim() === '' ? 0 : grammarInput.trim().split(/\s+/).length;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <Box sx={{ display: 'flex', p: 1, borderRadius: '12px', bgcolor: 'primary.light', color: 'primary.main' }}>
          <EditNoteIcon sx={{ fontSize: 22 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          Writing Grammar Checker
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ mb: 3, fontSize: '14.5px', fontWeight: 600, color: 'text.secondary' }}>
        Paste a draft email, sentence, or article to analyze structural mistakes and receive suggestions.
      </Typography>

      <TextField
        fullWidth
        multiline
        rows={6}
        value={grammarInput}
        onChange={(e) => setGrammarInput(e.target.value)}
        placeholder="Enter your paragraph or sentence here to check spelling, grammar, and vocabulary usage..."
        disabled={checkingGrammar}
        slotProps={{
          input: {
            sx: {
              borderRadius: 5, // 20px
              bgcolor: '#FFFFFF',
              p: 2.5,
              fontSize: '15px',
            },
          },
        }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, flexWrap: 'wrap', gap: 2 }}>
        {/* Character and Word Counts */}
        <Box sx={{ display: 'flex', gap: 2, color: 'text.disabled' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '12px' }}>
            Words: <span style={{ color: '#475569' }}>{wordCount}</span>
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '12px' }}>
            Characters: <span style={{ color: '#475569' }}>{charCount}</span>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <SecondaryButton 
            onClick={onResetFreeform} 
            disabled={checkingGrammar || !grammarInput} 
            sx={{ borderRadius: '24px', px: 3.5 }}
          >
            Clear
          </SecondaryButton>
          <PrimaryButton
            onClick={onCheckFreeformGrammar}
            disabled={checkingGrammar || !grammarInput.trim()}
            loading={checkingGrammar}
            startIcon={<AutoFixHighIcon />}
            sx={{
              borderRadius: '24px',
              px: 4,
              boxShadow: '0 6px 16px rgba(37, 99, 235, 0.2)',
            }}
          >
            Analyze Writing
          </PrimaryButton>
        </Box>
      </Box>

      {grammarFeedback && (
        <Box sx={{ mt: 4.5 }}>
          <Divider sx={{ mb: 3.5 }} />
          <Typography variant="subtitle1" sx={{ mb: 2.5, fontWeight: 900, color: 'text.primary' }}>
            Correction Details ✨
          </Typography>
          
          {grammarFeedback.isValid ? (
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
              Everything looks great! No spelling or grammatical mistakes were detected in this paragraph. 🎉
            </Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {grammarFeedback.errors.map((err, i) => (
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
                          Original
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
                          Suggested
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
