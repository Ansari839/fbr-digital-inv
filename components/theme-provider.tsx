"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeColor = 'default' | 'blue' | 'purple' | 'slate' | 'rose';

interface ThemeContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeColor: 'default',
  setThemeColor: () => {},
});

const themeStyles = {
  default: {
    sidebar: 'oklch(0.205 0 0)',
    primary: 'oklch(0.205 0 0)',
  },
  blue: {
    sidebar: 'oklch(0.35 0.15 250)',
    primary: 'oklch(0.45 0.15 250)',
  },
  purple: {
    sidebar: 'oklch(0.3 0.15 300)',
    primary: 'oklch(0.4 0.15 300)',
  },
  slate: {
    sidebar: 'oklch(0.2 0.02 240)',
    primary: 'oklch(0.3 0.02 240)',
  },
  rose: {
    sidebar: 'oklch(0.3 0.15 10)',
    primary: 'oklch(0.4 0.15 10)',
  }
};

export function ThemeProvider({ children, initialTheme = 'default' }: { children: React.ReactNode, initialTheme?: ThemeColor }) {
  const [themeColor, setThemeColorState] = useState<ThemeColor>(initialTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
    localStorage.setItem('app-theme-color', color);
  };

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor }}>
      {mounted && (
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --sidebar: ${themeStyles[themeColor].sidebar} !important;
              --primary: ${themeStyles[themeColor].primary} !important;
            }
          `
        }} />
      )}
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
