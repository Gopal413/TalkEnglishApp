import React from 'react';
import { Box, Paper, Typography, IconButton } from '@mui/material';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

export default function AuthLayout({ children, title, subtitle, showBackButton = false, onBackClick }) {
    const navigate = useNavigate();

    return (
        <Box 
            sx={{ 
                minHeight: '100vh', 
                width: '100%',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                py: { xs: 4, sm: 6 },
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

            {/* Centered Glassmorphic Form Card */}
            <Paper 
                elevation={0}
                sx={{ 
                    width: '100%',
                    maxWidth: 460,
                    borderRadius: '24px', 
                    bgcolor: 'rgba(30, 41, 59, 0.55)', // Dark translucent background
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    p: { xs: 3, sm: 5 },
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                    position: 'relative',
                    zIndex: 1,
                    color: '#fff',
                    transition: 'all 0.3s ease-in-out'
                }}
            >
                {/* Branding & Logo */}
                <Box 
                    sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        mb: 4,
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
                            display: 'flex', 
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
                            mb: 0.5 
                        }}
                    >
                        TalkEnglish
                    </Typography>
                    {title && (
                        <Typography 
                            variant="h6" 
                            fontWeight="800" 
                            sx={{ color: '#fff', mt: 1, textAlign: 'center' }}
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

                {/* Form Elements Inject */}
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
            </Paper>
        </Box>
    );
}
