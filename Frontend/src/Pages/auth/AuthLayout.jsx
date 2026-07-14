import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, IconButton } from '@mui/material';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const QUOTES = [
    { text: "“The limits of my language mean the limits of my world.”", author: "Ludwig Wittgenstein" },
    { text: "“Language is the blood of the soul into which thoughts run and out of which they grow.”", author: "Oliver Wendell Holmes" },
    { text: "“To have another language is to possess a second soul.”", author: "Charlemagne" },
    { text: "“Learning another language is not only learning different words for the same things, but learning another way to think about things.”", author: "Flora Lewis" },
    { text: "“A different language is a different vision of life.”", author: "Federico Fellini" }
];

function QuotesCarousel() {
    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setIndex((prev) => (prev + 1) % QUOTES.length);
                setFade(true);
            }, 500); // Allow fade out to finish
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    const quote = QUOTES[index];

    return (
        <Box sx={{ 
            minHeight: '120px', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            textAlign: 'center', 
            px: 4 
        }}>
            <Typography 
                variant="h6" 
                fontStyle="italic" 
                fontWeight="500" 
                sx={{ 
                    color: '#fff', 
                    mb: 2, 
                    lineHeight: 1.6,
                    opacity: fade ? 1 : 0,
                    transform: fade ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'opacity 0.5s ease, transform 0.5s ease'
                }}
            >
                {quote.text}
            </Typography>
            <Typography 
                variant="body2" 
                sx={{ 
                    color: '#E07B6A', 
                    fontWeight: 'bold', 
                    letterSpacing: '0.5px',
                    opacity: fade ? 1 : 0,
                    transition: 'opacity 0.5s ease'
                }}
            >
                — {quote.author}
            </Typography>
        </Box>
    );
}

export default function AuthLayout({ children, title, subtitle, showBackButton = false, onBackClick, splitLayout = true }) {
    const navigate = useNavigate();

    return (
        <Box 
            sx={{ 
                minHeight: '100vh', 
                width: '100%',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                py: { xs: 2, sm: 6 },
                px: 2,
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e1e38 50%, #2e2a4a 100%)',
            }}
        >
            {/* Animated Mesh Gradients */}
            <Box 
                sx={{ 
                    position: 'absolute', 
                    top: '-10%', 
                    left: '-10%', 
                    width: '50vw', 
                    height: '50vw', 
                    borderRadius: '50%', 
                    background: 'radial-gradient(circle, rgba(74, 155, 155, 0.25) 0%, rgba(0,0,0,0) 70%)',
                    filter: 'blur(40px)',
                    animation: 'floatBubble1 20s infinite alternate ease-in-out',
                    zIndex: 0
                }} 
            />
            <Box 
                sx={{ 
                    position: 'absolute', 
                    bottom: '-10%', 
                    right: '-10%', 
                    width: '60vw', 
                    height: '60vw', 
                    borderRadius: '50%', 
                    background: 'radial-gradient(circle, rgba(224, 123, 106, 0.2) 0%, rgba(0,0,0,0) 70%)',
                    filter: 'blur(50px)',
                    animation: 'floatBubble2 25s infinite alternate ease-in-out',
                    zIndex: 0
                }} 
            />
            
            {/* CSS Animation Keyframes Inject */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes floatBubble1 {
                    0% { transform: translate(0, 0) scale(1); }
                    100% { transform: translate(10%, 15%) scale(1.15); }
                }
                @keyframes floatBubble2 {
                    0% { transform: translate(0, 0) scale(1); }
                    100% { transform: translate(-15%, -10%) scale(1.1); }
                }
            `}} />

            {/* Back Button (Floating on Top Left of Screen) */}
            {showBackButton && (
                <IconButton 
                    onClick={onBackClick || (() => navigate(-1))}
                    sx={{ 
                        position: 'absolute', 
                        top: 24, 
                        left: 24, 
                        color: 'rgba(255,255,255,0.7)', 
                        bgcolor: 'rgba(255,255,255,0.06)',
                        backdropFilter: 'blur(5px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        zIndex: 10,
                        '&:hover': {
                            color: '#fff',
                            bgcolor: 'rgba(255,255,255,0.15)',
                        }
                    }}
                >
                    <ArrowBackIcon />
                </IconButton>
            )}

            {/* Dual Panel Glassmorphic Container */}
            <Paper 
                elevation={0}
                sx={{ 
                    width: '100%',
                    maxWidth: splitLayout ? 1000 : 460,
                    borderRadius: '24px', 
                    bgcolor: 'rgba(30, 41, 59, 0.55)', // Dark translucent background
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    overflow: 'hidden',
                    transition: 'all 0.3s ease-in-out'
                }}
            >
                {/* Left Panel: Quote Carousel */}
                {splitLayout && (
                    <Box 
                        sx={{
                            flex: 1,
                            display: { xs: 'none', md: 'flex' },
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            p: 6,
                            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                            position: 'relative',
                            overflow: 'hidden',
                            borderRight: '1px solid rgba(255,255,255,0.06)'
                        }}
                    >
                        {/* Decorative background shapes inside left panel */}
                        <Box sx={{ position: 'absolute', top: '-10%', left: '-10%', width: 250, height: 250, borderRadius: '50%', bgcolor: 'rgba(74, 155, 155, 0.3)', filter: 'blur(30px)' }} />
                        <Box sx={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 300, height: 300, borderRadius: '50%', bgcolor: 'rgba(224, 123, 106, 0.25)', filter: 'blur(40px)' }} />

                        {/* Top: Branding */}
                        <Box 
                            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, zIndex: 1, cursor: 'pointer' }}
                            onClick={() => navigate('/')}
                        >
                            <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                                <RecordVoiceOverIcon sx={{ color: '#fff', fontSize: 20 }} />
                            </Box>
                            <Typography variant="h6" fontWeight="900" sx={{ letterSpacing: '-0.5px', color: '#fff' }}>
                                TalkEnglish
                            </Typography>
                        </Box>

                        {/* Center: Quote Carousel */}
                        <Box sx={{ zIndex: 1, my: 'auto', py: 4 }}>
                            <Box sx={{ 
                                width: 120, 
                                height: 120, 
                                borderRadius: '50%', 
                                bgcolor: 'rgba(255,255,255,0.08)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                mb: 4, 
                                mx: 'auto', 
                                border: '2px dashed rgba(255,255,255,0.25)' 
                            }}>
                                <Box sx={{ width: 88, height: 88, borderRadius: '50%', bgcolor: '#4A9B9B', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px rgba(74, 155, 155, 0.4)' }}>
                                    <RecordVoiceOverIcon sx={{ color: '#fff', fontSize: 38 }} />
                                </Box>
                            </Box>
                            <QuotesCarousel />
                        </Box>

                        {/* Bottom: Version Info */}
                        <Box sx={{ zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', pt: 3 }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                TalkEnglish AI Tutor v2.0
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}>
                                Speak Confidently
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* Right Panel: Form Content */}
                <Box 
                    sx={{ 
                        width: '100%',
                        maxWidth: splitLayout ? { xs: '100%', md: 500 } : '100%',
                        p: { xs: 3, sm: 5 },
                        color: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                    }}
                >
                    {/* Brand header for mobile or when split screen is off */}
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            mb: 3,
                            cursor: 'pointer'
                        }}
                        onClick={() => navigate('/')}
                    >
                        <Box 
                            sx={{ 
                                width: 52, 
                                height: 52, 
                                borderRadius: '16px', 
                                bgcolor: 'primary.main', 
                                display: { xs: 'flex', md: splitLayout ? 'none' : 'flex' }, 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                mb: 2,
                                boxShadow: '0 8px 20px rgba(74, 155, 155, 0.3)'
                            }}
                        >
                            <RecordVoiceOverIcon sx={{ color: '#fff', fontSize: 26 }} />
                        </Box>
                        <Typography 
                            variant="h5" 
                            fontWeight="900" 
                            sx={{ 
                                letterSpacing: '-0.5px', 
                                color: '#fff',
                                display: { xs: 'block', md: splitLayout ? 'none' : 'block' },
                                mb: 0.5 
                            }}
                        >
                            TalkEnglish
                        </Typography>
                        {title && (
                            <Typography 
                                variant="h5" 
                                fontWeight="800" 
                                sx={{ color: '#fff', mt: 1, textAlign: 'center', letterSpacing: '-0.5px' }}
                            >
                                {title}
                            </Typography>
                        )}
                        {subtitle && (
                            <Typography 
                                variant="body2" 
                                sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5, textAlign: 'center' }}
                            >
                                {subtitle}
                            </Typography>
                        )}
                    </Box>

                    {/* Children Inputs */}
                    <Box sx={{
                        '& .MuiTextField-root': {
                            mb: 2,
                            '& label': { color: 'rgba(255,255,255,0.5)' },
                            '& label.Mui-focused': { color: 'primary.main' },
                            '& .MuiInputBase-input': { color: '#fff' },
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'rgba(255,255,255,0.04)',
                                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                '&:hover fieldset': { borderColor: 'primary.main' },
                                '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                            }
                        },
                        '& .MuiAlert-root': {
                            mb: 3,
                            borderRadius: '12px'
                        }
                    }}>
                        {children}
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}
