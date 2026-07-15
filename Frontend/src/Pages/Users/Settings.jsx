import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Switch, 
  CircularProgress, 
  Alert,
  Divider,
  Select,
  MenuItem,
  TextField,
  Grid,
  Avatar,
  Chip,
  IconButton
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import LanguageIcon from '@mui/icons-material/Language';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import PhoneIcon from '@mui/icons-material/Phone';
import CakeIcon from '@mui/icons-material/Cake';
import PlaceIcon from '@mui/icons-material/Place';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import { getUserProfile, updateUserSettings } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

const levelColors = {
  beginner: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', label: 'Beginner' },
  intermediate: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: 'Intermediate' },
  advanced: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', label: 'Advanced' }
};
const TEAL = '#4A9B9B'; 
const CORAL = '#E07B6A';
const goalLabels = {
  travel: '✈️ Travel & Tourism',
  business: '💼 Work & Job Interviews',
  casual: '💬 Casual Social Conversations'
};

const languageNames = {
  en: 'English',
  es: 'Español (Spanish)',
  hi: 'हिन्दी (Hindi)',
  fr: 'Français (French)',
  de: 'Deutsch (German)',
  zh: '中文 (Chinese)',
  ja: '日本語 (Japanese)'
};

export default function Settings() {
  const { user, login, logout } = useAuth();
  
  // Profile info states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [userState, setUserState] = useState('');
  const [country, setCountry] = useState('');
  
  // Preferences states
  const [level, setLevel] = useState('');
  const [goal, setGoal] = useState('');
  const [dailyReminder, setDailyReminder] = useState(true);
  const [nativeLanguage, setNativeLanguage] = useState('en'); 

  // Backup states for cancelling edits
  const [backupData, setBackupData] = useState(null);
  
  // UI states
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadProfile = async () => {
    try {
      const data = await getUserProfile();
      setName(data.name || '');
      setPhone(data.phone || '');
      setAge(data.age || '');
      setUserState(data.state || '');
      setCountry(data.country || '');
      
      setLevel(data.level || 'beginner');
      setGoal(data.goal || 'casual');
      setDailyReminder(data.settings?.dailyReminder !== false);
      setNativeLanguage(data.settings?.nativeLanguage || 'en');

      // Store a backup copy
      setBackupData({
        name: data.name || '',
        phone: data.phone || '',
        age: data.age || '',
        state: data.state || '',
        country: data.country || '',
        level: data.level || 'beginner',
        goal: data.goal || 'casual',
        dailyReminder: data.settings?.dailyReminder !== false,
        nativeLanguage: data.settings?.nativeLanguage || 'en'
      });
    } catch (err) {
      console.error("Failed to load settings:", err);
      setError("Could not load your profile settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleCancelEdit = () => {
    if (backupData) {
      setName(backupData.name);
      setPhone(backupData.phone);
      setAge(backupData.age);
      setUserState(backupData.state);
      setCountry(backupData.country);
      setLevel(backupData.level);
      setGoal(backupData.goal);
      setDailyReminder(backupData.dailyReminder);
      setNativeLanguage(backupData.nativeLanguage);
    }
    setIsEditMode(false);
    setError('');
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name,
        phone,
        age: Number(age),
        state: userState,
        country,
        level,
        goal,
        dailyReminder,
        nativeLanguage
      };
      
      const res = await updateUserSettings(payload);
      if (res && res.user) {
          login(res.user);
      } else {
          login({ ...user, name, phone, age: Number(age), state: userState, country, level, goal, settings: { dailyReminder, nativeLanguage } });
      }
      setBackupData(payload); // Update backup reference
      setSuccess("Your profile and preferences were saved successfully!");
      setIsEditMode(false);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError("Unable to save preferences. Please check connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={50} sx={{ color: '#4A9B9B' }} />
      </Box>
    );
  }

  const userInitial = name?.[0]?.toUpperCase() || 'U';
  const currentLvlInfo = levelColors[level] || levelColors.beginner;

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 12 }}>
      {/* Hero Header */}
      <Box sx={{ background: `linear-gradient(135deg, ${TEAL} 0%, #205E5E 100%)`, pt: 5, pb: 4, px: 3 }}>
        <Container maxWidth="sm">
          <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', mb: 0.5, fontWeight: '700', letterSpacing: '0.5px' }}>YOUR CONFIGURATION</Typography>
          <Typography variant="h5" fontWeight="900" color="#fff">Account Settings ⚙️</Typography>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ mt: 3, pb: 4, px: { xs: 2.5, sm: 3 } }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, sm: 5 }, 
            borderRadius: '24px', 
            border: '1px solid rgba(0,0,0,0.04)', 
            bgcolor: '#ffffff', 
            position: 'relative',
            boxShadow: '0 8px 30px rgba(0,0,0,0.01)'
          }}
        >
          
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{success}</Alert>}

          {/* ── View Mode: Profile Card ── */}
          {!isEditMode ? (
            <Box>
              {/* Profile Card Top Header */}
              <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center', mb: 4, position: 'relative' }}>
                <Avatar sx={{ width: 72, height: 72, bgcolor: TEAL, fontSize: '26px', fontWeight: '900', boxShadow: '0 6px 16px rgba(74, 155, 155, 0.25)', border: '3px solid #FFF' }}>
                  {userInitial}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight="900" sx={{ color: '#1a1a2e', lineHeight: 1.2 }}>{name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3, fontWeight: '500' }}>Active Student</Typography>
                  <Chip 
                    label={currentLvlInfo.label} 
                    size="small" 
                    sx={{ mt: 0.8, bgcolor: currentLvlInfo.bg, color: currentLvlInfo.color, fontWeight: '800', fontSize: '11px', height: '22px', borderRadius: '6px' }} 
                  />
                </Box>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditMode(true)}
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    right: 0, 
                    textTransform: 'none', 
                    borderRadius: '20px', 
                    fontWeight: '700',
                    borderColor: TEAL,
                    color: TEAL,
                    borderWidth: '1.5px',
                    '&:hover': { borderColor: '#205E5E', bgcolor: 'rgba(74, 155, 155, 0.05)', borderWidth: '1.5px' }
                  }}
                >
                  Edit Profile
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Profile Details List */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Profile Details
                  </Typography>
                  <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <PhoneIcon sx={{ color: '#64748b', fontSize: 18 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: '500' }}>Phone</Typography>
                          <Typography variant="body2" fontWeight="700" sx={{ color: '#1a1a2e' }}>{phone || 'N/A'}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CakeIcon sx={{ color: '#64748b', fontSize: 18 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: '500' }}>Age</Typography>
                          <Typography variant="body2" fontWeight="700" sx={{ color: '#1a1a2e' }}>{age || 'N/A'}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <PlaceIcon sx={{ color: '#64748b', fontSize: 18 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: '500' }}>Region / Location</Typography>
                          <Typography variant="body2" fontWeight="700" sx={{ color: '#1a1a2e' }}>
                            {userState && country ? `${userState}, ${country}` : userState || country || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                {/* Preferences Details */}
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', mb: 1.8 }}>
                    Speaking Preferences
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.8 }}>
                      <SchoolIcon sx={{ color: TEAL, mt: 0.2 }} />
                      <Box>
                        <Typography variant="body2" fontWeight="800" sx={{ color: '#1a1a2e' }}>Comfort level</Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.2, lineHeight: 1.4 }}>
                          {level === 'beginner' && 'Beginner - Short simple dialogues'}
                          {level === 'intermediate' && 'Intermediate - General topics at standard speed'}
                          {level === 'advanced' && 'Advanced - Idioms and fluent discussion'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.8 }}>
                      <EmojiEventsIcon sx={{ color: CORAL, mt: 0.2 }} />
                      <Box>
                        <Typography variant="body2" fontWeight="800" sx={{ color: '#1a1a2e' }}>Target Goal</Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.2 }}>
                          {goalLabels[goal] || goal}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.8 }}>
                      <LanguageIcon sx={{ color: '#64748b', mt: 0.2 }} />
                      <Box>
                        <Typography variant="body2" fontWeight="800" sx={{ color: '#1a1a2e' }}>Native Helper Language</Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.2 }}>
                          {languageNames[nativeLanguage] || nativeLanguage}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.8 }}>
                      <NotificationsActiveIcon sx={{ color: '#64748b', mt: 0.2 }} />
                      <Box>
                        <Typography variant="body2" fontWeight="800" sx={{ color: '#1a1a2e' }}>Practice Notifications</Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.2 }}>
                          {dailyReminder ? 'Enabled (Daily notifications to build streak)' : 'Disabled'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ mt: 1 }} />

                {/* Sign Out Action */}
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={logout}
                  startIcon={<ExitToAppIcon />}
                  sx={{ 
                    py: 1.4, 
                    borderRadius: '24px', 
                    textTransform: 'none', 
                    fontWeight: '700', 
                    mt: 1,
                    borderWidth: '1.5px',
                    '&:hover': { borderWidth: '1.5px' }
                  }}
                >
                  Sign Out of Account
                </Button>
              </Box>
            </Box>
          ) : (
            /* ── Edit Mode: Form Fields ── */
            <Box component="form" onSubmit={handleSaveSettings} sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              
              {/* Header inside Edit mode */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="900" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1a1a2e' }}>
                  <PersonIcon color="primary" /> Edit Profile Details
                </Typography>
                <IconButton onClick={handleCancelEdit} disabled={saving} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
              
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={saving}
                    slotProps={{ input: { sx: { borderRadius: '12px' } } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    disabled={saving}
                    slotProps={{ input: { sx: { borderRadius: '12px' } } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    disabled={saving}
                    slotProps={{ input: { sx: { borderRadius: '12px' } } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="State"
                    value={userState}
                    onChange={(e) => setUserState(e.target.value)}
                    required
                    disabled={saving}
                    slotProps={{ input: { sx: { borderRadius: '12px' } } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    disabled={saving}
                    slotProps={{ input: { sx: { borderRadius: '12px' } } }}
                  />
                </Grid>
              </Grid>

              <Divider />

              {/* Level selection */}
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ fontWeight: '900', color: '#1a1a2e', mb: 1 }}>
                  Comfort English Level
                </FormLabel>
                <RadioGroup value={level} onChange={(e) => setLevel(e.target.value)}>
                  <FormControlLabel value="beginner" control={<Radio size="small" />} label="Beginner (Simple words, slower conversations)" />
                  <FormControlLabel value="intermediate" control={<Radio size="small" />} label="Intermediate (Everyday topics, standard pace)" />
                  <FormControlLabel value="advanced" control={<Radio size="small" />} label="Advanced (Rich expressions, normal speed)" />
                </RadioGroup>
              </FormControl>

              <Divider />

              {/* Goal selection */}
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ fontWeight: '900', color: '#1a1a2e', mb: 1 }}>
                  Speaking Learning Goal
                </FormLabel>
                <RadioGroup value={goal} onChange={(e) => setGoal(e.target.value)}>
                  <FormControlLabel value="travel" control={<Radio size="small" />} label="Travel (Tourism, airport, hotel booking)" />
                  <FormControlLabel value="business" control={<Radio size="small" />} label="Business (Meetings, interview, workspace terms)" />
                  <FormControlLabel value="casual" control={<Radio size="small" />} label="Casual (Hobbies, daily conversations, friends)" />
                </RadioGroup>
              </FormControl>

              <Divider />

              {/* Translation helper language */}
              <Box>
                <Typography variant="body2" fontWeight="800" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, color: '#1a1a2e' }}>
                  <LanguageIcon color="action" /> Native Language Helper
                </Typography>
                <Select
                  fullWidth
                  value={nativeLanguage}
                  onChange={(e) => setNativeLanguage(e.target.value)}
                  sx={{ borderRadius: '12px' }}
                  disabled={saving}
                >
                  <MenuItem value="en">English (English)</MenuItem>
                  <MenuItem value="es">Español (Spanish)</MenuItem>
                  <MenuItem value="hi">हिन्दी (Hindi)</MenuItem>
                  <MenuItem value="fr">Français (French)</MenuItem>
                  <MenuItem value="de">Deutsch (German)</MenuItem>
                  <MenuItem value="zh">中文 (Chinese)</MenuItem>
                  <MenuItem value="ja">日本語 (Japanese)</MenuItem>
                </Select>
              </Box>

              <Divider />

              {/* Notifications config switch */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', p: 2.5, bgcolor: '#F8FAFC', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.02)' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight="800" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#1a1a2e' }}>
                    <NotificationsActiveIcon sx={{ fontSize: 18 }} color="action" /> Practice Reminders
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: '500' }}>Send daily notifications to maintain streak.</Typography>
                </Box>
                <Switch 
                  checked={dailyReminder} 
                  onChange={(e) => setDailyReminder(e.target.checked)} 
                  color="primary" 
                  disabled={saving}
                />
              </Box>

              <Divider sx={{ my: 1 }} />

              {/* Save / Cancel buttons */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleCancelEdit}
                  disabled={saving}
                  sx={{ 
                    py: 1.4, 
                    borderRadius: '24px', 
                    fontWeight: '700', 
                    textTransform: 'none',
                    borderWidth: '1.5px',
                    '&:hover': { borderWidth: '1.5px' }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={saving}
                  startIcon={!saving && <SaveIcon />}
                  sx={{ 
                    py: 1.4, 
                    borderRadius: '24px', 
                    fontWeight: '700', 
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(74, 155, 155, 0.25)'
                  }}
                >
                  {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
