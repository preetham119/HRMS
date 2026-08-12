import { createTheme } from '@mui/material/styles';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: { main: '#1565C0', light: '#42A5F5', dark: '#0D47A1', contrastText: '#fff' },
          secondary: { main: '#0277BD', light: '#4FC3F7', dark: '#01579B' },
          background: { default: '#F5F8FC', paper: '#FFFFFF' },
          success: { main: '#2E7D32' },
          warning: { main: '#ED6C02' },
          error: { main: '#D32F2F' },
          info: { main: '#0288D1' },
          divider: 'rgba(21, 101, 192, 0.12)',
          text: { primary: '#1A2332', secondary: '#5A6A7A' },
        }
      : {
          primary: { main: '#42A5F5', light: '#90CAF9', dark: '#1565C0', contrastText: '#0A1929' },
          secondary: { main: '#4FC3F7', light: '#81D4FA', dark: '#0288D1' },
          background: { default: '#0A1929', paper: '#132F4C' },
          success: { main: '#66BB6A' },
          warning: { main: '#FFA726' },
          error: { main: '#EF5350' },
          info: { main: '#29B6F6' },
          divider: 'rgba(66, 165, 245, 0.16)',
          text: { primary: '#E3F2FD', secondary: '#B0BEC5' },
        }),
  },
  typography: {
    fontFamily: '"Source Sans 3", "DM Sans", sans-serif',
    h1: { fontFamily: '"DM Sans", sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"DM Sans", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"DM Sans", sans-serif', fontWeight: 600 },
    h4: { fontFamily: '"DM Sans", sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"DM Sans", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"DM Sans", sans-serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: mode === 'light' ? '1px solid rgba(21,101,192,0.10)' : '1px solid rgba(66,165,245,0.12)',
          boxShadow: mode === 'light' ? '0 2px 10px rgba(21,101,192,0.04)' : '0 2px 12px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        outlined: {
          borderRadius: 20,
          borderColor: mode === 'light' ? 'rgba(21,101,192,0.10)' : 'rgba(66,165,245,0.12)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16 },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          backgroundImage:
            mode === 'light'
              ? 'linear-gradient(180deg, #0D47A1 0%, #1565C0 55%, #0277BD 100%)'
              : 'linear-gradient(180deg, #061525 0%, #0A1929 50%, #132F4C 100%)',
          color: '#fff',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 700,
            backgroundColor: mode === 'light' ? '#E8F1FB' : '#1A3A5C',
          },
        },
      },
    },
  },
});

export const createAppTheme = (mode) => createTheme(getDesignTokens(mode));
