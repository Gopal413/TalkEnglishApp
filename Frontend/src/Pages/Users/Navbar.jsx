import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    Box, Paper, Typography, AppBar, Toolbar, Button, 
    Avatar, IconButton
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useAuth } from '../../context/AuthContext';

const TEAL = '#4A9B9B';

const navItems = [
    { label: 'Home', path: '/dashboard', icon: HomeIcon },
    { label: 'Lessons', path: '/lessons', icon: MenuBookIcon },
    { label: 'Chat', path: '/conversation', icon: ChatIcon },
    { label: 'Progress', path: '/progress', icon: BarChartIcon },
    { label: 'Settings', path: '/settings', icon: SettingsIcon },
];

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();

    const hiddenPaths = ['/login', '/register', '/forgot-password', '/onboarding', '/verify-otp', '/verify-reset-otp', '/reset-password'];
    
    // Hide navbar completely on auth screens
    if (hiddenPaths.some(p => location.pathname.startsWith(p))) {
        return null;
    }

    const handleScrollTo = (id) => {
        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                const element = document.getElementById(id);
                element?.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        } else {
            const element = document.getElementById(id);
            element?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            {/* ── Top AppBar (Frosted Glass Style) ── */}
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(12px)',
                    color: 'text.primary',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    zIndex: 1200
                }}
            >
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', maxWidth: 'lg', width: '100%', mx: 'auto', px: { xs: 2, sm: 3 } }}>
                    {/* Brand Logo */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}>
                        {/* <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <RecordVoiceOverIcon sx={{ color: '#fff', fontSize: 18 }} />
                        </Box> */}
                         {/* Logged in User Avatar shortcut (Visible on both desktop & mobile) */}
                            <IconButton onClick={() => navigate('/settings')} sx={{ p: 0.5 }}>
                                <Avatar 
                                    sx={{ 
                                        width: 36, 
                                        height: 36, 
                                        bgcolor: 'primary.main', 
                                        fontWeight: 'bold', 
                                        fontSize: '14px',
                                        color: '#fff',
                                        border: '2px solid #E8F4F4'
                                    }}
                                >
                                    {(user?.name || 'U')[0].toUpperCase()}
                                </Avatar>
                            </IconButton>
                        <Typography variant="h6" fontWeight="800" sx={{ color: '#1a1a2e', letterSpacing: '-0.5px', fontSize: { xs: '18px', sm: '20px' } }}>
                            TalkEnglish
                        </Typography>
                    </Box>

                    {/* Navigation Actions */}
                    {isAuthenticated ? (
                        /* LOGGED IN STATE */
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {/* Desktop only navigation tabs */}
                            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, mr: 2 }}>
                                {navItems.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    const Icon = item.icon;
                                    return (
                                        <Button
                                            key={item.label}
                                            startIcon={<Icon sx={{ fontSize: 16 }} />}
                                            onClick={() => navigate(item.path)}
                                            sx={{
                                                textTransform: 'none',
                                                fontWeight: isActive ? '700' : '500',
                                                color: isActive ? TEAL : '#666',
                                                bgcolor: isActive ? '#E8F4F4' : 'transparent',
                                                borderRadius: 2,
                                                px: 2, py: 0.8,
                                                fontSize: '14px',
                                                '&:hover': { bgcolor: 'rgba(74, 155, 155, 0.08)' }
                                            }}
                                        >
                                            {item.label}
                                        </Button>
                                    );
                                })}
                            </Box>
                           
                        </Box>
                    ) : (
                        /* LOGGED OUT STATE */
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 3 } }}>
                            {/* Public marketing links (desktop only) */}
                            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                                <Button 
                                    onClick={() => handleScrollTo('demo-section')} 
                                    sx={{ color: '#555', fontWeight: '500', fontSize: '14px' }}
                                >
                                    Method
                                </Button>
                                <Button 
                                    onClick={() => handleScrollTo('demo-section')} 
                                    sx={{ color: '#555', fontWeight: '500', fontSize: '14px' }}
                                >
                                    Features
                                </Button>
                            </Box>
                            
                            {/* Login and Register links (Visible directly on both mobile and desktop) */}
                            <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 }, alignItems: 'center' }}>
                                <Button 
                                    variant="text" 
                                    onClick={() => navigate('/login')}
                                    sx={{ 
                                        color: '#1a1a2e', 
                                        fontWeight: '600', 
                                        fontSize: { xs: '13px', sm: '14px' },
                                        minWidth: 0,
                                        px: 1
                                    }}
                                >
                                    Login
                                </Button>
                                <Button 
                                    variant="contained" 
                                    onClick={() => navigate('/register')}
                                    sx={{ 
                                        py: { xs: 0.6, sm: 0.8 }, 
                                        px: { xs: 1.5, sm: 2.5 },
                                        fontSize: { xs: '13px', sm: '14px' },
                                        borderRadius: '24px'
                                    }}
                                >
                                    Register
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            {/* ── Logged-In Mobile Bottom Navigation ── */}
            {isAuthenticated && (
                <Paper
                    elevation={0}
                    sx={{
                        position: 'fixed',
                        bottom: 0, left: 0, right: 0,
                        zIndex: 1100,
                        display: { xs: 'block', md: 'none' },
                        bgcolor: '#fff',
                        borderTop: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: '20px 20px 0 0',
                        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)'
                    }}
                >
                    <Box sx={{ display: 'flex', height: 68, px: 1 }}>
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            const Icon = item.icon;
                            return (
                                <Box
                                    key={item.label}
                                    onClick={() => navigate(item.path)}
                                    sx={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 0.4,
                                        cursor: 'pointer',
                                        borderRadius: 2,
                                        py: 0.5,
                                        transition: 'all 0.15s ease',
                                        '&:active': { transform: 'scale(0.92)' }
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 28,
                                            borderRadius: 3,
                                            bgcolor: isActive ? '#E8F4F4' : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <Icon sx={{ fontSize: 20, color: isActive ? TEAL : '#9CA3AF' }} />
                                    </Box>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            fontSize: '10px',
                                            fontWeight: isActive ? '700' : '500',
                                            color: isActive ? TEAL : '#9CA3AF',
                                            lineHeight: 1
                                        }}
                                    >
                                        {item.label}
                                    </Typography>
                                </Box>
                              );
                        })}
                    </Box>
                </Paper>
            )}
        </>
    );
}

export default Navbar;