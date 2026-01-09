
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';
type AccentColor = 'indigo' | 'rose' | 'emerald' | 'amber' | 'sky' | 'slate';

const ACCENT_MAP: Record<AccentColor, string> = {
  indigo: '#6366f1',
  rose: '#f43f5e',
  emerald: '#10b981',
  amber: '#f59e0b',
  sky: '#0ea5e9',
  slate: '#475569'
};

const HEX_TO_RGB: Record<AccentColor, string> = {
  indigo: '99, 102, 241',
  rose: '244, 63, 94',
  emerald: '16, 185, 129',
  amber: '245, 158, 11',
  sky: '14, 165, 233',
  slate: '71, 85, 105'
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  accent: AccentColor;
  setAccent: (color: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [accent, setAccent] = useState<AccentColor>('indigo');

  useEffect(() => {
    // Carregar Tema
    const savedTheme = localStorage.getItem('app_theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }

    // Carregar Cor de Destaque
    const savedAccent = localStorage.getItem('app_accent') as AccentColor;
    if (savedAccent && ACCENT_MAP[savedAccent]) {
      applyAccent(savedAccent);
    } else {
      applyAccent('indigo');
    }
  }, []);

  const applyAccent = (newAccent: AccentColor) => {
    setAccent(newAccent);
    localStorage.setItem('app_accent', newAccent);
    document.documentElement.style.setProperty('--color-accent', ACCENT_MAP[newAccent]);
    document.documentElement.style.setProperty('--accent-rgb', HEX_TO_RGB[newAccent]);
  };

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('app_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    handleSetTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, toggleTheme, accent, setAccent: applyAccent }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
