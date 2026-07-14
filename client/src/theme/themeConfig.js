import { createTheme } from '@mui/material/styles';

// Palette definitions for our 5 custom themes
export const themePalettes = {
  Serenity: {
    mode: 'light',
    primary: { main: '#2563eb', light: '#3b82f6', dark: '#1d4ed8' }, // Calm blue
    secondary: { main: '#475569', light: '#64748b', dark: '#334155' },
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#475569' },
    divider: 'rgba(0, 0, 0, 0.08)',
    chartColors: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#1e40af'],
  },
  'Midnight Focus': {
    mode: 'dark',
    primary: { main: '#60a5fa', light: '#93c5fd', dark: '#2563eb' }, // Sleek dark navy
    secondary: { main: '#38bdf8', light: '#7dd3fc', dark: '#0284c7' },
    background: { default: '#0f172a', paper: '#1e293b' },
    text: { primary: '#f8fafc', secondary: '#94a3b8' },
    divider: 'rgba(255, 255, 255, 0.08)',
    chartColors: ['#60a5fa', '#38bdf8', '#0ea5e9', '#0284c7', '#1e293b'],
  },
  Nature: {
    mode: 'light',
    primary: { main: '#059669', light: '#10b981', dark: '#047857' }, // Relaxing green
    secondary: { main: '#0d9488', light: '#14b8a6', dark: '#0f766e' },
    background: { default: '#f0fdf4', paper: '#ffffff' },
    text: { primary: '#064e3b', secondary: '#0f766e' },
    divider: 'rgba(0, 0, 0, 0.06)',
    chartColors: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#047857'],
  },
  Classic: {
    mode: 'light',
    primary: { main: '#b45309', light: '#d97706', dark: '#78350f' }, // Cream, brown, gold
    secondary: { main: '#854d0e', light: '#ca8a04', dark: '#713f12' },
    background: { default: '#fafaf9', paper: '#f5f5f4' },
    text: { primary: '#1c1917', secondary: '#57534e' },
    divider: 'rgba(0, 0, 0, 0.08)',
    chartColors: ['#b45309', '#d97706', '#ca8a04', '#eab308', '#78350f'],
  },
  Vivekananda: {
    mode: 'light',
    primary: { main: '#f97316', light: '#fb923c', dark: '#ea580c' }, // Saffron orange
    secondary: { main: '#1e3a8a', light: '#3b82f6', dark: '#172554' }, // Deep Blue
    background: { default: '#fffbeb', paper: '#ffffff' }, // Warm White
    text: { primary: '#1c1917', secondary: '#431407' },
    divider: 'rgba(251, 146, 60, 0.15)',
    chartColors: ['#f97316', '#1e3a8a', '#eab308', '#fb923c', '#3b82f6'],
  }
};

// Generate customized MUI theme based on the key
export const getMuiTheme = (themeName) => {
  const palette = themePalettes[themeName] || themePalettes.Serenity;
  
  return createTheme({
    palette: {
      mode: palette.mode,
      primary: palette.primary,
      secondary: palette.secondary,
      background: palette.background,
      text: palette.text,
      divider: palette.divider,
    },
    typography: {
      fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontFamily: '"Playfair Display", "Outfit", serif',
        fontWeight: 700,
      },
      h2: {
        fontFamily: '"Playfair Display", "Outfit", serif',
        fontWeight: 700,
      },
      h3: {
        fontFamily: '"Playfair Display", "Outfit", serif',
        fontWeight: 600,
      },
      h4: {
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 600,
      },
      h5: {
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 500,
      },
      h6: {
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 500,
      },
      body1: {
        fontWeight: 400,
        fontSize: '1rem',
      },
      body2: {
        fontWeight: 400,
        fontSize: '0.875rem',
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      }
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: palette.mode === 'dark' 
              ? '0 8px 32px 0 rgba(0, 0, 0, 0.25)' 
              : '0 8px 32px 0 rgba(31, 38, 135, 0.04)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '18px',
            border: palette.mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.07)'
              : '1px solid rgba(255, 255, 255, 0.25)',
            backgroundColor: palette.mode === 'dark'
              ? 'rgba(30, 41, 59, 0.65)'
              : 'rgba(255, 255, 255, 0.45)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            padding: '8px 20px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            }
          },
          contained: {
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }
          }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: '20px',
            backgroundImage: 'none',
            backgroundColor: palette.mode === 'dark'
              ? '#1e293b'
              : '#ffffff',
          }
        }
      }
    }
  });
};
