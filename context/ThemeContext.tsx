import React, { createContext, useContext, useState, useMemo } from 'react';
import { theme as lightTheme } from '@/constants/theme';

// Define a dark theme
const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: lightTheme.colors.gray[900],
    text: {
      primary: lightTheme.colors.white,
      secondary: lightTheme.colors.gray[400],
      tertiary: lightTheme.colors.gray[500],
      disabled: lightTheme.colors.gray[600],
      inverse: lightTheme.colors.black,
    },
    // Adjust other colors for dark mode as needed
  },
};

type ThemeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
  theme: typeof lightTheme;
};

const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
  theme: lightTheme,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
