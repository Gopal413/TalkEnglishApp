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
    <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 3, bgcolor: '#f4f6f8' }}>
      <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
        🎙️ PRONUNCIATION COACH MODE:
      </Typography>
      
      <Typography variant="body1" sx={{ my: 1.5, p: 1.5, bgcolor: '#ffffff', borderRadius: 2, borderLeft: '4px solid #1976d2', fontStyle: 'italic' }}>
        "{targetSentence}"
      </Typography>

      <Button 
        variant="contained" 
        color={isRecording ? "error" : "primary"} 
        onClick={handleStartSpeaking}
        startIcon={isRecording ? <StopIcon /> : <MicIcon />}
        sx={{ borderRadius: 5, mb: 2 }}
      >
        {isRecording ? "Listening closely..." : "Read Sentence Aloud"}
      </Button>

      {transcription && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" display="block" color="text.secondary">
            <strong>What I Heard:</strong> "{transcription}"
          </Typography>
        </Box>
      )}

      {pronunciationScore !== null && (
        <Box sx={{ mt: 2, p: 1.5, bgcolor: '#e8f5e9', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CheckCircleOutlineIcon color="success" />
          <Box>
            <Typography variant="body2" fontWeight="bold" color="success.main">
              Accuracy Score: {pronunciationScore}%
            </Typography>
            {mispronouncedWords.length > 0 ? (
              <Typography variant="caption" display="block" color="error.main">
                Try practicing these words again: <strong>{mispronouncedWords.join(', ')}</strong>
              </Typography>
            ) : (
              <Typography variant="caption" display="block" color="success.main">
                Perfect pronunciation! Excellent work! 🎉
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
}