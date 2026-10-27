import React, { useState, useEffect, useRef } from 'react';
import { 
  HiBell, 
  HiBellAlert, 
  HiFire, 
  HiBolt, 
  HiCpuChip, 
  HiShieldCheck, 
  HiTrash,
  HiPlay,
  HiXMark
} from 'react-icons/hi2';
import { 
  subscribeToNotificationHistory, 
  clearNotificationHistory 
} from './NotificationCenter';
import { API_URL } from '../hooks/useApi';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const unsub = subscribeToNotificationHistory((list) => {
      setNotifications(list);
    });
    return unsub;
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const triggerSimulation = async (type) => {
    setIsSimulating(true);
    try {
      await fetch(`${API_URL}/traffic/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
    } catch (err) {
      // In standalone/offline mode, dispatch custom event locally
      window.dispatchEvent(new CustomEvent('ids_notification', {
        detail: {
          id: `NOTIF-${Date.now()}`,
          type,
          severity: type === 'HIGH_TRAFFIC' ? 'warning' : 'critical',
          title: type === 'HIGH_TRAFFIC' 
            ? 'High Traffic Burst (Offline Sim)' 
            : type === 'ATTACK_SURGE' 
            ? 'Intrusion Surge Alert (Offline Sim)' 
            : 'Backend Latency Congestion (Offline Sim)',
          message: `Simulated event triggered for testing: ${type}. Network telemetry monitoring nominal response.`,
          data: {
            requestsPerSecond: type === 'HIGH_TRAFFIC' ? 52.4 : 14.2,
            attackCount: type === 'ATTACK_SURGE' ? 14 : 2,
            eventLoopLagMs: type === 'SERVER_OVERLOAD' ? 490 : 15
          },
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setIsSimulating(false);
    }
  };

  const unreadCount = notifications.length;

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button 
        type="button" 
        className={`notification-bell-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Security notifications"
      >
        {unreadCount > 0 ? (
          <HiBellAlert className="bell-icon active" />
        ) : (
          <HiBell className="bell-icon" />
        )}
        {unreadCount > 0 && (
          <span className="bell-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown animate-in">
          {/* Header */}
          <div className="notif-dropdown-header">
            <div className="notif-header-title">
              <HiBellAlert style={{ color: 'var(--accent-secondary)' }} />
              <span>Real-Time Security Feed</span>
              {unreadCount > 0 && (
                <span className="notif-count-pill">{unreadCount} active</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button 
                type="button" 
                className="notif-clear-btn" 
                onClick={clearNotificationHistory}
                title="Clear all alerts"
              >
                <HiTrash />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Quick Simulation Bar (Allows testing real-time notifications on click) */}
          <div className="notif-simulation-box">
            <div className="notif-sim-title">
              <HiPlay style={{ color: 'var(--accent-primary)' }} />
              <span>Simulate Real-Time Telemetry:</span>
            </div>
            <div className="notif-sim-actions">
              <button 
                type="button" 
                className="sim-chip sim-traffic"
                onClick={() => triggerSimulation('HIGH_TRAFFIC')}
                disabled={isSimulating}
              >
                <HiBolt /> High Traffic
              </button>
              <button 
                type="button" 
                className="sim-chip sim-attack"
                onClick={() => triggerSimulation('ATTACK_SURGE')}
                disabled={isSimulating}
              >
                <HiFire /> Attack Surge
              </button>
              <button 
                type="button" 
                className="sim-chip sim-overload"
                onClick={() => triggerSimulation('SERVER_OVERLOAD')}
                disabled={isSimulating}
              >
                <HiCpuChip /> Server Busy
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty-state">
                <HiShieldCheck className="notif-empty-icon" />
                <div className="notif-empty-text">No active threat notifications</div>
                <div className="notif-empty-sub">
                  Inbound traffic is normal & edge inference engine is running smoothly.
                </div>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`notif-item notif-severity-${n.severity || 'warning'}`}
                >
                  <div className="notif-item-top">
                    <span className="notif-type-tag">
                      {n.type === 'HIGH_TRAFFIC' && <HiBolt />}
                      {n.type === 'ATTACK_SURGE' && <HiFire />}
                      {n.type === 'SERVER_OVERLOAD' && <HiCpuChip />}
                      <span>{n.type?.replace('_', ' ')}</span>
                    </span>
                    <span className="notif-item-time">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <div className="notif-item-title">{n.title}</div>
                  <div className="notif-item-msg">{n.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
