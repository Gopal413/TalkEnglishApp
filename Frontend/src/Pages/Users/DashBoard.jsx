import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, LinearProgress,
  Grid, Avatar, Chip, Button, CircularProgress, IconButton,
  Tabs, Tab, TextField, Alert, Card, CardContent,Divider 
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { getUserProgress, getAllLessonsApi, checkGrammarApi } from '../../api/authApi';

import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import ForumIcon from '@mui/icons-material/Forum';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SchoolIcon from '@mui/icons-material/School';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const TEAL = '#4A9B9B';
const TEAL_LIGHT = '#E8F4F4';
const CORAL = '#E07B6A';
const CORAL_LIGHT = '#FDF0EE';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [lessonStats, setLessonStats] = useState({ total: 0, completed: 0 });
  const [activeTab, setActiveTab] = useState(0);

  // 🌅 Warm-up State
  const [warmupPrompt, setWarmupPrompt] = useState('Describe your favorite hobby and why you enjoy it.');
  const [warmupInput, setWarmupInput] = useState('');
  const [isWarmupRecording, setIsWarmupRecording] = useState(false);
  const [warmupFeedback, setWarmupFeedback] = useState(null);
  const [checkingWarmup, setCheckingWarmup] = useState(false);

  // 🎙️ Pronunciation Coach State
  const [pronunciationSentence, setPronunciationSentence] = useState('Speaking a new language requires patience and daily practice.');
  const [isPronRecording, setIsPronRecording] = useState(false);
  const [pronFeedback, setPronFeedback] = useState(null);
  const [pronTranscription, setPronTranscription] = useState('');

  // ✍️ Freeform Grammar Coach State
  const [grammarInput, setGrammarInput] = useState('');
  const [checkingGrammar, setCheckingGrammar] = useState(false);
  const [grammarFeedback, setGrammarFeedback] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getUserProgress();
        setStats(data);
      } catch (err) {
        console.log("Stats load failed silently:", err.message);
      } finally {
        setLoadingStats(false);
      }
    };
    const loadLessonStats = async () => {
      try {
        const data = await getAllLessonsApi();
        setLessonStats({ total: data.lessons?.length || 0, completed: data.totalCompleted || 0 });
      } catch (err) {
        // silently fail
      }
    };
    loadStats();
    loadLessonStats();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // 🌅 Voice dictation helper for Daily Warm-up
  const startWarmupVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser speech-to-text is not supported. Please use Google Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsWarmupRecording(true);
    recognition.onend = () => setIsWarmupRecording(false);
    recognition.onerror = (e) => {
      console.error(e);
      setIsWarmupRecording(false);
    };
    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setWarmupInput(prev => prev + (prev ? ' ' : '') + spokenText);
    };
    recognition.start();
  };

  // 🌅 Analyze Grammar for Daily Warm-up
  const handleCheckWarmup = async () => {
    if (!warmupInput) return;
    setCheckingWarmup(true);
    try {
      const res = await checkGrammarApi(warmupInput);
      setWarmupFeedback(res);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingWarmup(false);
    }
  };

  const handleNextWarmup = () => {
    const prompts = [
      'What did you have for breakfast today and how did it taste?',
      'If you could travel anywhere right now, where would you go and why?',
      'Describe the weather outside your window at this moment.',
      'What is your favorite book or movie, and what is it about?',
      'What did you do last weekend? Talk about your activities.'
    ];
    const randomIndex = Math.floor(Math.random() * prompts.length);
    setWarmupPrompt(prompts[randomIndex]);
    setWarmupInput('');
    setWarmupFeedback(null);
  };

  // 🎙️ Grade pronunciation helper
  const calculatePronunciationScore = (target, spoken) => {
    const cleanStr = (str) => str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").split(/\s+/);
    const targetWords = cleanStr(target).filter(w => w.length > 0);
    const spokenWords = cleanStr(spoken).filter(w => w.length > 0);
    
    let matchedCount = 0;
    const mispronounced = [];
    
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

  // 🎙️ Pronunciation microphone control
  const startPronunciationVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser speech-to-text is not supported. Please use Google Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsPronRecording(true);
      setPronTranscription('');
      setPronFeedback(null);
    };
    recognition.onend = () => {
      setIsPronRecording(false);
    };
    recognition.onerror = (e) => {
      console.error(e);
      setIsPronRecording(false);
    };
    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setPronTranscription(spokenText);
      const grade = calculatePronunciationScore(pronunciationSentence, spokenText);
      setPronFeedback(grade);
    };
    recognition.start();
  };

  const handleNextPronSentence = () => {
    const sentences = [
      'The receptionist greeted the guests with a warm smile.',
      'Learning pronunciation requires listening carefully to native speech.',
      'We decided to buy some groceries for our weekend camping trip.',
      'Technology has transformed the way people communicate across borders.',
      'She ordered a chocolate croissant and a cup of black coffee.'
    ];
    const randomIndex = Math.floor(Math.random() * sentences.length);
    setPronunciationSentence(sentences[randomIndex]);
    setPronFeedback(null);
    setPronTranscription('');
  };

  // ✍️ Freeform Grammar checker controller
  const handleCheckFreeformGrammar = async () => {
    if (!grammarInput) return;
    setCheckingGrammar(true);
    try {
      const res = await checkGrammarApi(grammarInput);
      setGrammarFeedback(res);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingGrammar(false);
    }
  };

  const handleResetFreeform = () => {
    setGrammarInput('');
    setGrammarFeedback(null);
  };

  const levelTarget = 10;
  const conversationsDone = stats?.totalConversations || 0;
  const goalPct = Math.min(Math.round((conversationsDone / levelTarget) * 100), 100);

  const levelColors = {
    beginner: { color: '#27AE60', label: 'Beginner' },
    intermediate: { color: '#F39C12', label: 'Intermediate' },
    advanced: { color: '#E74C3C', label: 'Advanced' }
  };
  const lvl = levelColors[user?.level] || levelColors.beginner;

  return (
    <Box sx={{ bgcolor: '#F7F9FC', minHeight: '100vh', pb: { xs: 12, md: 8 } }}>
      {/* Hero Profile Banner Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${TEAL} 0%, #2D7D7D 100%)`,
          pt: { xs: 4, sm: 6 },
          pb: { xs: 6, sm: 8 },
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          mb: 4
        }}
      >
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)' }} />
        <Box sx={{ position: 'absolute', bottom: -20, right: 60, width: 90, height: 90, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />

        <Container maxWidth="lg">
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 2 }}>
                <Avatar
                  sx={{
                    width: 64, height: 64,
                    bgcolor: 'rgba(255,255,255,0.22)',
                    fontWeight: '800',
                    fontSize: '24px',
                    color: '#fff',
                    border: '3px solid rgba(255,255,255,0.4)'
                  }}
                >
                  {(user?.name || 'U')[0].toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>Welcome back,</Typography>
                  <Typography variant="h4" fontWeight="900" sx={{ lineHeight: 1.2 }}>
                    {user?.name || 'Learner'}
                  </Typography>
                  <Chip
                    label={`${lvl.label} Level`}
                    size="small"
                    sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.25)', color: '#fff', fontWeight: 'bold' }}
                  />
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  borderRadius: 3, 
                  bgcolor: 'rgba(255,255,255,0.12)', 
                  backdropFilter: 'blur(10px)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'rgba(255,255,255,0.9)' }}>
                    Daily Goal Progress
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: '900' }}>
                    {goalPct}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={goalPct}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: CORAL,
                      borderRadius: 4
                    }
                  }}
                />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.8, display: 'block', fontSize: '11px' }}>
                  {conversationsDone}/{levelTarget} chat sessions completed
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Content Grid */}
      <Container maxWidth="lg">
        {/* Core Stats Row */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {[
            { label: 'Day Streak', value: loadingStats ? '—' : (stats?.streak || 0), icon: <LocalFireDepartmentIcon sx={{ color: '#FF6B35', fontSize: 24 }} />, bg: '#FFF3ED' },
            { label: 'Conversations', value: loadingStats ? '—' : conversationsDone, icon: <AutoGraphIcon sx={{ color: TEAL, fontSize: 24 }} />, bg: TEAL_LIGHT },
            { label: 'Unlocked Vocab', value: loadingStats ? '—' : (stats?.uniqueVocabulary?.length || 0), icon: <SchoolIcon sx={{ color: '#7B68EE', fontSize: 24 }} />, bg: '#F0EEFF' },
            { label: 'Average Accuracy', value: loadingStats ? '—' : `${stats?.averageScore || 0}%`, icon: <EmojiEventsIcon sx={{ color: CORAL, fontSize: 24 }} />, bg: CORAL_LIGHT },
          ].map((s) => (
            <Grid item xs={6} sm={3} key={s.label}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2.5, 
                  borderRadius: '16px', 
                  bgcolor: s.bg, 
                  textAlign: 'center', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  border: '1px solid rgba(0,0,0,0.03)'
                }}
              >
                <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.6)', mb: 1, display: 'flex' }}>
                  {s.icon}
                </Box>
                <Typography variant="h5" fontWeight="900" sx={{ lineHeight: 1.1, mt: 0.5, fontSize: '24px', color: '#1a1a2e' }}>
                  {s.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '12px', fontWeight: '500' }}>
                  {s.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* 2-Column Responsive Workspace Grid */}
        <Grid container spacing={4}>
          
          {/* Left Column: Core Activities (Tabs Box) */}
          <Grid item xs={12} md={8}>
            <Paper 
              elevation={0}
              sx={{ 
                borderRadius: '20px', 
                overflow: 'hidden', 
                border: '1px solid rgba(0,0,0,0.05)',
                bgcolor: '#fff',
                mb: 4
              }}
            >
              {/* Tool Navigation Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#F8FAFC' }}>
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange} 
                  variant="scrollable"
                  scrollButtons="auto"
                  textColor="primary"
                  indicatorColor="primary"
                  sx={{ px: 2 }}
                >
                  <Tab label="🌅 Daily Warm-up" sx={{ py: 2, fontWeight: '700', textTransform: 'none' }} />
                  <Tab label="🎙️ Pronunciation Coach" sx={{ py: 2, fontWeight: '700', textTransform: 'none' }} />
                  <Tab label="✍️ Grammar Checker" sx={{ py: 2, fontWeight: '700', textTransform: 'none' }} />
                </Tabs>
              </Box>

              {/* Tab 0: Daily English Warm-up */}
              {activeTab === 0 && (
                <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
                    <Typography variant="h6" fontWeight="800">Today's Writing Prompt</Typography>
                    <Button variant="text" size="small" onClick={handleNextWarmup} sx={{ fontWeight: 'bold' }}>
                      Change Prompt 🔄
                    </Button>
                  </Box>
                  
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      bgcolor: '#F8FAFC', 
                      borderRadius: '12px', 
                      borderLeft: `4px solid ${TEAL}`,
                      mb: 3 
                    }}
                  >
                    <Typography variant="body1" fontWeight="600" color="text.primary">
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
                    InputProps={{
                      sx: { borderRadius: '12px' }
                    }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, flexWrap: 'wrap', gap: 2 }}>
                    <Button 
                      variant="outlined" 
                      color={isWarmupRecording ? "error" : "primary"}
                      onClick={startWarmupVoice}
                      startIcon={isWarmupRecording ? <StopIcon /> : <MicIcon />}
                      disabled={checkingWarmup}
                      sx={{ borderRadius: '24px' }}
                    >
                      {isWarmupRecording ? 'Listening...' : 'Voice Dictate'}
                    </Button>

                    <Button 
                      variant="contained" 
                      onClick={handleCheckWarmup}
                      disabled={checkingWarmup || !warmupInput}
                      startIcon={checkingWarmup ? <CircularProgress size={18} color="inherit" /> : <AutoFixHighIcon />}
                    >
                      Analyze Warm-up
                    </Button>
                  </Box>

                  {warmupFeedback && (
                    <Box sx={{ mt: 4 }}>
                      <Divider sx={{ mb: 3 }} />
                      <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1.5 }}>Grammar Feedback</Typography>
                      {warmupFeedback.isValid ? (
                        <Alert icon={<CheckCircleOutlineIcon fontSize="inherit" />} severity="success" sx={{ borderRadius: '12px' }}>
                          Superb! No grammatical errors found. You expressed your thoughts correctly! 🎉
                        </Alert>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {warmupFeedback.errors.map((err, i) => (
                            <Paper 
                              key={i} 
                              variant="outlined" 
                              sx={{ 
                                p: 2, 
                                bgcolor: '#FFFDE7', 
                                borderColor: '#fff59d', 
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1.5 
                              }}
                            >
                              <InfoOutlinedIcon color="warning" sx={{ mt: 0.3 }} />
                              <Box>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                  Instead of <s>"{err.uncleanText}"</s>, try saying:{' '}
                                  <strong style={{ color: TEAL }}>{err.replacements.join(', ')}</strong>
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic' }}>
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
              )}

              {/* Tab 1: Interactive Pronunciation Coach */}
              {activeTab === 1 && (
                <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
                    <Typography variant="h6" fontWeight="800">Pronunciation Practice</Typography>
                    <Button variant="text" size="small" onClick={handleNextPronSentence} sx={{ fontWeight: 'bold' }}>
                      Change Sentence 🔄
                    </Button>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Click the microphone button and read this sentence aloud:
                  </Typography>

                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2.5, 
                      bgcolor: '#F8FAFC', 
                      borderRadius: '12px', 
                      borderLeft: '4px solid #1976d2',
                      fontStyle: 'italic',
                      fontSize: '18px',
                      fontWeight: '500',
                      mb: 3 
                    }}
                  >
                    "{pronunciationSentence}"
                  </Paper>

                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <Button
                      variant="contained"
                      color={isPronRecording ? "error" : "primary"}
                      onClick={startPronunciationVoice}
                      startIcon={isPronRecording ? <StopIcon /> : <MicIcon />}
                      sx={{ py: 1.6, px: 4, borderRadius: '24px', minWidth: '220px' }}
                    >
                      {isPronRecording ? 'Listening Closely...' : 'Read Aloud'}
                    </Button>
                  </Box>

                  {pronTranscription && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#ffffff', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)' }}>
                      <Typography variant="caption" display="block" color="text.secondary">
                        <strong>What we heard:</strong>
                      </Typography>
                      <Typography variant="body1">"{pronTranscription}"</Typography>
                    </Box>
                  )}

                  {pronFeedback && (
                    <Box 
                      sx={{ 
                        mt: 3, 
                        p: 2.5, 
                        borderRadius: '12px', 
                        bgcolor: pronFeedback.score >= 85 ? '#E8F5E9' : pronFeedback.score >= 60 ? '#FFFDE7' : '#FFEBEE',
                        borderLeft: `5px solid ${pronFeedback.score >= 85 ? '#2e7d32' : pronFeedback.score >= 60 ? '#fbc02d' : '#d32f2f'}`,
                        display: 'flex',
                        gap: 2,
                        alignItems: 'center'
                      }}
                    >
                      <CheckCircleOutlineIcon color={pronFeedback.score >= 85 ? "success" : "warning"} sx={{ fontSize: '32px' }} />
                      <Box>
                        <Typography variant="h6" fontWeight="800" color={pronFeedback.score >= 85 ? "success.main" : "text.primary"}>
                          Accuracy: {pronFeedback.score}%
                        </Typography>
                        {pronFeedback.mispronouncedWords.length > 0 ? (
                          <Typography variant="body2" color="error.main" sx={{ mt: 0.5 }}>
                            Oops! Try practicing these words again:{' '}
                            <strong>{pronFeedback.mispronouncedWords.join(', ')}</strong>
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="success.main" sx={{ mt: 0.5 }}>
                            Perfect pronunciation! Excellent work! 🎉
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              {/* Tab 2: Freeform Grammar Coach */}
              {activeTab === 2 && (
                <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
                  <Typography variant="h6" fontWeight="800" sx={{ mb: 1 }}>Writing Grammar Checker</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
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
                    InputProps={{
                      sx: { borderRadius: '12px' }
                    }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                    <Button 
                      variant="outlined" 
                      onClick={handleResetFreeform} 
                      disabled={checkingGrammar}
                    >
                      Clear
                    </Button>
                    <Button 
                      variant="contained" 
                      onClick={handleCheckFreeformGrammar}
                      disabled={checkingGrammar || !grammarInput}
                      startIcon={checkingGrammar ? <CircularProgress size={18} color="inherit" /> : <AutoFixHighIcon />}
                    >
                      Analyze Writing
                    </Button>
                  </Box>

                  {grammarFeedback && (
                    <Box sx={{ mt: 4 }}>
                      <Divider sx={{ mb: 3 }} />
                      <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1.5 }}>Correction Details</Typography>
                      {grammarFeedback.isValid ? (
                        <Alert severity="success" sx={{ borderRadius: '12px' }}>
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
                                bgcolor: '#FFFDE7', 
                                borderColor: '#fff59d', 
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1.5 
                              }}
                            >
                              <InfoOutlinedIcon color="warning" sx={{ mt: 0.3 }} />
                              <Box>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                  Mistake: <s style={{ color: 'red' }}>"{err.uncleanText}"</s> → Replace with:{' '}
                                  <strong style={{ color: TEAL }}>{err.replacements.join(', ')}</strong>
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic' }}>
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
              )}
            </Paper>
          </Grid>

          {/* Right Column: Mini Apps & Stats Links */}
          <Grid item xs={12} md={4}>
            
            {/* Luna Chat Quick Panel */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: '20px', 
                border: '1px solid rgba(0,0,0,0.05)',
                bgcolor: '#fff',
                mb: 4,
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Avatar 
                  sx={{ 
                    width: 72, 
                    height: 72, 
                    bgcolor: CORAL_LIGHT, 
                    color: CORAL,
                    border: `3px solid ${CORAL_LIGHT}`,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                  }}
                >
                  <ForumIcon sx={{ fontSize: 36 }} />
                </Avatar>
              </Box>
              <Typography variant="h6" fontWeight="900" sx={{ mb: 0.5 }}>
                Chat with Luna AI
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2.5 }}>
                Online &middot; Adapts difficulty in real-time
              </Typography>
              <Button 
                variant="contained" 
                color="secondary"
                fullWidth
                onClick={() => navigate('/conversation')}
                endIcon={<ArrowForwardIosIcon sx={{ fontSize: 12 }} />}
                sx={{ py: 1.2 }}
              >
                Launch Partner Chat
              </Button>
            </Paper>

            {/* Resume Lessons Panel */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: '20px', 
                border: '1px solid rgba(0,0,0,0.05)',
                bgcolor: '#fff',
                mb: 4,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'primary.light', display: 'flex', color: 'primary.main' }}>
                  <MenuBookIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" fontWeight="800" sx={{ lineHeight: 1.2 }}>
                    Structured Lessons
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Grammar, Vocab & Pronunciation
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">Lessons Finished</Typography>
                  <Typography variant="caption" fontWeight="bold">{lessonStats.completed}/{lessonStats.total}</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={lessonStats.total > 0 ? Math.round((lessonStats.completed / lessonStats.total) * 100) : 0} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3, 
                    bgcolor: 'primary.light', 
                    '& .MuiLinearProgress-bar': { bgcolor: TEAL } 
                  }} 
                />
              </Box>

              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => navigate('/lessons')}
                sx={{ py: 1 }}
              >
                Browse Syllabus
              </Button>
            </Paper>

            {/* Vocabulary Trophy Panel */}
            {stats?.uniqueVocabulary?.length > 0 && (
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  borderRadius: '20px', 
                  border: '1px solid rgba(0,0,0,0.05)',
                  bgcolor: '#fff',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="800">🏅 Unlocked Vocabulary</Typography>
                  <Button variant="text" size="small" onClick={() => navigate('/progress')} sx={{ fontWeight: 'bold', minWidth: 0, p: 0 }}>
                    All
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {stats.uniqueVocabulary.slice(0, 8).map((word) => (
                    <Chip 
                      key={word} 
                      label={word} 
                      size="small" 
                      sx={{ 
                        bgcolor: TEAL_LIGHT, 
                        color: TEAL, 
                        fontWeight: '700', 
                        fontSize: '11px',
                        borderRadius: '6px'
                      }} 
                    />
                  ))}
                  {stats.uniqueVocabulary.length > 8 && (
                    <Chip 
                      label={`+${stats.uniqueVocabulary.length - 8} more`} 
                      size="small" 
                      sx={{ bgcolor: '#f1f5f9', color: 'text.secondary', fontSize: '11px', borderRadius: '6px' }} 
                    />
                  )}
                </Box>
              </Paper>
            )}

          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}