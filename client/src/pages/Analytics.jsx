import React, { useState } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { 
  HiArrowTrendingUp, 
  HiFire, 
  HiShieldCheck, 
  HiExclamationCircle,
  HiGlobeAlt,
  HiSparkles
} from 'react-icons/hi2';

ChartJS.register(...registerables);

// Confusion matrix from research paper for LightGBM
const matrixClasses = ['Normal', 'DDoS', 'DoS', 'Scanning', 'Other'];
const confusionMatrix = [
  [9850, 12, 3, 0, 5],    // Normal
  [8, 2480, 5, 2, 1],     // DDoS
  [3, 7, 1950, 4, 2],     // DoS  
  [2, 1, 3, 985, 1],      // Scanning
  [5, 3, 2, 1, 1470]      // Other
];

export default function Analytics() {
  const [hoveredCell, setHoveredCell] = useState(null);

  // 1. Attack Trend Over Time (Stacked Area Chart)
  const timeLabels = ['00h', '04h', '08h', '12h', '16h', '20h', 'Now'];
  const attackTrendData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'DDoS',
        data: [420, 280, 540, 920, 810, 1150, 980],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.35)',
        fill: true,
        tension: 0.35
      },
      {
        label: 'DoS',
        data: [310, 190, 420, 680, 590, 780, 690],
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.3)',
        fill: true,
        tension: 0.35
      },
      {
        label: 'Scanning',
        data: [150, 110, 290, 410, 380, 450, 390],
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.25)',
        fill: true,
        tension: 0.35
      },
      {
        label: 'Injection/XSS',
        data: [80, 65, 140, 210, 195, 260, 220],
        borderColor: '#eab308',
        backgroundColor: 'rgba(234, 179, 8, 0.2)',
        fill: true,
        tension: 0.35
      }
    ]
  };

  const attackTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#cbd5e1', padding: 12, usePointStyle: true, boxWidth: 8 }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        stacked: true,
        grid: { color: 'rgba(148, 163, 184, 0.08)' },
        ticks: { color: '#64748b' }
      },
      x: {
        grid: { color: 'rgba(148, 163, 184, 0.04)' },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  // 2. Severity Distribution (Horizontal Bar Chart)
  const severityData = {
    labels: ['Critical', 'High', 'Medium', 'Low', 'Info / Normal'],
    datasets: [
      {
        label: 'Incidents Count',
        data: [4620, 2840, 1950, 1280, 8420],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(34, 211, 238, 0.8)',
          'rgba(16, 185, 129, 0.8)'
        ],
        borderColor: ['#ef4444', '#f97316', '#f59e0b', '#22d3ee', '#10b981'],
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  const severityOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(148, 163, 184, 0.08)' },
        ticks: { color: '#64748b' }
      },
      y: {
        grid: { display: false },
        ticks: { color: '#f1f5f9' }
      }
    }
  };

  // 3. Top Source IPs Bar Chart
  const topIpsData = {
    labels: ['192.168.1.105', '192.168.1.189', '10.0.0.84', '172.16.0.44', '192.168.1.77', '192.168.1.202'],
    datasets: [
      {
        label: 'Threat Packets Sent',
        data: [2840, 1950, 1420, 1120, 980, 840],
        backgroundColor: 'rgba(99, 102, 241, 0.75)',
        borderColor: '#6366f1',
        borderWidth: 1.5,
        borderRadius: 6
      }
    ]
  };

  const topIpsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.08)' },
        ticks: { color: '#64748b' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 10.5 } }
      }
    }
  };

  // 4. Model Confidence Distribution
  const confidenceDistData = {
    labels: ['80-85%', '85-90%', '90-95%', '95-98%', '98-100%'],
    datasets: [
      {
        label: 'Inference Samples',
        data: [120, 340, 890, 2450, 9420],
        backgroundColor: 'rgba(34, 211, 238, 0.75)',
        borderColor: '#22d3ee',
        borderWidth: 1.5,
        borderRadius: 6
      }
    ]
  };

  const confidenceDistOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.08)' },
        ticks: { color: '#64748b' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  return (
    <>
      {/* Header */}
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">
            <HiArrowTrendingUp style={{ color: 'var(--accent-secondary)' }} />
            Telemetry & Confusion Matrix Analytics
          </h1>
          <p className="page-subtitle">
            Deep diagnostic analysis, error classification heatmaps, and cross-dataset generalisation gaps
          </p>
        </div>
        <span className="badge badge-normal">Diagnostic Mode</span>
      </div>

      {/* Row 1: Attack Trend & Severity */}
      <div className="grid-2">
        {/* LEFT: Stacked Area Attack Trend */}
        <div className="card animate-in stagger-1">
          <div className="card-header">
            <div>
              <div className="card-title">Attack Class Volume Trend (24h)</div>
              <div className="card-subtitle">Temporal progression of multi-class intrusion attempts</div>
            </div>
          </div>
          <div className="chart-container">
            <Line data={attackTrendData} options={attackTrendOptions} />
          </div>
        </div>

        {/* RIGHT: Severity Distribution */}
        <div className="card animate-in stagger-2">
          <div className="card-header">
            <div>
              <div className="card-title">Threat Severity Profiling</div>
              <div className="card-subtitle">Aggregate triage distribution across all sensor zones</div>
            </div>
          </div>
          <div className="chart-container">
            <Bar data={severityData} options={severityOptions} />
          </div>
        </div>
      </div>

      {/* Row 2: Top IPs & Confidence Distribution */}
      <div className="grid-2">
        {/* LEFT: Top Source IPs */}
        <div className="card animate-in stagger-2">
          <div className="card-header">
            <div>
              <div className="card-title">Top Hostile Origin IP Addresses</div>
              <div className="card-subtitle">Identified repeat anomaly sources on private subnet</div>
            </div>
          </div>
          <div className="chart-container">
            <Bar data={topIpsData} options={topIpsOptions} />
          </div>
        </div>

        {/* RIGHT: Confidence Distribution */}
        <div className="card animate-in stagger-3">
          <div className="card-header">
            <div>
              <div className="card-title">Classifier Confidence Distribution</div>
              <div className="card-subtitle">Density of softmax output probabilities across classifications</div>
            </div>
          </div>
          <div className="chart-container">
            <Bar data={confidenceDistData} options={confidenceDistOptions} />
          </div>
        </div>
      </div>

      {/* Row 3: Confusion Matrix Heatmap */}
      <div className="card animate-in stagger-3">
        <div className="card-header">
          <div>
            <div className="card-title">
              <HiSparkles style={{ color: 'var(--accent-primary)' }} />
              LightGBM Multi-Class Confusion Matrix (TON_IoT Test Partition)
            </div>
            <div className="card-subtitle">
              Diagonal cells reflect true positive predictions; off-diagonal cells represent misclassifications
            </div>
          </div>
          <span className="badge badge-low">99.93% F1 Micro-Avg</span>
        </div>

        {/* Heatmap Grid */}
        <div style={{ overflowX: 'auto', padding: '16px 0' }}>
          <div style={{ 
            display: 'inline-grid', 
            gridTemplateColumns: '120px repeat(5, 110px)', 
            gap: '6px',
            margin: '0 auto',
            minWidth: '670px'
          }}>
            {/* Header row */}
            <div style={{ textAlign: 'right', paddingRight: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Actual \ Pred
            </div>
            {matrixClasses.map((cls) => (
              <div 
                key={`col-${cls}`} 
                style={{ 
                  textAlign: 'center', 
                  fontSize: '0.8rem', 
                  fontWeight: 600, 
                  color: 'var(--text-secondary)',
                  paddingBottom: '8px'
                }}
              >
                {cls}
              </div>
            ))}

            {/* Matrix rows */}
            {confusionMatrix.map((row, rowIdx) => (
              <React.Fragment key={`row-${matrixClasses[rowIdx]}`}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'flex-end', 
                  paddingRight: '12px',
                  fontSize: '0.82rem', 
                  fontWeight: 600, 
                  color: 'var(--text-secondary)' 
                }}>
                  {matrixClasses[rowIdx]}
                </div>

                {row.map((val, colIdx) => {
                  const isDiagonal = rowIdx === colIdx;
                  // Color calculation based on intensity
                  let bg;
                  let textColor = '#f1f5f9';
                  if (isDiagonal) {
                    const intensity = Math.min(1, Math.max(0.3, val / 10000));
                    bg = `rgba(16, 185, 129, ${intensity * 0.85})`;
                  } else if (val > 0) {
                    bg = 'rgba(239, 68, 68, 0.35)';
                    textColor = '#fca5a5';
                  } else {
                    bg = 'rgba(15, 23, 42, 0.4)';
                    textColor = 'var(--text-muted)';
                  }

                  return (
                    <div
                      key={`cell-${rowIdx}-${colIdx}`}
                      onMouseEnter={() => setHoveredCell({ row: matrixClasses[rowIdx], col: matrixClasses[colIdx], val, isDiagonal })}
                      onMouseLeave={() => setHoveredCell(null)}
                      style={{
                        backgroundColor: bg,
                        border: isDiagonal ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(99, 102, 241, 0.1)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '14px 6px',
                        textAlign: 'center',
                        fontSize: '0.9rem',
                        fontWeight: isDiagonal ? 700 : 500,
                        color: textColor,
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        transform: hoveredCell?.row === matrixClasses[rowIdx] && hoveredCell?.col === matrixClasses[colIdx] ? 'scale(1.06)' : 'none',
                        boxShadow: isDiagonal ? '0 0 12px rgba(16, 185, 129, 0.15)' : 'none'
                      }}
                    >
                      {val.toLocaleString()}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Dynamic Tooltip / Legend */}
        <div style={{ 
          marginTop: 16, 
          padding: '12px 18px', 
          background: 'rgba(15, 23, 42, 0.5)', 
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.84rem'
        }}>
          <div>
            {hoveredCell ? (
              <span>
                Actual: <strong style={{ color: 'var(--accent-secondary)' }}>{hoveredCell.row}</strong> → 
                Predicted: <strong style={{ color: 'var(--accent-secondary)' }}>{hoveredCell.col}</strong> : 
                <strong style={{ color: hoveredCell.isDiagonal ? 'var(--accent-success)' : 'var(--accent-danger)', marginLeft: 6 }}>
                  {hoveredCell.val.toLocaleString()} instances ({hoveredCell.isDiagonal ? 'True Positive' : 'Misclassification'})
                </strong>
              </span>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>
                Hover over any matrix cell to inspect classification fidelity details
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(16, 185, 129, 0.7)' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Correct</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(239, 68, 68, 0.5)' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Misclassified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Cross-Domain Generalisation Gap Cards */}
      <div className="card animate-in stagger-4">
        <div className="card-header">
          <div>
            <div className="card-title">
              <HiGlobeAlt style={{ color: 'var(--accent-secondary)' }} />
              Cross-Domain Dataset Generalisation Gap
            </div>
            <div className="card-subtitle">
              Evaluating model transferability from TON_IoT training domain to unseen CIC-IoT test distributions
            </div>
          </div>
          <span className="badge badge-warning">Generalisation Penalty: Δ -7.83%</span>
        </div>

        <div className="grid-2" style={{ gap: 20 }}>
          {/* TON_IoT Card */}
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.08)', 
            border: '1px solid rgba(16, 185, 129, 0.25)', 
            borderRadius: 'var(--radius-md)', 
            padding: '20px' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-normal">In-Domain Baseline</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 8 }}>
                  TON_IoT Benchmark
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Heterogeneous IoT telemetry (MQTT, Modbus, HTTP, TCP)
                </div>
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--accent-success)' }}>
                99.93%
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 18, borderTop: '1px solid rgba(16, 185, 129, 0.15)', paddingTop: 14 }}>
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Precision</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>99.92%</div>
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Recall</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>99.95%</div>
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>False Alarm</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-success)' }}>0.08%</div>
              </div>
            </div>
          </div>

          {/* CIC-IoT Card */}
          <div style={{ 
            background: 'rgba(245, 158, 11, 0.08)', 
            border: '1px solid rgba(245, 158, 11, 0.25)', 
            borderRadius: 'var(--radius-md)', 
            padding: '20px' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-warning">Zero-Shot Transfer</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 8 }}>
                  CIC-IoT Generalisation
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Unseen test distribution with domain shift & novel topologies
                </div>
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--accent-warning)' }}>
                92.10%
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 18, borderTop: '1px solid rgba(245, 158, 11, 0.15)', paddingTop: 14 }}>
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Precision</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>91.80%</div>
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Recall</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>92.40%</div>
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Generalisation Gap</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-danger)' }}>-7.83%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
