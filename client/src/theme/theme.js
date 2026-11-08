import { createTheme } from '@mui/material/styles';
import createCache from '@emotion/cache';

// Emotion Cache configured with prepend: true
// This guarantees Tailwind CSS utility classes have priority over MUI component defaults
export const muiCache = createCache({
  key: 'mui',
  prepend: true,
});

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#0F2444',      // Deep Navy
      dark: '#0A192F',
      light: '#1B3B6F',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#C5A059',      // Champagne Gold
      dark: '#D4AF37',
      light: '#F4E8C1',
      contrastText: '#0F2444',
    },
    background: {
      default: '#FAF9F6',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#172033',
      secondary: '#64748B',
    },
    success: {
      main: '#16A34A',
    },
    warning: {
      main: '#D97706',
    },
    error: {
      main: '#DC2626',
    },
    info: {
      main: '#2563EB',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 700,
      color: '#0F2444',
    },
    h2: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 600,
      color: '#0F2444',
    },
    h3: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 600,
      color: '#0F2444',
    },
    h4: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 600,
      color: '#0F2444',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontFamily: "'Inter', sans-serif",
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 20px',
          transition: 'all 0.2s ease-in-out',
        },
        containedPrimary: {
          backgroundColor: '#0F2444',
          '&:hover': {
            backgroundColor: '#1B3B6F',
          },
        },
        containedSecondary: {
          backgroundColor: '#C5A059',
          color: '#0F2444',
          '&:hover': {
            backgroundColor: '#D4AF37',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '& fieldset': {
              borderColor: '#CBD5E1',
            },
            '&:hover fieldset': {
              borderColor: '#0F2444',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0F2444',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(15, 36, 68, 0.06)',
          border: '1px solid #E2E8F0',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 20px 40px -4px rgba(15, 36, 68, 0.16)',
        },
      },
    },
  },
});

