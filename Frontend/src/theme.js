import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563EB', // Blue
      light: '#EFF6FF',
      dark: '#1D4ED8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#14B8A6', // Teal
      light: '#F0FDFA',
      dark: '#0F766E',
      contrastText: '#ffffff',
    },
    success: {
      main: '#22C55E',
      light: '#F0FDF4',
      dark: '#15803D',
    },
    warning: {
      main: '#F59E0B',
      light: '#FEF3C7',
      dark: '#B45309',
    },
    error: {
      main: '#EF4444',
      light: '#FEF2F2',
      dark: '#B91C1C',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      disabled: '#94A3B8',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
    h1: { fontWeight: 900, color: '#0F172A' },
    h2: { fontWeight: 900, color: '#0F172A' },
    h3: { fontWeight: 900, color: '#0F172A' },
    h4: { fontWeight: 900, color: '#0F172A' },
    h5: { fontWeight: 700, color: '#0F172A' },
    h6: { fontWeight: 700, color: '#0F172A' },
    subtitle1: { fontWeight: 700, color: '#0F172A' },
    subtitle2: { fontWeight: 700, color: '#475569' },
    body1: { fontWeight: 500, color: '#475569' },
    body2: { fontWeight: 500, color: '#475569' },
    caption: { fontWeight: 400, color: '#94A3B8' },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 24, // Cards Default
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16, // Buttons Radius 16px
          padding: '10px 24px',
          boxShadow: 'none',
          fontSize: '14px',
          fontWeight: 700,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: 'none',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #1D4ED8 0%, #172554 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #14B8A6 0%, #0F766E 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #0F766E 0%, #115E59 100%)',
          },
        },
        outlinedPrimary: {
          border: '1.5px solid #2563EB',
          '&:hover': {
            border: '1.5px solid #1D4ED8',
            backgroundColor: '#EFF6FF',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.03), 0px 8px 24px rgba(15, 23, 42, 0.04)',
          border: '1px solid #E2E8F0',
          borderRadius: 24, // Card Radius 24px
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 16, // Input Radius 16px
            transition: 'all 0.2s ease-in-out',
            backgroundColor: '#FFFFFF',
            '& fieldset': {
              borderColor: '#E2E8F0',
              borderWidth: '1.5px',
            },
            '&:hover fieldset': {
              borderColor: '#CBD5E1',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2563EB',
              borderWidth: '2.5px',
            },
          },
        },
      },
    },
  },
});

export default theme;
