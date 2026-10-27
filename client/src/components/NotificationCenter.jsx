import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  HiShieldExclamation, 
  HiFire, 
  HiBolt, 
  HiXMark, 
  HiExclamationTriangle,
  HiBellAlert,
  HiCpuChip
} from 'react-icons/hi2';
import { useSocket } from '../hooks/useSocket';

// Synthesize an alert sound using Web Audio API without needing external audio files
function playNotificationSound(severity) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (severity === 'critical') {
      // Two-tone warning beep
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(587.33, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } else {
      // Gentle notification chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    // Audio autoplay restrictions gracefully ignored
  }
}

// Global notification storage for sharing with the Bell dropdown
export const notificationHistory = [];
const listeners = new Set();

export function addNotificationToHistory(notification) {
  notificationHistory.unshift(notification);
  if (notificationHistory.length > 50) {
    notificationHistory.pop();
  }
  listeners.forEach(fn => fn([...notificationHistory]));
}

export function subscribeToNotificationHistory(callback) {
  listeners.add(callback);
  callback([...notificationHistory]);
  return () => listeners.delete(callback);
}

export function clearNotificationHistory() {
  notificationHistory.length = 0;
  listeners.forEach(fn => fn([]));
}

export default function NotificationCenter() {
  const { subscribe } = useSocket();
  const [activeToasts, setActiveToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleIncomingNotification = useCallback((notif) => {
    if (!notif) return;
    const enriched = {
      id: notif.id || `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: notif.type || 'HIGH_TRAFFIC',
      severity: notif.severity || 'warning',
      title: notif.title || 'Security Notification',
      message: notif.message || 'System telemetry update',
      data: notif.data || {},
      timestamp: notif.timestamp || new Date().toISOString(),
      duration: 8000 // 8 seconds
    };

    // Add to history store
    addNotificationToHistory(enriched);

    // Play subtle audio cue
    playNotificationSound(enriched.severity);

    // Add to active toast stack (max 4 visible at once)
    setActiveToasts(prev => [enriched, ...prev.slice(0, 3)]);
  }, []);

  // Listen for socket events
  useEffect(() => {
    const unsub = subscribe('serverNotification', handleIncomingNotification);

    // Also support custom window event for in-browser dispatch
    const handleCustom = (e) => handleIncomingNotification(e.detail);
    window.addEventListener('ids_notification', handleCustom);

    return () => {
      unsub?.();
      window.removeEventListener('ids_notification', handleCustom);
    };
  }, [subscribe, handleIncomingNotification]);

  return (
    <div className="toast-container" aria-live="polite">
      {activeToasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, toast.duration || 8000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'HIGH_TRAFFIC':
        return <HiBolt className="toast-icon-svg" />;
      case 'ATTACK_SURGE':
        return <HiFire className="toast-icon-svg" />;
      case 'SERVER_OVERLOAD':
        return <HiCpuChip className="toast-icon-svg" />;
      default:
        return <HiShieldExclamation className="toast-icon-svg" />;
    }
  };

  const getSeverityClass = () => {
    switch (toast.severity) {
      case 'critical':
        return 'toast-critical';
      case 'warning':
        return 'toast-warning';
      default:
        return 'toast-info';
    }
  };

  return (
    <div className={`toast-card ${getSeverityClass()} animate-slide-in`}>
      <div className="toast-glow" />
      <div className="toast-content">
        <div className="toast-header">
          <div className="toast-title-row">
            <span className="toast-icon-wrapper">
              {getIcon()}
            </span>
            <div className="toast-titles">
              <span className="toast-tag">{toast.type.replace('_', ' ')}</span>
              <h4 className="toast-title">{toast.title}</h4>
            </div>
          </div>
          <button 
            type="button" 
            className="toast-close-btn" 
            onClick={onDismiss}
            aria-label="Dismiss notification"
          >
            <HiXMark />
          </button>
        </div>

        <p className="toast-message">{toast.message}</p>

        {toast.data && Object.keys(toast.data).length > 0 && (
          <div className="toast-metrics">
            {toast.data.requestsPerSecond && (
              <span className="toast-metric-pill">
                Rate: <strong>{toast.data.requestsPerSecond} req/s</strong>
              </span>
            )}
            {toast.data.attackCount && (
              <span className="toast-metric-pill critical">
                Surge: <strong>{toast.data.attackCount} attacks / 15s</strong>
              </span>
            )}
            {toast.data.eventLoopLagMs && (
              <span className="toast-metric-pill warning">
                Lag: <strong>{toast.data.eventLoopLagMs}ms</strong>
              </span>
            )}
          </div>
        )}

        <div className="toast-timestamp">
          {new Date(toast.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {/* Auto-dismiss progress bar */}
      <div className="toast-progress-bar">
        <div 
          className="toast-progress-fill" 
          style={{ animationDuration: `${toast.duration || 8000}ms` }} 
        />
      </div>
    </div>
  );
}
