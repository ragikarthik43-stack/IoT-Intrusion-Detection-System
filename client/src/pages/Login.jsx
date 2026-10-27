import React, { useState } from 'react';
import { 
  HiShieldCheck, 
  HiLockClosed, 
  HiUser, 
  HiEye, 
  HiEyeSlash, 
  HiArrowRightOnRectangle,
  HiIdentification,
  HiCheckCircle,
  HiExclamationCircle,
  HiBolt,
  HiCpuChip
} from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register, error: authError } = useAuth();
  
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!username.trim() || !password.trim()) {
      setLocalError('Please fill in all required credentials.');
      return;
    }

    if (isRegister && password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    let result;
    if (isRegister) {
      result = await register(username, password, name);
    } else {
      result = await login(username, password);
    }
    setIsSubmitting(false);

    if (!result.success) {
      setLocalError(result.error || 'Authentication failed. Please check your credentials.');
    }
  };

  const fillDemoCredentials = (u, p) => {
    setIsRegister(false);
    setUsername(u);
    setPassword(p);
    setLocalError('');
  };

  const displayedError = localError || authError;

  return (
    <div className="login-container">
      {/* Dynamic Background Effects */}
      <div className="login-ambient-glow glow-1" />
      <div className="login-ambient-glow glow-2" />
      <div className="login-grid-overlay" />

      {/* Main Login Card */}
      <div className="login-card animate-in">
        {/* Brand Header */}
        <div className="login-brand">
          <div className="login-logo-icon">
            <HiShieldCheck />
          </div>
          <h1 className="login-title">IDS Security Gateway</h1>
          <p className="login-subtitle">
            IoT & IIoT Intrusion Detection System • Edge AI Telemetry
          </p>
          <div className="login-status-pill">
            <span className="status-dot status-dot-active" />
            <span>AI Inference Engine v2.4 Active</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab ${!isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(false); setLocalError(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`login-tab ${isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(true); setLocalError(''); }}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {displayedError && (
          <div className="login-error-box animate-in">
            <HiExclamationCircle className="login-error-icon" />
            <span>{displayedError}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <div className="login-field animate-in">
              <label className="login-label">Full Name</label>
              <div className="login-input-wrap">
                <HiIdentification className="login-input-icon" />
                <input
                  type="text"
                  className="login-input"
                  placeholder="e.g. Alex Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div className="login-field">
            <label className="login-label">Username</label>
            <div className="login-input-wrap">
              <HiUser className="login-input-icon" />
              <input
                type="text"
                className="login-input"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label">Password</label>
            <div className="login-input-wrap">
              <HiLockClosed className="login-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                required
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <HiEyeSlash /> : <HiEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="login-spinner" />
            ) : (
              <>
                <HiArrowRightOnRectangle className="login-btn-icon" />
                <span>{isRegister ? 'Create Security Profile' : 'Authenticate & Enter'}</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Access Prefill */}
        <div className="login-demo-section">
          <div className="login-demo-header">
            <span>QUICK PRE-CONFIGURED ACCESS</span>
          </div>
          <div className="login-demo-buttons">
            <button
              type="button"
              className="login-demo-chip admin"
              onClick={() => fillDemoCredentials('admin', 'admin123')}
            >
              <HiBolt />
              <span>Admin: <strong>admin</strong> / <strong>admin123</strong></span>
            </button>
            <button
              type="button"
              className="login-demo-chip analyst"
              onClick={() => fillDemoCredentials('analyst', 'analyst123')}
            >
              <HiCpuChip />
              <span>Analyst: <strong>analyst</strong> / <strong>analyst123</strong></span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="login-footer">
          <span>Protected by AES-256 PBKDF2 & Real-time Anomaly Inspection</span>
        </div>
      </div>
    </div>
  );
}
