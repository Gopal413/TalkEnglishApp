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
        <Container maxWidth="sm" sx={{ mt: { xs: 4, sm: 8 }, mb: 4, px: { xs: 2, sm: 3 } }}>
            <Paper elevation={4} sx={{ p: { xs: 3, sm: 5 }, borderRadius: '16px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: 'primary.light', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                        <TranslateIcon color="primary" sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography component="h1" variant="h4" fontWeight="800" textAlign="center">
                        Personalize EnglishTalk
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
                        Help us adapt the conversational difficulty engines to fit your profile.
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}

                <Box component="form" onSubmit={handleOnboardingSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    
                    {/* ENGLISH FLUENCY LEVEL CHOICE ENTRY */}
                    <FormControl component="fieldset">
                        <FormLabel component="legend" sx={{ fontWeight: '700', color: 'text.primary', mb: 1 }}>
                            What is your current speaking level?
                        </FormLabel>
                        <RadioGroup value={level} onChange={(e) => setLevel(e.target.value)}>
                            <FormControlLabel value="beginner" control={<Radio />} label="Beginner (Just starting out)" />
                            <FormControlLabel value="intermediate" control={<Radio />} label="Intermediate (Can hold basic talks)" />
                            <FormControlLabel value="advanced" control={<Radio />} label="Advanced (Fluent discussions)" />
                        </RadioGroup>
                    </FormControl>

                    {/* TARGET INTENT PRACTICE GOAL CHOICE ENTRY[cite: 1] */}
                    <FormControl component="fieldset">
                        <FormLabel component="legend" sx={{ fontWeight: '700', color: 'text.primary', mb: 1 }}>
                            What is your main practice goal?
                        </FormLabel>
                        <RadioGroup value={goal} onChange={(e) => setGoal(e.target.value)}>
                            <FormControlLabel value="travel" control={<Radio />} label="Travel (Vacations & tourism)" />
                            <FormControlLabel value="business" control={<Radio />} label="Business (Career growth & meetings)" />
                            <FormControlLabel value="casual" control={<Radio />} label="Casual (Daily friendly chats)" />
                        </RadioGroup>
                    </FormControl>

                    {/* DAILY NOTIFICATION ACCESSIBILITY SWITCH[cite: 1] */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: 'action.hover', borderRadius: '8px' }}>
                        <Box>
                            <Typography variant="body1" fontWeight="600">Daily Practice Reminder</Typography>
                            <Typography variant="caption" color="text.secondary">We will remind you to keep up your consistency streak.</Typography>
                        </Box>
                        <Switch checked={dailyReminder} onChange={(e) => setDailyReminder(e.target.checked)} color="primary" />
                    </Box>

                    {/* SUBMIT COMPUTE ACTIONS TRIGGER */}
                    <Button
                        type="submit" fullWidth variant="contained" size="large"
                        disabled={loading || !level || !goal}
                        sx={{ mt: 2, py: 1.5, borderRadius: '8px', fontWeight: 'bold', textTransform: 'none', fontSize: '16px' }}
                    >
                        {loading ? <CircularProgress size={26} color="inherit" /> : 'Get Started'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

export default Onboarding;