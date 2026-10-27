import React from 'react';
import { HiSun, HiMoon } from 'react-icons/hi2';

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className={`theme-toggle-track ${isDark ? 'dark' : 'light'}`}>
        <div className="theme-toggle-thumb">
          {isDark ? (
            <HiMoon className="toggle-icon moon" />
          ) : (
            <HiSun className="toggle-icon sun" />
          )}
        </div>
        <span className="theme-toggle-label">
          {isDark ? 'Dark' : 'Light'}
        </span>
      </div>
    </button>
  );
}
