import { useState, useEffect } from 'react';
import { Chart as ChartJS } from 'chart.js';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ids-dashboard-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('ids-dashboard-theme', theme);

    // Dynamically adjust Chart.js defaults to match current theme
    if (theme === 'light') {
      ChartJS.defaults.color = '#475569';
      ChartJS.defaults.borderColor = 'rgba(148, 163, 184, 0.2)';
    } else {
      ChartJS.defaults.color = '#94a3b8';
      ChartJS.defaults.borderColor = 'rgba(148, 163, 184, 0.1)';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { theme, toggleTheme, isDark: theme === 'dark' };
}

export default useTheme;
