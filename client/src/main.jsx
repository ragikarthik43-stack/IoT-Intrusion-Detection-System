import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Chart as ChartJS, registerables } from 'chart.js';

// Globally register all Chart.js controllers, elements, scales, and plugins
ChartJS.register(...registerables);

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Dashboard ErrorBoundary caught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          color: '#f87171',
          background: '#0a0e1a',
          minHeight: '100vh',
          fontFamily: 'monospace',
          boxSizing: 'border-box'
        }}>
          <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>Dashboard Component Error</h2>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: '20px' }}>
            <strong>{this.state.error?.toString()}</strong>
          </div>
          <details open style={{ color: '#94a3b8', fontSize: '13px' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '8px', color: '#6366f1' }}>Component Stack Trace</summary>
            <pre style={{ whiteSpace: 'pre-wrap', background: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderRadius: '8px' }}>
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Reload Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
} else {
  console.error('Fatal: #root element not found in DOM.');
}
