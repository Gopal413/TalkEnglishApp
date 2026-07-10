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
  Grid
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import LanguageIcon from '@mui/icons-material/Language';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { getUserProfile, updateUserSettings } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

export default function Settings() {
  const { logout } = useAuth();
  
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

  // Feedback states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
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
      } catch (err) {
        console.error("Failed to load settings:", err);
        setError("Could not load your profile settings.");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

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
      
      await updateUserSettings(payload);
      setSuccess("Your profile and preferences were saved successfully!");
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
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={50} />
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F7F9FC', minHeight: '100vh', pb: 12 }}>
      {/* Hero Header */}
      <Box sx={{ background: 'linear-gradient(135deg, #4A9B9B 0%, #2D7D7D 100%)', pt: 5, pb: 4, px: 3 }}>
        <Container maxWidth="sm">
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', mb: 0.5 }}>Your Configuration</Typography>
          <Typography variant="h5" fontWeight="800" color="#fff">Account Settings ⚙️</Typography>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ mt: 3, pb: 4, px: { xs: 2, sm: 3 } }}>
        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 4, border: '1px solid rgba(0,0,0,0.06)', bgcolor: '#ffffff' }}>
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSaveSettings} sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            
            {/* 👤 Section 1: User Profile Details */}
            <Box>
              <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#1a1a2e' }}>
                <PersonIcon color="primary" /> Profile Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
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
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="State"
                    value={userState}
                    onChange={(e) => setUserState(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Level selection */}
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ fontWeight: '800', color: 'text.primary', mb: 1 }}>
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
              <FormLabel component="legend" sx={{ fontWeight: '800', color: 'text.primary', mb: 1 }}>
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
              <Typography variant="body1" fontWeight="800" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LanguageIcon color="action" /> Native Language Helper
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                Used for the chat's quick inline translation feature.
              </Typography>
              <Select
                fullWidth
                value={nativeLanguage}
                onChange={(e) => setNativeLanguage(e.target.value)}
                sx={{ borderRadius: 2 }}
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid rgba(0,0,0,0.02)' }}>
              <Box>
                <Typography variant="body2" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <NotificationsActiveIcon sx={{ fontSize: 18 }} color="action" /> Practice Reminders
                </Typography>
                <Typography variant="caption" color="text.secondary">Send daily notifications to maintain streak.</Typography>
              </Box>
              <Switch 
                checked={dailyReminder} 
                onChange={(e) => setDailyReminder(e.target.checked)} 
                color="primary" 
              />
            </Box>

            {/* Save button */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={saving}
              sx={{ py: 1.5, borderRadius: '24px', fontWeight: 'bold', textTransform: 'none', fontSize: '16px' }}
            >
              {saving ? <CircularProgress size={26} color="inherit" /> : 'Save Changes'}
            </Button>
            
            <Divider sx={{ my: 1 }} />
            
            {/* 🔒 Section 3: Sign Out Action */}
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={logout}
              startIcon={<ExitToAppIcon />}
              sx={{ py: 1.2, borderRadius: '24px', textTransform: 'none', fontWeight: 'bold' }}
            >
              Sign Out of Account
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
