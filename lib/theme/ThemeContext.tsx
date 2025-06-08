'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { syncCookies } from '@/lib/cookies/actions';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
});

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme: Theme;
}

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function ThemeProvider({ children, defaultTheme }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const isDark = theme === 'dark';

  useEffect(() => {
    const savedTheme = Cookies.get('drafter_theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const systemTheme = getSystemTheme();
      setTheme(systemTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    Cookies.set('drafter_theme', theme);
    // Sync cookies with server
    syncCookies(Cookies.get());
  }, [theme, isDark]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      <div
        style={{
          backgroundColor: 'var(--background)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'background-color 0.3s',
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
