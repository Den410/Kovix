import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('themeMode') || 'light');
  
  const [customColors, setCustomColors] = useState(() => {
    const saved = localStorage.getItem('customColors');
    return saved ? JSON.parse(saved) : {
      bgMain: '#201a30',
      bgCard: '#2a223e',
      textMain: '#00ffcc',
      primary: '#ff00aa'
    };
  });

  useEffect(() => {
  const root = document.documentElement;

  root.removeAttribute('data-theme');
  root.removeAttribute('data-bs-theme');
  root.style = '';

  localStorage.setItem('themeMode', themeMode);

  if (themeMode === 'dark') {
    root.setAttribute('data-theme', 'dark');
    root.setAttribute('data-bs-theme', 'dark');

  } else if (themeMode === 'light') {
    root.setAttribute('data-theme', 'light');
    root.setAttribute('data-bs-theme', 'light');

  } else if (themeMode === 'custom') {
    root.setAttribute('data-theme', 'custom');
    root.setAttribute('data-bs-theme', 'light'); 

    root.style.setProperty('--bg-main', customColors.bgMain);
    root.style.setProperty('--bg-card', customColors.bgCard);
    root.style.setProperty('--bg-secondary', customColors.bgCard);
    root.style.setProperty('--bg-hover', customColors.bgCard);
    root.style.setProperty('--text-main', customColors.textMain);
    root.style.setProperty('--primary-color', customColors.primary);
    root.style.setProperty('--border-color', customColors.primary);

    root.style.setProperty('--bs-body-bg', customColors.bgMain);
    root.style.setProperty('--bs-body-color', customColors.textMain);
  }
}, [themeMode, customColors]);


  const updateCustomColor = (key, value) => {
    const newColors = { ...customColors, [key]: value };
    setCustomColors(newColors);
    localStorage.setItem('customColors', JSON.stringify(newColors));
  };

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, customColors, updateCustomColor }}>
      {children}
    </ThemeContext.Provider>
  );
}