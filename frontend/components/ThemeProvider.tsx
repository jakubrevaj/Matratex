'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Načítať uložený theme z localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    // Aplikovať theme na body a html
    const theme = isDarkMode ? 'dark' : 'light';
    document.body.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [isDarkMode]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // Prevent hydration mismatch by using default theme until mounted
  const effectiveDarkMode = mounted && isDarkMode;

  const theme = createTheme({
    palette: {
      mode: effectiveDarkMode ? 'dark' : 'light',
      primary: {
        main: effectiveDarkMode ? '#90caf9' : '#1976d2',
        dark: effectiveDarkMode ? '#42a5f5' : '#1565c0',
      },
      secondary: {
        main: effectiveDarkMode ? '#ce93d8' : '#9c27b0',
      },
      background: {
        default: effectiveDarkMode ? '#121212' : '#f5f5f5',
        paper: effectiveDarkMode ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: effectiveDarkMode ? '#ffffff' : '#333333',
        secondary: effectiveDarkMode ? '#b0b0b0' : '#666666',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: effectiveDarkMode ? '#121212' : '#f5f5f5',
            color: effectiveDarkMode ? '#ffffff' : '#333333',
            transition: 'background-color 0.3s ease, color 0.3s ease',
          },
          html: {
            backgroundColor: effectiveDarkMode ? '#121212' : '#f5f5f5',
            transition: 'background-color 0.3s ease',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: effectiveDarkMode ? '#1e1e1e' : '#ffffff',
            color: effectiveDarkMode ? '#ffffff' : '#333333',
            transition: 'background-color 0.3s ease, color 0.3s ease',
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            backgroundColor: effectiveDarkMode ? '#1e1e1e' : '#ffffff',
            transition: 'background-color 0.3s ease',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: effectiveDarkMode ? '#2a2a2a' : '#f8f9fa',
            transition: 'background-color 0.3s ease',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            backgroundColor: effectiveDarkMode ? '#1e1e1e' : '#ffffff',
            '&:hover': {
              backgroundColor: effectiveDarkMode ? '#2a2a2a' : '#f8f9fa',
            },
            transition: 'background-color 0.3s ease',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: effectiveDarkMode
              ? '1px solid #333'
              : '1px solid #e0e0e0',
            color: effectiveDarkMode ? '#ffffff' : '#333333',
            transition: 'border-color 0.3s ease, color 0.3s ease',
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: effectiveDarkMode ? '#ffffff' : '#333333',
            transition: 'color 0.3s ease',
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
