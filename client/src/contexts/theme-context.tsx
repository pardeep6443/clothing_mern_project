import { createContext, useContext } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

interface ThemeContextType {
  theme: string | undefined;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const { theme, setTheme } = useNextTheme();
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return {
    theme,
    setTheme,
    toggleTheme,
  };
}