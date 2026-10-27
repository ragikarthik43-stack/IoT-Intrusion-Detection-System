import React, { useState, useEffect, useMemo } from 'react';
import { 
  HiMagnifyingGlass, 
  HiFunnel, 
  HiShieldExclamation, 
  HiArrowPath, 
  HiChevronLeft, 
  HiChevronRight,
  HiEye,
  HiXMark,
  HiCheckCircle,
  HiExclamationTriangle
} from 'react-icons/hi2';
import { useSocket } from '../hooks/useSocket';
import { useApi } from '../hooks/useApi';

const mockAlerts = [
  { id: 'ALT-1082', timestamp: '2026-10-14 14:52:10', srcIp: '192.168.1.105', dstIp: '192.168.1.1', protocol: 'TCP', port: 80, attackType: 'DDoS', severity: 'critical', model: 'LightGBM', confidence: 99.4, packetSize: 1460, details: 'SYN flood anomaly exceeding 25k pps threshold on gateway interface' },
  { id: 'ALT-1081', timestamp: '2026-10-14 14:50:44', srcIp: '192.168.1.189', dstIp: '192.168.1.42', protocol: 'UDP', port: 53, attackType: 'Scanning', severity: 'medium', model: 'XGBoost', confidence: 98.1, packetSize: 64, details: 'Stealth port scan detected targeting sequential UDP ports 50-100' },
  { id: 'ALT-1080', timestamp: '2026-10-14 14:49:12', srcIp: '10.0.0.84', dstIp: '192.168.1.10', protocol: 'HTTP', port: 8080, attackType: 'Injection', severity: 'high', model: 'LightGBM', confidence: 99.7, packetSize: 512, details: 'SQL command injection pattern identified in payload query string' },
  { id: 'ALT-1079', timestamp: '2026-10-14 14:48:30', srcIp: '192.168.1.202', dstIp: '192.168.1.5', protocol: 'MQTT', port: 1883, attackType: 'Password', severity: 'high', model: 'Random Forest', confidence: 97.6, packetSize: 128, details: 'Brute force authentication attempt on broker topic telemetry/auth' },
  { id: 'ALT-1078', timestamp: '2026-10-14 14:46:18', srcIp: '192.168.1.77', dstIp: '192.168.1.1', protocol: 'ICMP', port: 0, attackType: 'DoS', severity: 'critical', model: 'Decision Tree', confidence: 96.9, packetSize: 1024, details: 'Ping of death malformed fragment packets directed at central router' },
  { id: 'ALT-1077', timestamp: '2026-10-14 14:45:01', srcIp: '172.16.0.44', dstIp: '192.168.1.15', protocol: 'TCP', port: 4444, attackType: 'Backdoor', severity: 'critical', model: 'LightGBM', confidence: 99.8, packetSize: 256, details: 'Reverse shell handshake pattern matching Metasploit payload signature' },
  { id: 'ALT-1076', timestamp: '2026-10-14 14:42:15', srcIp: '192.168.1.99', dstIp: '192.168.1.20', protocol: 'ARP', port: 0, attackType: 'MITM', severity: 'medium', model: 'MLP', confidence: 94.2, packetSize: 42, details: 'Gratuitous ARP spoofing poisoning switch MAC translation cache' },
  { id: 'ALT-1075', timestamp: '2026-10-14 14:40:02', srcIp: '10.0.0.12', dstIp: '192.168.1.10', protocol: 'HTTP', port: 80, attackType: 'XSS', severity: 'medium', model: 'LightGBM', confidence: 98.9, packetSize: 840, details: 'Stored script injection attempt via sensor calibration form input' },
  { id: 'ALT-1074', timestamp: '2026-10-14 14:38:22', srcIp: '192.168.1.112', dstIp: '192.168.1.30', protocol: 'TCP', port: 445, attackType: 'Ransomware', severity: 'critical', model: 'XGBoost', confidence: 99.5, packetSize: 2048, details: 'High-frequency file system encryption entropy pattern on edge storage' },
  { id: 'ALT-1073', timestamp: '2026-10-14 14:35:49', srcIp: '192.168.1.50', dstIp: '192.168.1.80', protocol: 'UDP', port: 161, attackType: 'Scanning', severity: 'low', model: 'Decision Tree', confidence: 95.3, packetSize: 78, details: 'SNMP community string discovery probe across private subnet' },
  { id: 'ALT-1072', timestamp: '2026-10-14 14:33:14', srcIp: '192.168.1.15', dstIp: '192.168.1.2', protocol: 'TCP', port: 22, attackType: 'Password', severity: 'high', model: 'Random Forest', confidence: 98.4, packetSize: 98, details: 'SSH dictionary login iterations exceeding 15 failures per minute' },
  { id: 'ALT-1071', timestamp: '2026-10-14 14:31:05', srcIp: '192.168.1.88', dstIp: '192.168.1.1', protocol: 'TCP', port: 80, attackType: 'DDoS', severity: 'critical', model: 'LightGBM', confidence: 99.6, packetSize: 1200, details: 'HTTP flood originating from botnet node pool with randomized user agents' },
  { id: 'ALT-1070', timestamp: '2026-10-14 14:28:40', srcIp: '10.0.0.95', dstIp: '192.168.1.12', protocol: 'MQTT', port: 1883, attackType: 'Normal', severity: 'info', model: 'LightGBM', confidence: 99.9, packetSize: 154, details: 'Routine smart meter temperature and humidity telemetric payload' },
  { id: 'ALT-1069', timestamp: '2026-10-14 14:25:12', srcIp: '192.168.1.140', dstIp: '192.168.1.4', protocol: 'CoAP', port: 5683, attackType: 'Normal', severity: 'info', model: 'Logistic Regression', confidence: 99.1, packetSize: 84, details: 'Valid CoAP confirmable GET request for industrial valve position' }
];

export default function Alerts() {
  const { subscribe } = useSocket();
  const { data: apiAlerts, refetch } = useApi('/alerts?limit=50', { fallbackData: mockAlerts });
  const [alerts, setAlerts] = useState(mockAlerts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAttack, setSelectedAttack] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const itemsPerPage = 8;

  const normalizeAlert = (a) => ({
    id: a.id || a._id || `ALT-${Math.random().toString(36).slice(2, 7)}`,
    srcIp: a.srcIp || a.sourceIP || '192.168.1.1',
    dstIp: a.dstIp || a.destIP || '10.0.0.1',
    timestamp: a.timestamp ? (typeof a.timestamp === 'string' && a.timestamp.length > 8 ? new Date(a.timestamp).toLocaleString() : a.timestamp) : 'Just now',
    protocol: a.protocol || 'TCP',
    port: a.port || a.destPort || 80,
    attackType: a.attackType || 'Normal',
    severity: (a.severity || 'info').toLowerCase(),
    model: a.model || a.modelUsed || 'LightGBM',
    confidence: typeof a.confidence === 'number' ? (a.confidence > 1 ? a.confidence : Math.round(a.confidence * 100)) : 99,
    packetSize: a.packetSize || 512,
    details: a.details || `${a.attackType || 'Network'} traffic packet classified by ${a.model || a.modelUsed || 'LightGBM'}`,
    isNew: a.isNew || false
  });

  useEffect(() => {
    if (apiAlerts && Array.isArray(apiAlerts) && apiAlerts.length > 0) {
      setAlerts(apiAlerts.map(normalizeAlert));
    }
  }, [apiAlerts]);

  // Subscribe to real-time incoming alerts
  useEffect(() => {
    const unsub = subscribe('newAlert', (newAlert) => {
      if (!newAlert) return;
      const normalized = { ...normalizeAlert(newAlert), isNew: true };
      setAlerts((prev) => [normalized, ...prev]);
    });
    return () => unsub?.();
  }, [subscribe]);

  // Filtered dataset
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchSearch =
        searchTerm === '' ||
        alert.srcIp?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.dstIp?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.protocol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.attackType?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchAttack =
        selectedAttack === 'ALL' || alert.attackType?.toLowerCase() === selectedAttack.toLowerCase();

      const matchSeverity =
        selectedSeverity === 'ALL' || alert.severity?.toLowerCase() === selectedSeverity.toLowerCase();

      return matchSearch && matchAttack && matchSeverity;
    });
  }, [alerts, searchTerm, selectedAttack, selectedSeverity]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / itemsPerPage));
  const paginatedAlerts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAlerts.slice(start, start + itemsPerPage);
  }, [filteredAlerts, currentPage, itemsPerPage]);

  const getSeverityBadgeClass = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical': return 'badge-critical';
      case 'high': return 'badge-high';
      case 'medium': return 'badge-medium';
      case 'low': return 'badge-low';
      case 'normal':
      case 'info':
      default: return 'badge-info';
    }
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 98) return 'var(--accent-success)';
    if (conf >= 90) return 'var(--accent-secondary)';
    if (conf >= 80) return 'var(--accent-warning)';
    return 'var(--accent-danger)';
  };

  return (
    <>
      {/* Header */}
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">
            <HiShieldExclamation style={{ color: 'var(--accent-primary)' }} />
            Threat Event Management
          </h1>
          <p className="page-subtitle">
            Inspect, filter, and audit network attack anomalies classified across edge sensors
          </p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => refetch()}>
          <HiArrowPath /> Refresh Log
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card animate-in stagger-1" style={{ padding: '18px 24px' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <HiMagnifyingGlass style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input"
              placeholder="Search by IP, ID, Protocol, Model..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '100%', paddingLeft: 40 }}
            />
          </div>

          {/* Attack Type Select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HiFunnel style={{ color: 'var(--text-muted)' }} />
            <select
              className="select"
              value={selectedAttack}
              onChange={(e) => {
                setSelectedAttack(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Attack Types</option>
              <option value="Normal">Normal Traffic</option>
              <option value="DDoS">DDoS</option>
              <option value="DoS">DoS</option>
              <option value="Scanning">Scanning</option>
              <option value="Injection">Injection</option>
              <option value="Password">Password / Brute Force</option>
              <option value="Backdoor">Backdoor</option>
              <option value="MITM">MITM / Spoofing</option>
              <option value="Ransomware">Ransomware</option>
              <option value="XSS">XSS</option>
            </select>
          </div>

          {/* Severity Select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <select
              className="select"
              value={selectedSeverity}
              onChange={(e) => {
                setSelectedSeverity(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="info">Info / Normal</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedAttack !== 'ALL' || selectedSeverity !== 'ALL') && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSearchTerm('');
                setSelectedAttack('ALL');
                setSelectedSeverity('ALL');
                setCurrentPage(1);
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Alert Table Card */}
      <div className="card animate-in stagger-2" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Event ID & Time</th>
                <th>Source IP</th>
                <th>Dest IP</th>
                <th>Proto</th>
                <th>Classification</th>
                <th>Severity</th>
                <th>Model</th>
                <th style={{ width: '160px' }}>Confidence</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAlerts.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                    No alerts found matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedAlerts.map((alert) => (
                  <tr key={alert.id} className={alert.isNew ? 'animate-in' : ''}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.86rem' }}>
                        {alert.id}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {alert.timestamp}
                      </div>
                    </td>
                    <td>
                      <code style={{ color: 'var(--accent-secondary)', fontSize: '0.84rem' }}>
                        {alert.srcIp}
                      </code>
                    </td>
                    <td>
                      <code style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                        {alert.dstIp}
                      </code>
                    </td>
                    <td>
                      <span className="badge badge-info">{alert.protocol}</span>
                    </td>
                    <td>
                      <span className={`badge ${getSeverityBadgeClass(alert.severity)}`}>
                        {alert.attackType}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getSeverityBadgeClass(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {alert.model}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="progress-bar" style={{ flex: 1 }}>
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${alert.confidence}%`, 
                              backgroundColor: getConfidenceColor(alert.confidence) 
                            }} 
                          />
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, minWidth: '42px', color: getConfidenceColor(alert.confidence) }}>
                          {alert.confidence}%
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => setSelectedAlert(alert)}
                      >
                        <HiEye /> Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '16px 24px', 
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          <div>
            Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
            <strong>{Math.min(currentPage * itemsPerPage, filteredAlerts.length)}</strong> of{' '}
            <strong>{filteredAlerts.length}</strong> alerts
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{ opacity: currentPage <= 1 ? 0.4 : 1, cursor: currentPage <= 1 ? 'not-allowed' : 'pointer' }}
            >
              <HiChevronLeft /> Prev
            </button>
            <span style={{ padding: '0 8px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{ opacity: currentPage >= totalPages ? 0.4 : 1, cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next <HiChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedAlert && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(6, 11, 24, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="card animate-in" style={{ maxWidth: '640px', width: '100%', padding: '28px' }}>
            <div className="card-header" style={{ marginBottom: 20 }}>
              <div>
                <div className="card-title">
                  <HiShieldExclamation style={{ color: 'var(--accent-primary)' }} />
                  Threat Inspection: {selectedAlert.id}
                </div>
                <div className="card-subtitle">{selectedAlert.timestamp}</div>
              </div>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ padding: '6px' }}
                onClick={() => setSelectedAlert(null)}
              >
                <HiXMark style={{ fontSize: '1.2rem' }} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 20 }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Class & Severity</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <span className={`badge ${getSeverityBadgeClass(selectedAlert.severity)}`}>
                    {selectedAlert.attackType}
                  </span>
                  <span className={`badge ${getSeverityBadgeClass(selectedAlert.severity)}`}>
                    {selectedAlert.severity}
                  </span>
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Classifying Model</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>
                  {selectedAlert.model} ({selectedAlert.confidence}%)
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Source Node</div>
                <div style={{ fontSize: '0.92rem', fontFamily: 'monospace', color: 'var(--accent-secondary)', marginTop: 4 }}>
                  {selectedAlert.srcIp}:{selectedAlert.port || 'Any'}
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Destination Target</div>
                <div style={{ fontSize: '0.92rem', fontFamily: 'monospace', color: 'var(--text-primary)', marginTop: 4 }}>
                  {selectedAlert.dstIp} ({selectedAlert.protocol})
                </div>
              </div>
            </div>

            <div style={{ 
              background: 'rgba(15, 23, 42, 0.7)', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--radius-sm)', 
              padding: '16px',
              marginBottom: 24 
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Flow Diagnostic Analysis
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {selectedAlert.details || 'Network flow payload exhibited feature vector variance exceeding learned normal distributions for packet inter-arrival time and forward header lengths.'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setSelectedAlert(null)}
              >
                Close
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => {
                  alert(`Firewall rule generated for source ${selectedAlert.srcIp}`);
                  setSelectedAlert(null);
                }}
              >
                <HiCheckCircle /> Push Block Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
