import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, 
    Container, 
    Typography, 
    Button, 
    Grid, 
    Card, 
    CardContent, 
    Paper, 
    Avatar, 
    Chip, 
    IconButton,
    TextField,
    InputAdornment,
    Divider
} from '@mui/material';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ForumIcon from '@mui/icons-material/Forum';
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import MicIcon from '@mui/icons-material/Mic';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    // Automatically redirect authenticated users to the home dashboard
    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // Live grammar check demo state
    const [demoInput, setDemoInput] = useState('He do not like going to the market.');
    const [demoCorrection, setDemoCorrection] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleDemoCheck = () => {
        setIsAnalyzing(true);
        setTimeout(() => {
            if (demoInput.toLowerCase().includes('he do not')) {
                setDemoCorrection({
                    original: 'He do not like...',
                    corrected: 'He does not like going to the market.',
                    message: "Use 'does not' (or 'doesn't') for third-person singular subjects (he, she, it)."
                });
            } else {
                setDemoCorrection({
                    original: demoInput,
                    corrected: demoInput,
                    message: "Looks good! Perfect subject-verb agreement."
                });
            }
            setIsAnalyzing(false);
        }, 800);
    };

    return (
        <Box sx={{ bgcolor: '#F7F9FC', minHeight: '100vh', overflowX: 'hidden' }}>
            {/* Hero Section */}
            <Box 
                sx={{
                    background: 'radial-gradient(circle at 10% 20%, rgba(74, 155, 155, 0.1) 0%, rgba(224, 123, 106, 0.05) 90%), #ffffff',
                    pt: { xs: 10, md: 16 },
                    pb: { xs: 8, md: 12 },
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                    position: 'relative'
                }}
            >
                {/* Background decorative blobs */}
                <Box sx={{ position: 'absolute', top: '10%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(74, 155, 155, 0.05)', filter: 'blur(60px)', zIndex: 0 }} />
                <Box sx={{ position: 'absolute', bottom: '15%', right: '10%', width: 250, height: 250, borderRadius: '50%', background: 'rgba(224, 123, 106, 0.05)', filter: 'blur(50px)', zIndex: 0 }} />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Chip 
                                label="✨ TalkEnglish AI 2.0" 
                                sx={{ 
                                    bgcolor: 'primary.light', 
                                    color: 'primary.main', 
                                    fontWeight: '700', 
                                    mb: 2, 
                                    px: 1, 
                                    py: 0.5,
                                    fontSize: '13px'
                                }} 
                            />
                            <Typography 
                                variant="h1" 
                                sx={{ 
                                    fontSize: { xs: '36px', sm: '48px', md: '56px' }, 
                                    fontWeight: 900, 
                                    lineHeight: 1.15,
                                    color: '#1a1a2e',
                                    letterSpacing: '-1.5px',
                                    mb: 2
                                }}
                            >
                                Speak English Confidently with{' '}
                                <Box component="span" sx={{ color: 'primary.main', position: 'relative' }}>
                                    Luna AI
                                    <Box component="span" sx={{ position: 'absolute', bottom: -5, left: 0, width: '100%', height: '4px', bgcolor: 'secondary.main', borderRadius: 2 }} />
                                </Box>
                            </Typography>
                            <Typography 
                                variant="h6" 
                                color="text.secondary" 
                                sx={{ 
                                    fontWeight: 500, 
                                    fontSize: { xs: '16px', sm: '18px' }, 
                                    mb: 4, 
                                    lineHeight: 1.6 
                                }}
                            >
                                Engage in realistic, adaptive conversations, master pronunciation, and receive gentle, real-time grammar guidance from your private, AI-powered speech partner.
                              </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                <Button 
                                    variant="contained" 
                                    size="large"
                                    onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                                    endIcon={<ArrowForwardIcon />}
                                    sx={{ 
                                        py: 1.6, 
                                        px: 4, 
                                        fontSize: '16px',
                                        boxShadow: '0 8px 24px rgba(74, 155, 155, 0.25)'
                                    }}
                                >
                                    {isAuthenticated ? 'Go to Dashboard' : 'Start Speaking Free'}
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    color="inherit" 
                                    size="large"
                                    onClick={() => {
                                        const element = document.getElementById('demo-section');
                                        element?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    sx={{ 
                                        py: 1.6, 
                                        px: 4, 
                                        fontSize: '16px',
                                        borderColor: '#ddd',
                                        color: '#555',
                                        '&:hover': {
                                            borderColor: '#999',
                                            bgcolor: 'rgba(0,0,0,0.02)'
                                        }
                                    }}
                                >
                                    Try Live Demo
                                </Button>
                            </Box>
                            
                            {/* Stats/Badges */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mt: 5, flexWrap: 'wrap' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {[...Array(5)].map((_, i) => (
                                        <StarIcon key={i} sx={{ color: '#FFB800', fontSize: 20 }} />
                                    ))}
                                    <Typography variant="body2" sx={{ ml: 1, fontWeight: '700', color: '#1a1a2e' }}>4.9/5 Rating</Typography>
                                </Box>
                                <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: '500' }}>Active Users</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: '800', color: '#1a1a2e' }}>50,000+ Globally</Typography>
                                </Box>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            {/* App Mockup Display */}
                            <Paper 
                                elevation={10} 
                                sx={{ 
                                    borderRadius: '24px', 
                                    overflow: 'hidden', 
                                    boxShadow: '0px 20px 50px rgba(0, 0, 0, 0.08)',
                                    border: '6px solid #fff',
                                    position: 'relative'
                                }}
                            >
                                <Box 
                                    component="img" 
                                    src="/dashboard_mockup.jpg" 
                                    alt="TalkEnglish Interactive Dashboard Interface Mockup"
                                    sx={{ 
                                        width: '100%', 
                                        height: 'auto', 
                                        display: 'block' 
                                    }} 
                                />
                                {/* Overlay glassmorphic badge */}
                                <Box 
                                    sx={{
                                        position: 'absolute',
                                        bottom: 20,
                                        left: 20,
                                        bgcolor: 'rgba(255, 255, 255, 0.85)',
                                        backdropFilter: 'blur(8px)',
                                        borderRadius: '16px',
                                        p: 2,
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        border: '1px solid rgba(255,255,255,0.4)',
                                        maxWidth: '280px',
                                        display: { xs: 'none', sm: 'flex' }
                                    }}
                                >
                                    <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>L</Avatar>
                                    <Box>
                                        <Typography variant="body2" fontWeight="800" color="#1a1a2e">Meet Tutor Luna</Typography>
                                        <Typography variant="caption" color="text.secondary">"Ready for a chat? Your level is auto-tuned!"</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Interactive Live Demo Section */}
            <Box id="demo-section" sx={{ py: 10, bgcolor: '#ffffff' }}>
                <Container maxWidth="md">
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Chip label="TRY IT NOW" color="secondary" sx={{ fontWeight: 'bold', mb: 1 }} />
                        <Typography variant="h3" fontWeight="800" sx={{ mb: 2 }}>
                            Test the Grammar Coach Live
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Type a sentence with an error below to see how our AI instant-correction engine works.
                        </Typography>
                    </Box>

                    <Paper 
                        elevation={0} 
                        sx={{ 
                            p: { xs: 2, sm: 4 }, 
                            borderRadius: '20px', 
                            border: '1.5px solid rgba(74, 155, 155, 0.15)',
                            bgcolor: '#F7F9FC' 
                        }}
                    >
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
                                    Type your English sentence:
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={demoInput}
                                    onChange={(e) => setDemoInput(e.target.value)}
                                    placeholder="Write something in English..."
                                    slotProps={{
                                        input: { sx: { bgcolor: '#fff', borderRadius: '12px' } }
                                    }}
                                />
                            </Grid>
                            
                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                    💡 Try typing: <em>"We was playing soccer."</em> or <em>"She like coffee."</em>
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={handleDemoCheck}
                                    disabled={isAnalyzing}
                                    startIcon={<AutoFixHighIcon />}
                                    sx={{ py: 1.2, px: 3 }}
                                >
                                    {isAnalyzing ? 'Analyzing...' : 'Check Grammar'}
                                </Button>
                            </Grid>

                            {demoCorrection && (
                                <Grid item xs={12}>
                                    <Box 
                                        sx={{ 
                                            p: 2.5, 
                                            borderRadius: '12px', 
                                            bgcolor: demoCorrection.original === demoCorrection.corrected ? '#E8F5E9' : '#FFFDE7',
                                            borderLeft: `5px solid ${demoCorrection.original === demoCorrection.corrected ? '#2e7d32' : '#fbc02d'}`,
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        <Typography variant="subtitle2" fontWeight="800" color="text.primary" sx={{ mb: 1 }}>
                                            {demoCorrection.original === demoCorrection.corrected ? '✅ All Correct!' : '📝 Grammar Tip'}
                                        </Typography>
                                        {demoCorrection.original !== demoCorrection.corrected && (
                                            <>
                                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                    <strong>Original:</strong> <s>"{demoCorrection.original}"</s>
                                                </Typography>
                                                <Typography variant="body2" sx={{ mb: 1, color: 'primary.main', fontWeight: '700' }}>
                                                    <strong>Corrected:</strong> "{demoCorrection.corrected}"
                                                </Typography>
                                            </>
                                        )}
                                        <Typography variant="caption" display="block" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                            {demoCorrection.message}
                                        </Typography>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </Paper>
                </Container>
            </Box>

            {/* Core Features Showcase */}
            <Box sx={{ py: 12, bgcolor: '#F7F9FC' }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography variant="h3" fontWeight="800" sx={{ mb: 2 }}>
                            Designed to Accelerate Your Fluency
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
                            TalkEnglish brings together advanced AI technologies to address all aspects of spoken and written language learning.
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        {[
                            {
                                icon: <ForumIcon sx={{ fontSize: 36, color: '#4A9B9B' }} />,
                                title: "Adaptive Luna AI Chat",
                                desc: "Engage in free-flowing conversations. Luna dynamically adjusts her speech vocabulary and grammatical complexity to match your skill level.",
                                bg: '#E8F4F4'
                            },
                            {
                                icon: <MicIcon sx={{ fontSize: 36, color: '#E07B6A' }} />,
                                title: "Pronunciation Analysis",
                                desc: "Read target sentences aloud. Our speech analyzer compares your reading against native pronunciations, generating accuracy scores instantly.",
                                bg: '#FDF0EE'
                            },
                            {
                                icon: <AutoFixHighIcon sx={{ fontSize: 36, color: '#7B68EE' }} />,
                                title: "Grammar Coach",
                                desc: "Get detailed, constructive corrections on your texts. Build structural awareness and speak English correctly.",
                                bg: '#F0EEFF'
                            },
                            {
                                icon: <RecordVoiceOverIcon sx={{ fontSize: 36, color: '#27AE60' }} />,
                                title: "British/American Accents",
                                desc: "Train your ears to understand multiple environments. Pick between accents and adjust playback speech speed to suit your comfort.",
                                bg: '#E8F8F0'
                            }
                        ].map((feat, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card 
                                    elevation={0}
                                    sx={{ 
                                        height: '100%', 
                                        borderRadius: '16px', 
                                        border: '1px solid rgba(0,0,0,0.05)',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 8px 30px rgba(0,0,0,0.05)'
                                        },
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Box 
                                            sx={{ 
                                                width: 60, 
                                                height: 60, 
                                                borderRadius: '12px', 
                                                bgcolor: feat.bg, 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                mb: 2.5
                                            }}
                                        >
                                            {feat.icon}
                                        </Box>
                                        <Typography variant="h6" fontWeight="800" sx={{ mb: 1.5 }}>
                                            {feat.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                            {feat.desc}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>


            {/* Footer */}
            <Box sx={{ bgcolor: '#1a1a2e', color: 'rgba(255, 255, 255, 0.7)', py: 6, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#4A9B9B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <RecordVoiceOverIcon sx={{ color: '#fff', fontSize: 18 }} />
                                </Box>
                                <Typography variant="h6" fontWeight="800" sx={{ color: '#fff', letterSpacing: '-0.5px' }}>
                                    TalkEnglish
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ lineHeight: 1.6, maxWidth: '280px' }}>
                                Helping learners achieve English speaking confidence through real-time adaptive AI coaching and grammar tips.
                            </Typography>
                        </Grid>
                        <Grid item xs={6} md={4}>
                            <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#fff', mb: 2 }}>Platform</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {['Features', 'Luna AI Tutor', 'Grammar Coach', 'Pronunciation Coach'].map((text, i) => (
                                    <Typography key={i} variant="caption" sx={{ cursor: 'pointer', '&:hover': { color: '#fff' } }}>{text}</Typography>
                                ))}
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={4}>
                            <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#fff', mb: 2 }}>Company</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {['About Us', 'Contact Support', 'Privacy Policy', 'Terms of Service'].map((text, i) => (
                                    <Typography key={i} variant="caption" sx={{ cursor: 'pointer', '&:hover': { color: '#fff' } }}>{text}</Typography>
                                ))}
                            </Box>
                        </Grid>
                    </Grid>
                    
                    <Divider sx={{ bgcolor: 'rgba(255,255,255,0.08)', mb: 3 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="caption">© 2026 TalkEnglish Inc. All rights reserved.</Typography>
                        <Typography variant="caption">Crafted by Antigravity AI</Typography>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
}
