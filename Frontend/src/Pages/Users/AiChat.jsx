import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Button, 
  TextField, 
  IconButton, 
  Typography, 
  Paper, 
  CircularProgress, 
  Container, 
  Grid, 
  Tabs, 
  Tab, 
  Card, 
  CardContent, 
  CardActionArea,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  Tooltip
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import SendIcon from '@mui/icons-material/Send';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import PsychologyIcon from '@mui/icons-material/Psychology';
import StarsIcon from '@mui/icons-material/Stars';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import ForumIcon from '@mui/icons-material/Forum';
import LanguageIcon from '@mui/icons-material/Language';
import SpeedIcon from '@mui/icons-material/Speed';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';

import { startConversationApi, sendConversationMessageApi, endConversationApi, checkGrammarApi } from "../../api/AiApi";
import { translateTextApi, getUserProfile } from "../../api/authApi";
import { 
  setSessionStart, 
  addUserMessage, 
  addAiResponse, 
  setSessionEnd, 
  resetChatState, 
  setLatestGrammarErrors 
} from '../../Redux/Slice/ConversationSlice';
import PronunciationCoach from './PronunciationCoach';
import GrammarFeedback from './GrammarFeedback';

// Define gorgeous categorized learning scenarios
const PRESET_SCENARIOS = [
  {
    id: 'airport_checkin',
    name: 'Airport Check-in ✈️',
    category: 'travel',
    topic: 'At the Airport Counter',
    icon: <FlightTakeoffIcon color="primary" />,
    missionText: 'Confirm your window seat reservation, check in one luggage bag, and ask for the boarding gate.',
    targetVocabulary: ['reservation', 'luggage', 'boarding gate'],
    description: 'Get ready for travel by communicating with airline staff.'
  },
  {
    id: 'hotel_booking',
    name: 'Hotel Registration 🏨',
    category: 'travel',
    topic: 'Checking into a Hotel Room',
    icon: <FlightTakeoffIcon color="secondary" />,
    missionText: 'Check in for your deluxe room booking, request the Wi-Fi password, and ask what time breakfast is served.',
    targetVocabulary: ['check-in', 'password', 'breakfast'],
    description: 'Practice check-in processes and asking about hotel amenities.'
  },
  {
    id: 'ordering_food',
    name: 'Ordering Dinner 🍔',
    category: 'travel',
    topic: 'Ordering at a Restaurant',
    icon: <FlightTakeoffIcon color="success" />,
    missionText: 'Order a medium-rare steak, select a beverage, and politely ask for the bill/check.',
    targetVocabulary: ['medium-rare', 'beverage', 'bill'],
    description: 'Practice dining out interactions and making custom food requests.'
  },
  {
    id: 'job_interview',
    name: 'Job Interview Prep 👔',
    category: 'business',
    topic: 'Answering Interview Questions',
    icon: <BusinessCenterIcon color="primary" />,
    missionText: 'Introduce your qualifications, mention your professional skills, and request salary range details.',
    targetVocabulary: ['experience', 'qualifications', 'salary range'],
    description: 'Practice speaking confidently with recruiters and describing work achievements.'
  },
  {
    id: 'salary_negotiation',
    name: 'Salary Negotiation 💰',
    category: 'business',
    topic: 'Negotiating pay package details',
    icon: <BusinessCenterIcon color="success" />,
    missionText: 'Explain your contribution value, present competitive market figures, and ask if the base salary is flexible.',
    targetVocabulary: ['contribution', 'market value', 'flexible'],
    description: 'Practice negotiation techniques to secure better pay packages.'
  },
  {
    id: 'office_chitchat',
    name: 'Office Watercooler 👋',
    category: 'business',
    topic: 'Watercooler discussion with colleague',
    icon: <BusinessCenterIcon color="warning" />,
    missionText: 'Chat about weekend relaxation plans, ask about your coworker\'s projects, and suggest grabing lunch.',
    targetVocabulary: ['weekend', 'project', 'lunch'],
    description: 'Build confidence with office small talk and friendly colleague chats.'
  },
  {
    id: 'ordering_coffee',
    name: 'Ordering Coffee ☕',
    category: 'daily',
    topic: 'At a Coffee Shop Counter',
    icon: <LocalCafeIcon color="primary" />,
    missionText: 'Order a hot caramel latte, specify your preferred caffeine level (decaf), and ask for a receipt.',
    targetVocabulary: ['caramel latte', 'decaf', 'receipt'],
    description: 'Quick friendly interaction with a barista.'
  },
  {
    id: 'making_plans',
    name: 'Weekend Movie Plans 🗓️',
    category: 'daily',
    topic: 'Planning with a Friend',
    icon: <LocalCafeIcon color="secondary" />,
    missionText: 'Invite your friend to watch a newly released movie, agree on a time, and choose a theater location.',
    targetVocabulary: ['cinema', 'schedule', 'popcorn'],
    description: 'Coordinate activities, dates, and plans with acquaintances.'
  }
];

export default function AiChat() {
  const dispatch = useDispatch();
  const chatEndRef = useRef(null);
  
  // Redux chat variables
  const { messages, conversationId, isLoading, sessionSummary } = useSelector((state) => state.conversation);
  
  // Form and setup configuration states
  const [activeTab, setActiveTab] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [topic, setTopic] = useState('General Conversation');
  const [mode, setMode] = useState('freeTalk');
  const [level, setLevel] = useState('beginner');
  const [adaptiveMode, setAdaptiveMode] = useState(true);

  // Gamification tracking states
  const [missionText, setMissionText] = useState('');
  const [targetVocabulary, setTargetVocabulary] = useState([]);
  const [usedVocabulary, setUsedVocabulary] = useState([]);
  const [missionCompleted, setMissionCompleted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState('beginner');
  const [toastLevelInfo, setToastLevelInfo] = useState('');

  // Audio and TTS control states
  const [isListening, setIsListening] = useState(false);
  const [userText, setUserText] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [recognitionObj, setRecognitionObj] = useState(null);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [accent, setAccent] = useState('us');
  const [translations, setTranslations] = useState({});
  const [startTime, setStartTime] = useState(null);

  // Auto-scroll chat log
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Read aloud new AI messages automatically if enabled
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender === 'ai' && autoSpeak) {
        speakText(lastMsg.text);
      }
    }
  }, [messages, autoSpeak]);

  // Native Speech Synthesis player
  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop any ongoing speech first

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';

    // Set voice speed speaking rate dynamically based on fluency level OR manual override
    if (speechRate !== 1.0) {
      utterance.rate = speechRate;
    } else if (currentLevel === 'beginner') {
      utterance.rate = 0.80; // Slower, clearer speech
      utterance.pitch = 1.02;
    } else if (currentLevel === 'intermediate') {
      utterance.rate = 0.95; // Near normal speed
      utterance.pitch = 1.0;
    } else {
      utterance.rate = 1.12; // Advanced native speaking rate
      utterance.pitch = 0.98;
    }

    // Attempt to load selected accent voice
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;
    if (accent === 'uk') {
      selectedVoice = voices.find(v => v.lang.startsWith('en-GB') || v.name.includes('Great Britain') || v.name.includes('UK'));
    } else {
      selectedVoice = voices.find(v => v.lang.startsWith('en-US') || v.name.includes('United States') || v.name.includes('US') || v.name.includes('Google'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    } else {
      const premiumVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural')));
      if (premiumVoice) {
        utterance.voice = premiumVoice;
      }
    }

    window.speechSynthesis.speak(utterance);
  };

  // Translate specific message to user's native language using AI
  const handleTranslateMessage = async (text, index) => {
    if (translations[index]) {
      // Toggle off if already translated
      const updated = { ...translations };
      delete updated[index];
      setTranslations(updated);
      return;
    }

    try {
      const profile = await getUserProfile();
      const targetLang = profile.settings?.nativeLanguage || 'es';
      const result = await translateTextApi(text, targetLang);
      setTranslations(prev => ({
        ...prev,
        [index]: result.translation
      }));
    } catch (err) {
      console.error("AI Translation helper error:", err);
    }
  };

  // Initialize and start practice session
  const handleStartSession = async (preset = null) => {
    try {
      dispatch(resetChatState());
      setUsedVocabulary([]);
      setMissionCompleted(false);
      setToastLevelInfo('');

      let activeTopic = topic;
      let activeMode = mode;
      let activeMission = '';
      let activeTargetVocab = [];

      if (preset) {
        activeTopic = preset.topic;
        activeMode = 'rolePlay';
        activeMission = preset.missionText;
        activeTargetVocab = preset.targetVocabulary;
        setSelectedScenario(preset.id);
        setTopic(preset.topic);
        setMode('rolePlay');
        setMissionText(preset.missionText);
        setTargetVocabulary(preset.targetVocabulary);
      } else if (mode === 'freeTalk') {
        activeTopic = 'General Conversation';
        setTopic('General Conversation');
        setSelectedScenario('free_talk');
        setMissionText('');
        setTargetVocabulary([]);
      } else {
        setSelectedScenario('custom');
      }

      // API post
      const data = await startConversationApi(
        activeTopic, 
        activeMode, 
        level, 
        adaptiveMode, 
        preset ? preset.name : activeTopic,
        activeMission, 
        activeTargetVocab
      ); 

      dispatch(setSessionStart({ conversationId: data.conversationId }));
      setCurrentLevel(data.level || level);
      setStartTime(Date.now());
    } catch (err) {
      console.error("Failed to start session:", err);
      alert("Error starting chat session. Check backend server connectivity.");
    }
  };

  // Trigger web speech recognition (STT) mic capture
  const handleVoiceInput = () => {
    if (isListening && recognitionObj) {
      recognitionObj.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser Speech-to-Text is not supported on this browser. Please use Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("STT mic input error:", event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert("Microphone permission blocked. Please allow mic access in your browser's address bar lock settings to speak.");
      }
    };

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setUserText(transcript);
    };

    setRecognitionObj(recognition);
    recognition.start();
  };

  // Submit User Message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!userText.trim() || !conversationId) return;

    const messageText = userText.trim();
    dispatch(addUserMessage(messageText));
    setUserText('');

    try {
      // 1. Send chat message to AI tutor pipeline (also updates level and vocabulary)
      const data = await sendConversationMessageApi(conversationId, messageText);
      dispatch(addAiResponse(data.aiResponse));
      
      // Update local states based on backend analyzer
      setUsedVocabulary(data.usedVocabulary || []);
      setMissionCompleted(data.missionCompleted || false);

      if (data.levelChanged && data.currentLevel) {
        setCurrentLevel(data.currentLevel);
        setToastLevelInfo(`Tutor adjusted speaking difficulty to ${data.currentLevel.toUpperCase()}!`);
        setTimeout(() => setToastLevelInfo(''), 5500);
      }

      // 2. Fetch Grammar Checker feedback asynchronously in the background
      const grammarData = await checkGrammarApi(messageText, conversationId);
      dispatch(setLatestGrammarErrors(grammarData.errors || []));

    } catch (err) {
      console.error("Message loop error:", err);
      dispatch(addAiResponse("Sorry, I had trouble connecting. Let's keep practicing. Try typing again!"));
    }
  };

  // Safely end session and load report summary
  const handleEndSession = async () => {
    if (!conversationId) return;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    
    const durationSeconds = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;

    try {
      const data = await endConversationApi(conversationId, durationSeconds);
      dispatch(setSessionEnd(data.summary));
      setSelectedScenario(null);
    } catch (err) {
      console.error("Failed to terminate session safely:", err);
      dispatch(resetChatState());
    }
  };

  // Categorize presetted scenario lists
  const filteredScenarios = PRESET_SCENARIOS.filter(s => {
    if (activeTab === 0) return true; // All
    if (activeTab === 1) return s.category === 'travel';
    if (activeTab === 2) return s.category === 'business';
    if (activeTab === 3) return s.category === 'daily';
    return false;
  });

  return (
    <Box sx={{ bgcolor: '#F7F9FC', minHeight: '100vh', pb: 10 }}>
    <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 4 }, pb: 10, px: { xs: 2, sm: 3 } }}>
      {/* CASE A: Parameter selection panel */}
      {!conversationId && !sessionSummary && (
        <Box>
          <Paper elevation={3} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 4, mb: 4, background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: '#fff', textAlign: 'center' }}>
            <Typography variant="h5" fontWeight="800" gutterBottom sx={{ fontSize: { xs: '20px', sm: '28px', md: '32px' } }}>🗣️ AI English Conversation Partner</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, maxWidth: '600px', mx: 'auto', mb: 2, display: { xs: 'none', sm: 'block' } }}>
              Speak naturally, challenge yourself with real-world missions, and watch your fluency level adapt in real-time. Completely free.
            </Typography>
          </Paper>

          {/* Difficulty Configuration Grid */}
          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarsIcon color="primary" /> Adjust Speaking Fluency
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Set your initial comfort zone. Luna will scale up/down matching your pacing.
                </Typography>

                <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
                  {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                    <Button
                      key={lvl}
                      variant={level === lvl ? 'contained' : 'outlined'}
                      color={lvl === 'beginner' ? 'success' : lvl === 'intermediate' ? 'warning' : 'error'}
                      onClick={() => setLevel(lvl)}
                      sx={{ flex: 1, py: 1.2, textTransform: 'capitalize', fontWeight: 'bold', borderRadius: 2 }}
                    >
                      {lvl}
                    </Button>
                  ))}
                </Box>

                <FormControlLabel
                  control={
                    <Switch 
                      checked={adaptiveMode} 
                      onChange={(e) => setAdaptiveMode(e.target.checked)} 
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Auto-Adapt Difficulty <PsychologyIcon sx={{ fontSize: 18 }} color="action" />
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Luna dynamically changes vocabulary size and pacing based on your performance.
                      </Typography>
                    </Box>
                  }
                />
              </Paper>
            </Grid>

            {/* Custom Scenario Form */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ForumIcon color="primary" /> Custom / Free Talk
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Choose to practice without a rigid topic structure or create your own target.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    size="large"
                    onClick={() => {
                      setMode('freeTalk');
                      handleStartSession();
                    }}
                    sx={{ py: 1.5, fontWeight: 'bold', borderRadius: 2, textTransform: 'none' }}
                  >
                    🗣️ Speak Freely (No Target Scenario)
                  </Button>

                  <Box sx={{ borderTop: '1px solid #eee', pt: 2 }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>Or create a custom topic:</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField 
                        fullWidth 
                        size="small" 
                        placeholder="e.g. Complaining about noisy neighbors"
                        value={topic}
                        onChange={(e) => {
                          setTopic(e.target.value);
                          setMode('rolePlay');
                        }}
                      />
                      <Button 
                        variant="outlined" 
                        onClick={() => {
                          setMode('rolePlay');
                          setMissionText('');
                          setTargetVocabulary([]);
                          handleStartSession();
                        }}
                        disabled={!topic.trim() || topic === 'General Conversation'}
                      >
                        Start
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Scenario Cards Picker */}
          <Typography variant="h5" fontWeight="800" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            🎯 Practice Scenarios
          </Typography>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} aria-label="scenario categories" variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
              <Tab label="All" sx={{ textTransform: 'none', fontWeight: 'bold', minWidth: { xs: 60, sm: 'auto' }, fontSize: { xs: '12px', sm: '14px' } }} />
              <Tab label="Travel ✈️" sx={{ textTransform: 'none', fontWeight: 'bold', minWidth: { xs: 70, sm: 'auto' }, fontSize: { xs: '12px', sm: '14px' } }} />
              <Tab label="Business 👔" sx={{ textTransform: 'none', fontWeight: 'bold', minWidth: { xs: 80, sm: 'auto' }, fontSize: { xs: '12px', sm: '14px' } }} />
              <Tab label="Daily ☕" sx={{ textTransform: 'none', fontWeight: 'bold', minWidth: { xs: 65, sm: 'auto' }, fontSize: { xs: '12px', sm: '14px' } }} />
            </Tabs>
          </Box>

          <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>
            {filteredScenarios.map((scen) => (
              <Grid item xs={12} sm={6} key={scen.id}>
                <Card sx={{ borderRadius: 3, border: '1px solid #eef2f6', boxShadow: 'none', transition: '0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' } }}>
                  <CardActionArea onClick={() => handleStartSession(scen)}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                        {scen.icon}
                        <Typography variant="h6" fontWeight="bold">{scen.name}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {scen.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {scen.targetVocabulary.map(vocab => (
                          <Chip key={vocab} label={`#${vocab}`} size="small" variant="outlined" sx={{ fontSize: '11px' }} />
                        ))}
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* CASE B: Conversation session summary metrics report */}
      {sessionSummary && (
        <Paper elevation={4} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 4, textAlign: 'center', maxWidth: '600px', mx: 'auto', background: '#fcfdfe' }}>
          <Typography variant="h4" fontWeight="800" color="success.main" gutterBottom>🎉 Practice Completed!</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Fantastic efforts practicing your English today! Here is your conversational breakdown:
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#f5f7fa', p: 3, borderRadius: 3, textAlign: 'left', mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #ddd', pb: 1 }}>
              <Typography variant="body2" color="text.secondary">Scenario Name:</Typography>
              <Typography variant="body2" fontWeight="bold">{sessionSummary.topic}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #ddd', pb: 1 }}>
              <Typography variant="body2" color="text.secondary">Session Mode:</Typography>
              <Typography variant="body2" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>{sessionSummary.mode}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #ddd', pb: 1 }}>
              <Typography variant="body2" color="text.secondary">Practice Time:</Typography>
              <Typography variant="body2" fontWeight="bold">{sessionSummary.duration} seconds</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #ddd', pb: 1 }}>
              <Typography variant="body2" color="text.secondary">Total Conversational Rounds:</Typography>
              <Typography variant="body2" fontWeight="bold">{sessionSummary.totalMessagesExchange} exchanges</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Approximate Score Accuracy:</Typography>
              <Typography variant="body2" fontWeight="bold" color="success.main">{sessionSummary.overallScore}%</Typography>
            </Box>
          </Box>

          <Button 
            variant="contained" 
            size="large" 
            fullWidth 
            onClick={handleStartSession} 
            sx={{ py: 1.5, borderRadius: 2.5, fontWeight: 'bold' }}
          >
            Start Fresh Practice
          </Button>
        </Paper>
      )}

      {/* CASE C: Active chat dashboard */}
      {conversationId && (
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs={12} md={7} sx={{ order: { xs: 2, md: 1 } }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eaeaea', pb: 2, mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    🗣️ Luna (AI Tutor)
                    <Chip 
                      label={currentLevel.toUpperCase()} 
                      size="small" 
                      color={currentLevel === 'beginner' ? 'success' : currentLevel === 'intermediate' ? 'warning' : 'error'} 
                      sx={{ fontWeight: 'bold', height: '18px', fontSize: '9px' }} 
                    />
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Topic: <strong>{topic}</strong></Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={autoSpeak} 
                        onChange={(e) => setAutoSpeak(e.target.checked)} 
                        size="small" 
                        color="primary"
                      />
                    }
                    label={<Typography variant="caption" color="text.secondary">Auto-Speak</Typography>}
                    sx={{ m: 0 }}
                  />
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="error" 
                    startIcon={<ExitToAppIcon />} 
                    onClick={handleEndSession}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    End Chat
                  </Button>
                </Box>
              </Box>

              {/* Dynamic difficulty adaptation notifications */}
              {toastLevelInfo && (
                <Alert severity="info" sx={{ mb: 2, py: 0.5, borderRadius: 2, fontWeight: 'bold' }}>
                  ⚡ {toastLevelInfo}
                </Alert>
              )}

              {/* Scrolling messages wrapper */}
              <Box sx={{ flexGrow: 1, minHeight: '350px', maxHeight: '420px', overflowY: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#fcfdfd', border: '1px solid #f0f3f6', borderRadius: 3, mb: 2.5 }}>
                {messages.length === 0 && (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 15, fontStyle: 'italic' }}>
                    Type or speak to Luna to initiate practice...
                  </Typography>
                )}

                {messages.map((msg, idx) => (
                  <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start', gap: 1 }}>
                      {msg.sender === 'ai' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <IconButton size="small" onClick={() => speakText(msg.text)} sx={{ bgcolor: '#e3f2fd', '&:hover': { bgcolor: '#bbdefb' } }}>
                            <VolumeUpIcon sx={{ fontSize: 14 }} color="primary" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleTranslateMessage(msg.text, idx)} sx={{ bgcolor: '#efebe9', '&:hover': { bgcolor: '#d7ccc8' } }}>
                            <LanguageIcon sx={{ fontSize: 14 }} color="secondary" />
                          </IconButton>
                        </Box>
                      )}
                      <Paper sx={{ 
                        p: 1.8, 
                        maxWidth: '75%', 
                        borderRadius: 3,
                        bgcolor: msg.sender === 'user' ? 'primary.main' : '#f0f3f6',
                        color: msg.sender === 'user' ? 'white' : 'text.primary',
                        borderBottomRightRadius: msg.sender === 'user' ? 0 : 3,
                        borderBottomLeftRadius: msg.sender === 'ai' ? 0 : 3,
                        boxShadow: 'none',
                        border: msg.sender === 'ai' ? '1px solid #e1e7ed' : 'none'
                      }}>
                        <Typography variant="body2">{msg.text}</Typography>
                      </Paper>
                    </Box>
                    {translations[idx] && (
                      <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary', ml: msg.sender === 'ai' ? 6 : 0, mt: 0.5, bgcolor: '#f1f5f9', px: 1, py: 0.5, borderRadius: 1 }}>
                        🌐 Translation: {translations[idx]}
                      </Typography>
                    )}
                  </Box>
                ))}
                {isLoading && (
                  <Box sx={{ display: 'flex', gap: 1, ml: 4 }}>
                    <CircularProgress size={16} />
                    <Typography variant="caption" color="text.secondary">Luna is writing...</Typography>
                  </Box>
                )}
                <div ref={chatEndRef} />
              </Box>

              {/* Message Typing and Recording Input Form */}
              <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Tooltip title={isListening ? "Stop listening" : "Speak via Microphone"}>
                  <IconButton 
                    onClick={handleVoiceInput} 
                    color={isListening ? "error" : "primary"} 
                    sx={{ 
                      p: 1.5, 
                      bgcolor: isListening ? '#ffebee' : '#f0f4f8',
                      animation: isListening ? 'pulse 1.3s infinite ease-in-out' : 'none',
                      '@keyframes pulse': {
                        '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.4)' },
                        '70%': { transform: 'scale(1.08)', boxShadow: '0 0 0 10px rgba(244, 67, 54, 0)' },
                        '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)' }
                      }
                    }}
                  >
                    {isListening ? <StopIcon /> : <MicIcon />}
                  </IconButton>
                </Tooltip>

                <TextField 
                  fullWidth 
                  size="medium"
                  placeholder={isListening ? "Listening closely... Speak now!" : "Type your message..."}
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  disabled={isListening}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#fafafa' } }}
                />

                <IconButton type="submit" color="primary" disabled={isLoading || !userText.trim()} sx={{ p: 1.5, bgcolor: '#e3f2fd', '&:hover': { bgcolor: '#bbdefb' } }}>
                  <SendIcon />
                </IconButton>
              </Box>
            </Paper>
          </Grid>

          {/* Gamified Scenario Objectives Panel */}
          <Grid item xs={12} md={5} sx={{ order: { xs: 1, md: 2 } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Voice Pacing & Accent Settings Card */}
              <Paper elevation={2} sx={{ p: 3, borderRadius: 4, borderLeft: '5px solid #9c27b0' }}>
                <Typography variant="subtitle2" fontWeight="bold" color="secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RecordVoiceOverIcon /> Voice Pacing & Accent
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Customize tutor speaking style to practice different dialects and pacing.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Pacing Speed */}
                  <Box>
                    <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 0.5 }}>
                      Speaking Speed: {speechRate}x
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {[0.75, 1.0, 1.25].map((rate) => (
                        <Button
                          key={rate}
                          variant={speechRate === rate ? 'contained' : 'outlined'}
                          size="small"
                          color="secondary"
                          onClick={() => setSpeechRate(rate)}
                          sx={{ flex: 1, textTransform: 'none', py: 0.5, borderRadius: 1.5, fontSize: '11px', fontWeight: 'bold' }}
                        >
                          {rate === 1.0 ? 'Normal' : `${rate}x`}
                        </Button>
                      ))}
                    </Box>
                  </Box>

                  {/* Accent Selection */}
                  <Box>
                    <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 0.5 }}>
                      English Dialect Accent:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {[
                        { code: 'us', label: 'American 🇺🇸' },
                        { code: 'uk', label: 'British 🇬🇧' }
                      ].map((item) => (
                        <Button
                          key={item.code}
                          variant={accent === item.code ? 'contained' : 'outlined'}
                          size="small"
                          color="secondary"
                          onClick={() => setAccent(item.code)}
                          sx={{ flex: 1, textTransform: 'none', py: 0.5, borderRadius: 1.5, fontSize: '11px', fontWeight: 'bold' }}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Paper>

              {missionText && (
                <Paper elevation={2} sx={{ p: 3, borderRadius: 4, borderLeft: '5px solid #1976d2' }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    🎯 Scenario Mission
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2.5, fontStyle: 'italic', color: 'text.primary' }}>
                    "{missionText}"
                  </Typography>
                  
                  {/* Mission Status Checklist */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, p: 1.5, bgcolor: missionCompleted ? '#e8f5e9' : '#fffde7', borderRadius: 2 }}>
                    {missionCompleted ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <CircularProgress size={16} thickness={5} />
                    )}
                    <Typography variant="body2" fontWeight="bold" color={missionCompleted ? 'success.main' : 'warning.main'}>
                      {missionCompleted ? 'Mission Completed! Excellent Job!' : 'Mission in progress...'}
                    </Typography>
                  </Box>

                  {/* Vocabulary Tracker */}
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>Target Vocabulary Checklist:</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {targetVocabulary.map((word) => {
                      const isUsed = usedVocabulary.includes(word.toLowerCase());
                      return (
                        <Box key={word} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            width: 18, 
                            height: 18, 
                            borderRadius: '50%', 
                            border: '2px solid',
                            borderColor: isUsed ? 'success.main' : '#ccc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: isUsed ? 'success.main' : 'transparent'
                          }}>
                            {isUsed && <CheckCircleIcon sx={{ fontSize: 14, color: '#fff' }} />}
                          </Box>
                          <Typography variant="body2" sx={{ color: isUsed ? 'success.main' : 'text.primary', fontWeight: isUsed ? 'bold' : 'normal', textDecoration: isUsed ? 'line-through' : 'none' }}>
                            {word}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Paper>
              )}

              {/* Grammar Tips */}
              <GrammarFeedback />

              {/* Pronunciation Coach */}
              <PronunciationCoach />
            </Box>
          </Grid>
        </Grid>
      )}
    </Container>
    </Box>
  );
}