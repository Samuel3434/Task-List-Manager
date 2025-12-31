import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import TaskManager from './components/TaskManager';
import { useState, useMemo } from 'react';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('task-manager-theme');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          primary: {
            main: '#2196f3',
            light: '#64b5f6',
            dark: '#1976d2',
          },
          background: {
            default: isDarkMode ? '#121212' : '#f5f5f5',
            paper: isDarkMode ? '#1e1e1e' : '#ffffff',
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h3: {
            fontWeight: 700,
          },
        },
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                boxShadow: isDarkMode 
                  ? '0 2px 12px 0 rgba(0,0,0,0.3)'
                  : '0 2px 12px 0 rgba(0,0,0,0.1)',
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
              },
            },
          },
        },
      }),
    [isDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TaskManager isDarkMode={isDarkMode} onThemeChange={setIsDarkMode} />
    </ThemeProvider>
  );
}

export default App;
