// 📄 Location: src/Components/PronunciationCoach.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircle";
import { setPronunciationResult } from '../../Redux/Slice/ConversationSlice';


export default function PronunciationCoach() {
  const dispatch = useDispatch();
  const { targetSentence, pronunciationScore, mispronouncedWords } = useSelector((state) => state.conversation);
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');

  const calculatePronunciationScore = (target, spoken) => {
    // Clean string utility: lowercase and strip punctuation marks
    const cleanStr = (str) => str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").split(/\s+/);
    
    const targetWords = cleanStr(target).filter(w => w.length > 0);
    const spokenWords = cleanStr(spoken).filter(w => w.length > 0);

    let matchedCount = 0;
    const mispronounced = [];

    // Check which expected words exist in the spoken array
    targetWords.forEach(word => {
      if (spokenWords.includes(word)) {
        matchedCount++;
      } else {
        mispronounced.push(word);
      }
    });

    const finalScore = Math.round((matchedCount / targetWords.length) * 100);

    return {
      score: finalScore,
      mispronouncedWords: mispronounced
    };
  };

  const handleStartSpeaking = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser speech-to-text is not supported. Please use Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsRecording(true);
      setTranscription('');
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      console.error("Pronunciation speech recognition error:", event.error);
      setIsRecording(false);
      if (event.error === 'not-allowed') {
        alert("Microphone access denied. Please click the microphone/lock icon in your browser's address bar to allow microphone access for TalkEnglish.");
      } else {
        alert(`Microphone error: ${event.error}. Please check connection and try again.`);
      }
    };

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setTranscription(spokenText);

      // Run our grading algorithm
      const result = calculatePronunciationScore(targetSentence, spokenText);
      
      // Save result directly to Redux store
      dispatch(setPronunciationResult(result));
    };

    recognition.start();
  };

  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: '16px', 
        bgcolor: '#FAFBFC',
        border: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 4px 14px rgba(0,0,0,0.01)'
      }}
    >
      <Typography variant="subtitle2" fontWeight="800" color="primary" gutterBottom sx={{ fontSize: '12px', letterSpacing: '0.5px' }}>
        🎙️ PRONUNCIATION COACH MODE:
      </Typography>
      
      <Typography 
        variant="body1" 
        sx={{ 
          my: 2, 
          p: 2, 
          bgcolor: 'rgba(25, 118, 210, 0.03)', 
          borderRadius: '12px', 
          borderLeft: '4px solid #1976d2', 
          fontStyle: 'italic',
          color: '#1E293B',
          fontWeight: '500',
          fontSize: '14.5px',
          lineHeight: 1.5
        }}
      >
        "{targetSentence}"
      </Typography>

      <Button 
        variant="contained" 
        color={isRecording ? "error" : "primary"} 
        onClick={handleStartSpeaking}
        startIcon={isRecording ? <StopIcon /> : <MicIcon />}
        sx={{ 
          borderRadius: '24px', 
          mb: 2.5,
          px: 3,
          py: 1,
          fontWeight: '700',
          fontSize: '13px',
          textTransform: 'none',
          boxShadow: isRecording ? '0 4px 12px rgba(211,47,47,0.25)' : '0 4px 12px rgba(25, 118, 210, 0.25)'
        }}
      >
        {isRecording ? "Listening closely..." : "Read Sentence Aloud"}
      </Button>

      {transcription && (
        <Box sx={{ mt: 1, mb: 2 }}>
          <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '12px' }}>
            <strong style={{ color: '#1E293B' }}>What I Heard:</strong> "{transcription}"
          </Typography>
        </Box>
      )}

      {pronunciationScore !== null && (
        <Box 
          sx={{ 
            mt: 2, 
            p: 2.5, 
            bgcolor: pronunciationScore >= 80 ? '#E8F5E9' : '#FFEBEE', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            border: pronunciationScore >= 80 ? '1px solid #C8E6C9' : '1px solid #FFCDD2'
          }}
        >
          <CheckCircleOutlineIcon color={pronunciationScore >= 80 ? "success" : "error"} sx={{ fontSize: '28px' }} />
          <Box>
            <Typography variant="body2" fontWeight="800" color={pronunciationScore >= 80 ? "success.main" : "error.main"} sx={{ fontSize: '14.5px' }}>
              Accuracy Score: {pronunciationScore}%
            </Typography>
            {mispronouncedWords.length > 0 ? (
              <Typography variant="caption" display="block" color="error.main" sx={{ mt: 0.5, fontWeight: '500', fontSize: '11px' }}>
                Try practicing these words again: <strong style={{ textDecoration: 'underline' }}>{mispronouncedWords.join(', ')}</strong>
              </Typography>
            ) : (
              <Typography variant="caption" display="block" color="success.main" sx={{ mt: 0.5, fontWeight: '500', fontSize: '11px' }}>
                Perfect pronunciation! Excellent work! 🎉
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
}