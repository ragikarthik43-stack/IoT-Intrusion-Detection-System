import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ThemeToggle from './components/ThemeToggle';
import NotificationBell from './components/NotificationBell';
import NotificationCenter from './components/NotificationCenter';
import { useTheme } from './hooks/useTheme';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import Devices from './pages/Devices';
import Models from './pages/Models';
import Analytics from './pages/Analytics';

function MainApp() {
  const [activePage, setActivePage] = useState('dashboard');
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isLoading, user } = useAuth();

  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard':
        return 'Overview Dashboard';
      case 'alerts':
        return 'Live Threat Stream';
      case 'devices':
        return 'Edge Hardware Telemetry';
      case 'models':
        return 'ML Performance Matrix';
      case 'analytics':
        return 'Deep Threat Intelligence';
      default:
        return 'Overview Dashboard';
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'alerts':
        return <Alerts />;
      case 'devices':
        return <Devices />;
      case 'models':
        return <Models />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  // Loading state while verifying cached token
  if (isLoading) {
    return (
      <div className="app-loading-screen">
        <div className="login-spinner" style={{ width: 44, height: 44 }} />
        <div style={{ marginTop: 16, fontSize: '0.92rem', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
          Verifying Security Credentials...
        </div>
      </div>
    );
  }

  // Not logged in -> Render real-time Login page
  if (!isAuthenticated) {
    return (
      <>
        <NotificationCenter />
        <Login />
      </>
    );
  }

  // Authenticated App
  return (
    <div className="app-layout">
      {/* Toast Notification Container */}
      <NotificationCenter />

      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <div className="main-wrapper">
        <header className="top-header">
          <div className="top-header-left">
            <span className="top-header-breadcrumb">Intrusion Detection System /</span>
            <span className="top-header-title">{getPageTitle()}</span>
          </div>
          <div className="top-header-right">
            <div className="system-live-pill">
              <span className="status-dot status-dot-active" />
              <span>Real-Time Engine Active</span>
            </div>

            {/* Notification Bell Dropdown */}
            <NotificationBell />

            {/* Dark/Light Theme Toggle */}
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </header>

        <main className="main-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
