import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

const Settings = ({ theme, toggleTheme }) => {
  return (
    <div className="page-container">
      <h1>Settings</h1>
      
      <div className="settings-section">
        <h3>Appearance</h3>
        <div className="theme-toggle-container">
          <p>Switch between light and dark mode.</p>
          <button onClick={toggleTheme} className="theme-toggle-button" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? <FiMoon /> : <FiSun />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;