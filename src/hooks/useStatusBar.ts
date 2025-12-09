import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const useStatusBar = () => {
  const { theme } = useTheme();

  useEffect(() => {
    StatusBar.setBarStyle(theme.isDark ? 'light-content' : 'dark-content');
    // For Android, set background color to match the header
    if (theme.isDark) {
      StatusBar.setBackgroundColor(theme.cardBackground);
    } else {
      StatusBar.setBackgroundColor(theme.cardBackground);
    }
  }, [theme]);
};