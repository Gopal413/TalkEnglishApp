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
  Tooltip,Avatar 
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


const TEAL = '#4A9B9B';
const CORAL = '#E07B6A';
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
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 10 }}>
    <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 4 }, pb: 10, px: { xs: 2.5, sm: 3 } }}>
      {/* CASE A: Parameter selection panel */}
      {!conversationId && !sessionSummary && (
        <Box>
          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 3, sm: 5 }, 
              borderRadius: '24px', 
              mb: 4, 
              background: `linear-gradient(135deg, ${TEAL} 0%, #205E5E 100%)`, 
              color: '#fff', 
              textAlign: 'center',
              boxShadow: '0 8px 30px rgba(74, 155, 155, 0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)' }} />
            <Typography variant="h4" fontWeight="900" gutterBottom sx={{ fontSize: { xs: '22px', sm: '30px', md: '34px' }, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>🗣️ AI English Conversation Partner</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, maxWidth: '600px', mx: 'auto', mb: 1, display: { xs: 'none', sm: 'block' }, lineHeight: 1.6, fontSize: '15px' }}>
              Speak naturally, challenge yourself with real-world scenarios, and watch your fluency level adapt in real-time. Completely free.
            </Typography>
          </Paper>

          {/* Difficulty Configuration Grid */}
          <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: 5 }}>
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3.5, 
                  borderRadius: '20px', 
                  height: '100%',
                  border: '1px solid rgba(0,0,0,0.04)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.01)'
                }}
              >
                <Typography variant="h6" fontWeight="800" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1a1a2e' }}>
                  <StarsIcon color="primary" /> Adjust Speaking Fluency
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2.5, fontSize: '12px' }}>
                  Set your initial comfort zone. Luna will scale up/down matching your pacing.
                </Typography>

                <Box sx={{ display: 'flex', gap: 1.5, mb: 3.5 }}>
                  {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                    <Button
                      key={lvl}
                      variant={level === lvl ? 'contained' : 'outlined'}
                      color={lvl === 'beginner' ? 'success' : lvl === 'intermediate' ? 'warning' : 'error'}
                      onClick={() => setLevel(lvl)}
                      sx={{ 
                        flex: 1, 
                        py: 1.2, 
                        textTransform: 'capitalize', 
                        fontWeight: '700', 
                        borderRadius: '12px',
                        borderWidth: '1.5px',
                        '&:hover': { borderWidth: '1.5px' }
                      }}
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
                    <Box sx={{ ml: 0.5 }}>
                      <Typography variant="body2" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#1a1a2e' }}>
                        Auto-Adapt Difficulty <PsychologyIcon sx={{ fontSize: 18 }} color="action" />
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
                        Luna dynamically changes vocabulary size and pacing based on your performance.
                      </Typography>
                    </Box>
                  }
                />
              </Paper>
            </Grid>

            {/* Custom Scenario Form */}
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3.5, 
                  borderRadius: '20px', 
                  height: '100%',
                  border: '1px solid rgba(0,0,0,0.04)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.01)'
                }}
              >
                <Typography variant="h6" fontWeight="800" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1a1a2e' }}>
                  <ForumIcon color="primary" /> Custom / Free Talk
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2.5, fontSize: '12px' }}>
                  Choose to practice without a rigid topic structure or create your own target.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    size="large"
                    onClick={() => {
                      setMode('freeTalk');
                      handleStartSession();
                    }}
                    sx={{ 
                      py: 1.5, 
                      fontWeight: '700', 
                      borderRadius: '24px', 
                      textTransform: 'none',
                      boxShadow: '0 4px 14px rgba(74, 155, 155, 0.2)'
                    }}
                  >
                    🗣️ Speak Freely (No Target Scenario)
                  </Button>

                  <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.06)', pt: 2.5 }}>
                    <Typography variant="body2" fontWeight="700" sx={{ mb: 1.5, color: '#1a1a2e' }}>Or create a custom topic:</Typography>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <TextField 
                        fullWidth 
                        size="small" 
                        placeholder="e.g. Complaining about noisy neighbors"
                        value={topic}
                        onChange={(e) => {
                          setTopic(e.target.value);
                          setMode('rolePlay');
                        }}
                        slotProps={{
                          input: { sx: { borderRadius: '12px' } }
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
                        sx={{
                          borderRadius: '12px',
                          fontWeight: '700',
                          borderWidth: '1.5px',
                          px: 3,
                          '&:hover': { borderWidth: '1.5px' }
                        }}
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
          <Typography variant="h5" fontWeight="900" sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1, color: '#1a1a2e' }}>
            🎯 Practice Scenarios
          </Typography>

          <Box sx={{ borderBottom: 1, borderColor: 'rgba(0,0,0,0.06)', mb: 4, bgcolor: '#fff', borderRadius: '12px 12px 0 0', px: 1 }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, val) => setActiveTab(val)} 
              aria-label="scenario categories" 
              variant="scrollable" 
              scrollButtons="auto" 
              allowScrollButtonsMobile
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: '700',
                  color: '#64748B',
                  fontSize: { xs: '13px', sm: '14.5px' },
                  py: 2,
                  minWidth: { xs: 70, sm: 'auto' }
                },
                '& .Mui-selected': {
                  color: `${TEAL} !important`
                },
                '& .MuiTabs-indicator': {
                  height: '3px',
                  borderRadius: '3px 3px 0 0',
                  bgcolor: 'teal'
                }
              }}
            >
              <Tab label="All" />
              <Tab label="Travel ✈️" />
              <Tab label="Business 👔" />
              <Tab label="Daily ☕" />
            </Tabs>
          </Box>

          <Grid container spacing={{ xs: 2.5, sm: 3 }}>
            {filteredScenarios.map((scen) => (
              <Grid item xs={12} sm={6} key={scen.id}>
                <Card 
                  sx={{ 
                    borderRadius: '20px', 
                    border: '1px solid rgba(0,0,0,0.04)', 
                    boxShadow: '0 4px 15px rgba(0,0,0,0.01)', 
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                    '&:hover': { 
                      transform: 'translateY(-4px)', 
                      boxShadow: '0 12px 28px rgba(0,0,0,0.05)' 
                    } 
                  }}
                >
                  <CardActionArea onClick={() => handleStartSession(scen)}>
                    <CardContent sx={{ p: 3.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'primary.light', display: 'flex', color: 'primary.main' }}>
                          {scen.icon}
                        </Box>
                        <Typography variant="h6" fontWeight="800" sx={{ color: '#1a1a2e', fontSize: '17px' }}>{scen.name}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6, fontSize: '13.5px' }}>
                        {scen.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                        {scen.targetVocabulary.map(vocab => (
                          <Chip 
                            key={vocab} 
                            label={`#${vocab}`} 
                            size="small" 
                            variant="outlined" 
                            sx={{ 
                              fontSize: '11px', 
                              fontWeight: '700',
                              color: 'teal',
                              borderColor: `${TEAL}30`,
                              bgcolor: `${TEAL}05`,
                              borderRadius: '6px'
                            }} 
                          />
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
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 4, sm: 6 }, 
            borderRadius: '24px', 
            textAlign: 'center', 
            maxWidth: '600px', 
            mx: 'auto', 
            bgcolor: '#ffffff',
            border: '1px solid rgba(0,0,0,0.04)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.04)'
          }}
        >
          <Typography variant="h4" fontWeight="900" color="success.main" gutterBottom sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>🎉 Practice Completed!</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontSize: '15px', lineHeight: 1.6 }}>
            Fantastic efforts practicing your English today! Here is your conversational breakdown:
          </Typography>

          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2.2, 
              bgcolor: '#F8FAFC', 
              p: 3.5, 
              borderRadius: '20px', 
              textAlign: 'left', 
              mb: 4,
              border: '1px solid rgba(0,0,0,0.02)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(0,0,0,0.1)', pb: 1.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: '600' }}>Scenario Name:</Typography>
              <Typography variant="body2" fontWeight="700" sx={{ color: '#1a1a2e' }}>{sessionSummary.topic}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(0,0,0,0.1)', pb: 1.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: '600' }}>Session Mode:</Typography>
              <Typography variant="body2" fontWeight="700" sx={{ textTransform: 'capitalize', color: '#1a1a2e' }}>{sessionSummary.mode}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(0,0,0,0.1)', pb: 1.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: '600' }}>Practice Time:</Typography>
              <Typography variant="body2" fontWeight="700" sx={{ color: '#1a1a2e' }}>{sessionSummary.duration} seconds</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(0,0,0,0.1)', pb: 1.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: '600' }}>Total Conversational Rounds:</Typography>
              <Typography variant="body2" fontWeight="700" sx={{ color: '#1a1a2e' }}>{sessionSummary.totalMessagesExchange} exchanges</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: '600' }}>Approximate Score Accuracy:</Typography>
              <Typography variant="body2" fontWeight="800" color="success.main" sx={{ fontSize: '16px' }}>{sessionSummary.overallScore}%</Typography>
            </Box>
          </Box>

          <Button 
            variant="contained" 
            size="large" 
            fullWidth 
            onClick={handleStartSession} 
            sx={{ 
              py: 1.5, 
              borderRadius: '24px', 
              fontWeight: '700',
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(74, 155, 155, 0.25)'
            }}
          >
            Start Fresh Practice
          </Button>
        </Paper>
      )}

      {/* CASE C: Active chat dashboard */}
      {conversationId && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={7} sx={{ order: { xs: 2, md: 1 } }}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: '24px', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                overflow: 'hidden', 
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.04)'
              }}
            >
              {/* WhatsApp Style Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#205E5E', px: 3, py: 2, color: '#fff' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 42, height: 42, fontWeight: '900', border: '2px solid rgba(255,255,255,0.3)' }}>L</Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight="800" sx={{ display: 'flex', alignItems: 'center', gap: 1, lineHeight: 1.2, fontSize: '15px' }}>
                      Luna (AI Tutor)
                      <Chip 
                        label={currentLevel.toUpperCase()} 
                        size="small" 
                        sx={{ 
                          fontWeight: '800', 
                          height: '18px', 
                          fontSize: '9px', 
                          color: '#fff',
                          bgcolor: currentLevel === 'beginner' ? '#2e7d32' : currentLevel === 'intermediate' ? '#ed6c02' : '#d32f2f'
                        }} 
                      />
                    </Typography>
                    <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                      <Box sx={{ width: 6, height: 6, bgcolor: '#25d366', borderRadius: '50%', display: 'inline-block' }} /> Online · {topic}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={autoSpeak} 
                        onChange={(e) => setAutoSpeak(e.target.checked)} 
                        size="small" 
                        color="success"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#25d366' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#25d366' }
                        }}
                      />
                    }
                    label={<Typography sx={{ fontSize: '11px', color: '#fff', fontWeight: '700' }}>Auto-Speak</Typography>}
                    sx={{ m: 0 }}
                  />
                  <Button 
                    size="small" 
                    variant="contained" 
                    onClick={handleEndSession}
                    sx={{ 
                      borderRadius: '12px', 
                      textTransform: 'none', 
                      bgcolor: '#d32f2f', 
                      '&:hover': { bgcolor: '#c62828' },
                      fontSize: '11px', 
                      fontWeight: '800',
                      px: 2,
                      py: 0.8
                    }}
                  >
                    End Session
                  </Button>
                </Box>
              </Box>

              {/* Dynamic difficulty adaptation notifications */}
              {toastLevelInfo && (
                <Alert severity="info" sx={{ py: 0.5, px: 2, borderRadius: 0, fontWeight: '700', fontSize: '12px' }}>
                  ⚡ {toastLevelInfo}
                </Alert>
              )}

              {/* Scrolling messages wrapper with WhatsApp wallpaper */}
              <Box sx={{ 
                flexGrow: 1, 
                minHeight: '400px', 
                maxHeight: '450px', 
                overflowY: 'auto', 
                p: 3, 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2, 
                bgcolor: '#efeae2', 
                backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                backgroundSize: 'contain',
                position: 'relative'
              }}>
                {messages.length === 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                    <Paper elevation={0} sx={{ p: 2, px: 3, borderRadius: '16px', bgcolor: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '320px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                      <Typography variant="body2" sx={{ fontWeight: '600', color: '#54656f', fontSize: '13.5px', lineHeight: 1.5 }}>
                        🔒 Messages are generated in real-time. Start the practice by saying hello below!
                      </Typography>
                    </Paper>
                  </Box>
                )}

                {messages.map((msg, idx) => (
                  <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start', gap: 0.4 }}>
                    <Box sx={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 1.2, width: '100%' }}>
                      
                      {msg.sender === 'ai' && (
                        <Box sx={{ display: 'flex', gap: 0.5, mr: 0.5, alignSelf: 'center' }}>
                          <Tooltip title="Listen">
                            <IconButton size="small" onClick={() => speakText(msg.text)} sx={{ bgcolor: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 5px rgba(0,0,0,0.03)', '&:hover': { bgcolor: '#f1f5f9' } }}>
                              <VolumeUpIcon sx={{ fontSize: 13, color: '#205E5E' }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Translate">
                            <IconButton size="small" onClick={() => handleTranslateMessage(msg.text, idx)} sx={{ bgcolor: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 5px rgba(0,0,0,0.03)', '&:hover': { bgcolor: '#f1f5f9' } }}>
                              <LanguageIcon sx={{ fontSize: 13, color: '#205E5E' }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}

                      <Paper sx={{ 
                        p: 2, 
                        maxWidth: '72%', 
                        borderRadius: '16px',
                        borderTopRightRadius: msg.sender === 'user' ? '0px' : '16px',
                        borderTopLeftRadius: msg.sender === 'ai' ? '0px' : '16px',
                        border: msg.sender === 'user' ? '1px solid #c7f0c2' : '1px solid #e2e8f0',
                        bgcolor: msg.sender === 'user' ? '#e7fcdb' : '#ffffff',
                        color: '#111b21',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                        position: 'relative'
                      }}>
                        <Typography sx={{ fontSize: '14.5px', pr: 5, whiteSpace: 'pre-line', lineHeight: 1.5, fontWeight: '500' }}>
                          {msg.text}
                        </Typography>
                        {/* Time and Delivery checkmark status */}
                        <Box sx={{ position: 'absolute', bottom: 3, right: 8, display: 'flex', alignItems: 'center', gap: 0.3 }}>
                          <Typography sx={{ fontSize: '9px', color: '#8696a0', fontWeight: '500' }}>
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                          {msg.sender === 'user' && (
                            <Typography sx={{ fontSize: '11px', color: '#53bdeb', fontWeight: 'bold', lineHeight: 1 }}>✓✓</Typography>
                          )}
                        </Box>
                      </Paper>
                    </Box>
                    {translations[idx] && (
                      <Typography sx={{ fontSize: '12.5px', fontStyle: 'italic', color: '#0b141a', ml: msg.sender === 'ai' ? 8 : 0, mt: 0.5, bgcolor: 'rgba(255, 255, 255, 0.95)', px: 2, py: 1, borderRadius: '12px', borderLeft: `3.5px solid ${TEAL}`, boxShadow: '0 2px 6px rgba(0,0,0,0.04)', fontWeight: '500' }}>
                        🌐 Translation: {translations[idx]}
                      </Typography>
                    )}
                  </Box>
                ))}
                {isLoading && (
                  <Box sx={{ display: 'flex', gap: 1.2, ml: 1, bgcolor: 'rgba(255, 255, 255, 0.9)', px: 2, py: 1, borderRadius: '12px', maxWidth: '170px', border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                    <CircularProgress size={12} sx={{ color: '#205E5E', mt: 0.2 }} />
                    <Typography sx={{ fontSize: '11.5px', color: '#54656f', fontWeight: '700' }}>Luna is typing...</Typography>
                  </Box>
                )}
                <div ref={chatEndRef} />
              </Box>

              {/* Message Typing and Recording Input Form (WhatsApp Pill Style) */}
              <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1.5, alignItems: 'center', bgcolor: '#F0F2F5', p: 2, borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                <Tooltip title={isListening ? "Stop listening" : "Speak via Microphone"}>
                  <IconButton 
                    onClick={handleVoiceInput} 
                    sx={{ 
                      p: 1.6, 
                      bgcolor: isListening ? '#ffebee' : '#fff',
                      color: isListening ? '#d9534f' : '#64748B',
                      border: '1px solid rgba(0,0,0,0.04)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      animation: isListening ? 'pulse 1.3s infinite ease-in-out' : 'none',
                      '@keyframes pulse': {
                        '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(217, 83, 79, 0.4)' },
                        '70%': { transform: 'scale(1.08)', boxShadow: '0 0 0 10px rgba(217, 83, 79, 0)' },
                        '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(217, 83, 79, 0)' }
                      }
                    }}
                  >
                    {isListening ? <StopIcon /> : <MicIcon />}
                  </IconButton>
                </Tooltip>

                <TextField 
                  fullWidth 
                  size="small"
                  placeholder={isListening ? "Listening closely... Speak now!" : "Type a message..."}
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  disabled={isListening}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '24px', 
                      bgcolor: '#fff',
                      border: '1px solid rgba(0,0,0,0.06)',
                      px: 2,
                      '& fieldset': { borderColor: 'transparent' },
                      '&:hover fieldset': { borderColor: 'transparent' },
                      '&.Mui-focused fieldset': { borderColor: 'transparent' }
                    } 
                  }}
                />

                <IconButton 
                  type="submit" 
                  disabled={isLoading || !userText.trim()} 
                  sx={{ 
                    p: 1.6, 
                    bgcolor: (!userText.trim() || isLoading) ? '#e2e8f0' : 'teal', 
                    color: '#fff',
                    '&:hover': { bgcolor: '#3d8282' },
                    boxShadow: '0 2px 8px rgba(74, 155, 155, 0.2)'
                  }}
                >
                  <SendIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Paper>
          </Grid>

          {/* Gamified Scenario Objectives Panel */}
          <Grid item xs={12} md={5} sx={{ order: { xs: 1, md: 2 } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              {/* Voice Pacing & Accent Settings Card */}
              <Paper elevation={0} sx={{ p: 3.5, borderRadius: '20px', borderLeft: `5px solid ${CORAL}`, border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                <Typography variant="subtitle2" fontWeight="800" color="secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '15px' }}>
                  <RecordVoiceOverIcon /> Voice Pacing & Accent
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2.5, fontSize: '12px' }}>
                  Customize tutor speaking style to practice different dialects and pacing.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {/* Pacing Speed */}
                  <Box>
                    <Typography variant="caption" fontWeight="800" display="block" sx={{ mb: 1, color: '#1a1a2e' }}>
                      Speaking Speed: {speechRate}x
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.2 }}>
                      {[0.75, 1.0, 1.25].map((rate) => (
                        <Button
                          key={rate}
                          variant={speechRate === rate ? 'contained' : 'outlined'}
                          size="small"
                          color="secondary"
                          onClick={() => setSpeechRate(rate)}
                          sx={{ 
                            flex: 1, 
                            textTransform: 'none', 
                            py: 0.8, 
                            borderRadius: '10px', 
                            fontSize: '11px', 
                            fontWeight: '700',
                            borderWidth: '1.5px',
                            '&:hover': { borderWidth: '1.5px' }
                          }}
                        >
                          {rate === 1.0 ? 'Normal' : `${rate}x`}
                        </Button>
                      ))}
                    </Box>
                  </Box>

                  {/* Accent Selection */}
                  <Box>
                    <Typography variant="caption" fontWeight="800" display="block" sx={{ mb: 1, color: '#1a1a2e' }}>
                      English Dialect Accent:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.2 }}>
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
                          sx={{ 
                            flex: 1, 
                            textTransform: 'none', 
                            py: 0.8, 
                            borderRadius: '10px', 
                            fontSize: '11px', 
                            fontWeight: '700',
                            borderWidth: '1.5px',
                            '&:hover': { borderWidth: '1.5px' }
                          }}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Paper>

              {missionText && (
                <Paper elevation={0} sx={{ p: 3.5, borderRadius: '20px', borderLeft: `5px solid ${TEAL}`, border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                  <Typography variant="subtitle1" fontWeight="800" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '16px' }}>
                    🎯 Scenario Mission
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2.5, fontStyle: 'italic', color: '#1E293B', lineHeight: 1.6 }}>
                    "{missionText}"
                  </Typography>
                  
                  {/* Mission Status Checklist */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, p: 2, bgcolor: missionCompleted ? '#E8F5E9' : '#FFFDE7', borderRadius: '12px', border: missionCompleted ? '1px solid #C8E6C9' : '1px solid #FFE082' }}>
                    {missionCompleted ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <CircularProgress size={16} thickness={5} />
                    )}
                    <Typography variant="body2" fontWeight="800" color={missionCompleted ? 'success.main' : 'warning.main'}>
                      {missionCompleted ? 'Mission Completed! Excellent Job!' : 'Mission in progress...'}
                    </Typography>
                  </Box>

                  {/* Vocabulary Tracker */}
                  <Typography variant="body2" fontWeight="800" sx={{ mb: 1.5, color: '#1a1a2e' }}>Target Vocabulary Checklist:</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                    {targetVocabulary.map((word) => {
                      const isUsed = usedVocabulary.includes(word.toLowerCase());
                      return (
                        <Box key={word} sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Box sx={{ 
                            width: 20, 
                            height: 20, 
                            borderRadius: '50%', 
                            border: '2px solid',
                            borderColor: isUsed ? 'success.main' : '#cbd5e1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: isUsed ? 'success.main' : 'transparent',
                            transition: 'all 0.2s'
                          }}>
                            {isUsed && <CheckCircleIcon sx={{ fontSize: 15, color: '#fff' }} />}
                          </Box>
                          <Typography variant="body2" sx={{ color: isUsed ? 'success.main' : '#475569', fontWeight: isUsed ? '700' : '500', textDecoration: isUsed ? 'line-through' : 'none' }}>
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