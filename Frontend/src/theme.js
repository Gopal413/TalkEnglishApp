import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4A9B9B', // Teal
      light: '#E8F4F4',
      dark: '#357070',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#E07B6A', // Coral
      light: '#FDF0EE',
      dark: '#b35d4f',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F7F9FC',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a2e',
      secondary: '#64748B',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    body1: { fontWeight: 400 },
    body2: { fontWeight: 400 },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24, // Pill-shape buttons as a standard premium feel
          padding: '8px 22px',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(74, 155, 155, 0.2)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #4A9B9B 0%, #357070 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #357070 0%, #295757 100%)',
            boxShadow: '0px 4px 15px rgba(74, 155, 155, 0.3)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #E07B6A 0%, #b35d4f 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #b35d4f 0%, #914539 100%)',
            boxShadow: '0px 4px 15px rgba(224, 123, 106, 0.3)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
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
            borderRadius: 12,
            transition: 'all 0.2s ease-in-out',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#4A9B9B',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#4A9B9B',
              borderWidth: '2px',
            },
          },
        },
      },
    },
  },
});

export default theme;
