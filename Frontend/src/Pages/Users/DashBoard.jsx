import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Grid, Paper, Tabs, Tab } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { getUserProgress, getAllLessonsApi, checkGrammarApi } from '../../api/authApi';

// Reusable / Custom Layout Components
import HeroSection from './DashboardComponents/HeroSection';
import StatsCards from './DashboardComponents/StatsCards';
import ContinueLearning from './DashboardComponents/ContinueLearning';
import QuickActions from './DashboardComponents/QuickActions';
import DailyWarmup from './DashboardComponents/DailyWarmup';
import PronunciationCoach from './DashboardComponents/PronunciationCoach';
import GrammarChecker from './DashboardComponents/GrammarChecker';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [lessonStats, setLessonStats] = useState({ total: 0, completed: 0 });
  const [lessons, setLessons] = useState([]);
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
        const lessonList = data.lessons || [];
        setLessons(lessonList);
        setLessonStats({ total: lessonList.length, completed: data.totalCompleted || 0 });
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

  // Find the next lesson that is unlocked and not completed
  const nextLesson = lessons.find(l => !l.isCompleted && !l.isLocked) || lessons.find(l => !l.isCompleted) || lessons[0];

  const levelTarget = 10;
  const conversationsDone = stats?.totalConversations || 0;
  const goalPct = Math.min(Math.round((conversationsDone / levelTarget) * 100), 100);

  const levelColors = {
    beginner: { color: '#22C55E', label: 'Beginner' },
    intermediate: { color: '#F59E0B', label: 'Intermediate' },
    advanced: { color: '#EF4444', label: 'Advanced' }
  };
  const lvl = levelColors[user?.level] || levelColors.beginner;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: { xs: 12, md: 8 } }}>
      {/* Hero Header Section */}
      <HeroSection
        user={user}
        lvl={lvl}
        goalPct={goalPct}
        conversationsDone={conversationsDone}
        levelTarget={levelTarget}
      />

      <Container maxWidth="lg">
        {/* Statistics Cards Row */}
        <StatsCards
          loadingStats={loadingStats}
          stats={stats}
          conversationsDone={conversationsDone}
        />

        {/* 2-Column Responsive Workspace Grid */}
        <Grid container spacing={4}>
          {/* Left Column: Interactive Tools */}
          <Grid size={{xs:12,md:8}}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2, // 24px
                overflow: 'hidden',
                bgcolor: 'background.paper',
                mb: 4,
              }}
            >
              {/* Tab Navigation */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#F8FAFC' }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  textColor="primary"
                  indicatorColor="primary"
                  sx={{
                    px: 2,
                    '& .MuiTab-root': {
                      py: 2.2,
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '14.5px',
                      color: 'text.secondary',
                      transition: 'all 0.2s',
                    },
                    '& .Mui-selected': {
                      color: 'primary.main',
                    },
                    '& .MuiTabs-indicator': {
                      height: '3px',
                      borderRadius: '3px 3px 0 0',
                    },
                  }}
                >
                  <Tab label="🌅 Daily Warm-up" />
                  <Tab label="🎙️ Pronunciation Coach" />
                  <Tab label="✍️ Grammar Checker" />
                </Tabs>
              </Box>

              {/* Tab Content Boxes */}
              <Box sx={{ p: { xs: 3, sm: 4 } }}>
                {activeTab === 0 && (
                  <DailyWarmup
                    warmupPrompt={warmupPrompt}
                    warmupInput={warmupInput}
                    setWarmupInput={setWarmupInput}
                    isWarmupRecording={isWarmupRecording}
                    checkingWarmup={checkingWarmup}
                    warmupFeedback={warmupFeedback}
                    onCheckWarmup={handleCheckWarmup}
                    onNextWarmup={handleNextWarmup}
                    onStartWarmupVoice={startWarmupVoice}
                  />
                )}
                {activeTab === 1 && (
                  <PronunciationCoach
                    pronunciationSentence={pronunciationSentence}
                    isPronRecording={isPronRecording}
                    pronTranscription={pronTranscription}
                    pronFeedback={pronFeedback}
                    onStartPronunciationVoice={startPronunciationVoice}
                    onNextPronSentence={handleNextPronSentence}
                  />
                )}
                {activeTab === 2 && (
                  <GrammarChecker
                    grammarInput={grammarInput}
                    setGrammarInput={setGrammarInput}
                    checkingGrammar={checkingGrammar}
                    grammarFeedback={grammarFeedback}
                    onCheckFreeformGrammar={handleCheckFreeformGrammar}
                    onResetFreeform={handleResetFreeform}
                  />
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Right Column: Actions Sidebar */}
          <Grid size={{xs:12,md:4}}>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Structured Syllabus Tracker */}
              <ContinueLearning
                lessonStats={lessonStats}
                nextLesson={nextLesson}
                onNavigate={() => navigate('/lessons')}
              />

              {/* Quick Actions Panel */}
              <QuickActions
                stats={stats}
                onNavigateChat={() => navigate('/conversation')}
                onNavigateProgress={() => navigate('/progress')}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}