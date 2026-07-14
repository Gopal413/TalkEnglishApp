import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, 
    Container, 
    Typography, 
    Button, 
    Paper, 
    FormControl, 
    FormLabel, 
    RadioGroup, 
    FormControlLabel, 
    Radio, 
    CircularProgress, 
    Alert,
    Switch
} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';

import { useAuth } from '../../context/AuthContext';
import { submitOnboardingData } from '../../api/authApi';

function Onboarding() {
    const navigate = useNavigate();
    const { login } = useAuth(); // Grabs login brain to replace global user state data payload

    // Native state handlers for choice metrics
    const [level, setLevel] = useState('');
    const [goal, setGoal] = useState('');
    const [dailyReminder, setDailyReminder] = useState(true);

    // UI State Feedback
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleOnboardingSubmit = async (e) => {
        e.preventDefault();

        if (!level || !goal) {
            setError('Please pick both your current proficiency level and core practice goal.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Send choices down to backend update query
            const data = await submitOnboardingData({ level, goal, dailyReminder });
            
            // Update AuthContext memory context tracking block so app knows user is now onboarded
            login(data.user);

            // Send them permanently straight into their fresh EnglishTalk Home Dashboard
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save setup selection choices.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: { xs: 4, sm: 8 }, mb: 4, px: { xs: 2.5, sm: 3 } }}>
            <Paper 
                elevation={0} 
                sx={{ 
                    p: { xs: 4, sm: 6 }, 
                    borderRadius: '24px',
                    border: '1px solid rgba(0,0,0,0.04)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4.5 }}>
                    <Box 
                        sx={{ 
                            width: 68, 
                            height: 68, 
                            borderRadius: '50%', 
                            backgroundColor: 'primary.light', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            mb: 2,
                            boxShadow: '0 4px 12px rgba(74, 155, 155, 0.2)'
                        }}
                    >
                        <TranslateIcon color="primary" sx={{ fontSize: 34 }} />
                    </Box>
                    <Typography component="h1" variant="h5" fontWeight="900" textAlign="center" sx={{ color: '#1a1a2e' }}>
                        Personalize TalkEnglish
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1, lineHeight: 1.5, fontSize: '13.5px' }}>
                        Help us adapt the conversational difficulty engines to fit your profile.
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3.5, borderRadius: '12px' }}>{error}</Alert>}

                <Box component="form" onSubmit={handleOnboardingSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    
                    {/* ENGLISH FLUENCY LEVEL CHOICE ENTRY */}
                    <FormControl component="fieldset">
                        <FormLabel component="legend" sx={{ fontWeight: '900', color: '#1a1a2e', mb: 1.5 }}>
                            What is your current speaking level?
                        </FormLabel>
                        <RadioGroup value={level} onChange={(e) => setLevel(e.target.value)}>
                            <FormControlLabel value="beginner" control={<Radio size="small" />} label="Beginner (Just starting out)" />
                            <FormControlLabel value="intermediate" control={<Radio size="small" />} label="Intermediate (Can hold basic talks)" />
                            <FormControlLabel value="advanced" control={<Radio size="small" />} label="Advanced (Fluent discussions)" />
                        </RadioGroup>
                    </FormControl>

                    {/* TARGET INTENT PRACTICE GOAL CHOICE ENTRY */}
                    <FormControl component="fieldset">
                        <FormLabel component="legend" sx={{ fontWeight: '900', color: '#1a1a2e', mb: 1.5 }}>
                            What is your main practice goal?
                        </FormLabel>
                        <RadioGroup value={goal} onChange={(e) => setGoal(e.target.value)}>
                            <FormControlLabel value="travel" control={<Radio size="small" />} label="Travel (Vacations & tourism)" />
                            <FormControlLabel value="business" control={<Radio size="small" />} label="Business (Career growth & meetings)" />
                            <FormControlLabel value="casual" control={<Radio size="small" />} label="Casual (Daily friendly chats)" />
                        </RadioGroup>
                    </FormControl>

                    {/* DAILY NOTIFICATION ACCESSIBILITY SWITCH */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.5, bgcolor: '#F8FAFC', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.02)' }}>
                        <Box>
                            <Typography variant="body2" fontWeight="800" sx={{ color: '#1a1a2e' }}>Daily Practice Reminder</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: '500', mt: 0.2, display: 'block' }}>We will remind you to keep up your consistency streak.</Typography>
                        </Box>
                        <Switch checked={dailyReminder} onChange={(e) => setDailyReminder(e.target.checked)} color="primary" />
                    </Box>

                    {/* SUBMIT COMPUTE ACTIONS TRIGGER */}
                    <Button
                        type="submit" fullWidth variant="contained" size="large"
                        disabled={loading || !level || !goal}
                        sx={{ 
                            mt: 2, 
                            py: 1.6, 
                            borderRadius: '24px', 
                            fontWeight: '700', 
                            textTransform: 'none', 
                            fontSize: '15px',
                            boxShadow: '0 4px 14px rgba(74, 155, 155, 0.25)'
                        }}
                    >
                        {loading ? <CircularProgress size={26} color="inherit" /> : 'Get Started'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

export default Onboarding;