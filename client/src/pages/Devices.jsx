import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { 
  HiCpuChip, 
  HiBolt, 
  HiFire, 
  HiCircleStack, 
  HiCubeTransparent,
  HiArrowTrendingUp,
  HiSignal
} from 'react-icons/hi2';
import { useSocket } from '../hooks/useSocket';
import { useApi } from '../hooks/useApi';

ChartJS.register(...registerables);

function CircularGauge({ value, max = 100, label, color, suffix = '%' }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(value, 0), max);
  const offset = circumference - (clamped / max) * circumference;

  return (
    <div className="gauge">
      <div className="gauge-svg-wrap">
        <svg width="88" height="88" viewBox="0 0 88 88">
          <circle 
            cx="44" 
            cy="44" 
            r={radius} 
            fill="none" 
            stroke="rgba(148,163,184,0.12)" 
            strokeWidth="6" 
          />
          <circle 
            cx="44" 
            cy="44" 
            r={radius} 
            fill="none" 
            stroke={color} 
            strokeWidth="6"
            strokeDasharray={circumference} 
            strokeDashoffset={offset}
            strokeLinecap="round" 
            transform="rotate(-90 44 44)"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }} 
          />
        </svg>
        <div className="gauge-center-content">
          <div className="gauge-value">{Math.round(value)}{suffix}</div>
        </div>
      </div>
      <div className="gauge-label">{label}</div>
    </div>
  );
}

const initialDevicesData = {
  arduino: {
    name: 'Arduino Mega 2560 R3',
    arch: 'Atmel ATmega2560 • AVR 8-bit RISC @ 16 MHz',
    online: true,
    cpu: 76,
    memory: 82,
    flashPct: 72,
    sramPct: 85,
    flashText: '184.2 KB / 256 KB',
    sramText: '6.8 KB / 8.0 KB',
    avgInference: '28.4 ms',
    temp: 42.5,
    packetsSec: 148,
    totalPackets: '1,429,840',
    voltage: '5.01 V',
    clockRate: '16 MHz'
  },
  esp32: {
    name: 'Espressif ESP32-C3 Mini',
    arch: 'Espressif ESP32-C3 • RISC-V 32-bit Single-Core @ 160 MHz',
    online: true,
    cpu: 26,
    memory: 32,
    flashPct: 16,
    sramPct: 22,
    flashText: '640.0 KB / 4.0 MB',
    sramText: '88.0 KB / 400 KB',
    avgInference: '4.2 ms',
    temp: 36.8,
    packetsSec: 980,
    totalPackets: '9,842,100',
    voltage: '3.30 V',
    clockRate: '160 MHz'
  }
};

export default function Devices() {
  const { subscribe } = useSocket();
  const { data: apiDevices } = useApi('/devices', { fallbackData: initialDevicesData });
  const [devices, setDevices] = useState(initialDevicesData);

  useEffect(() => {
    if (apiDevices) {
      if (Array.isArray(apiDevices)) {
        const mega = apiDevices.find((d) => d.deviceId?.includes('mega')) || {};
        const esp = apiDevices.find((d) => d.deviceId?.includes('esp')) || {};
        setDevices((prev) => ({
          arduino: {
            ...prev.arduino,
            cpu: Math.round(mega.cpuUsage ?? prev.arduino.cpu),
            memory: Math.round(mega.memoryUsage ?? prev.arduino.memory),
            flashPct: Math.round(mega.flashUsage ?? prev.arduino.flashPct),
            sramPct: Math.round(mega.sramUsage ?? prev.arduino.sramPct),
            temp: mega.temperature ?? prev.arduino.temp,
            packetsSec: mega.packetsProcessed ? Math.round(mega.packetsProcessed / 25) : prev.arduino.packetsSec
          },
          esp32: {
            ...prev.esp32,
            cpu: Math.round(esp.cpuUsage ?? prev.esp32.cpu),
            memory: Math.round(esp.memoryUsage ?? prev.esp32.memory),
            flashPct: Math.round(esp.flashUsage ?? prev.esp32.flashPct),
            sramPct: Math.round(esp.sramUsage ?? prev.esp32.sramPct),
            temp: esp.temperature ?? prev.esp32.temp,
            packetsSec: esp.packetsProcessed ? Math.round(esp.packetsProcessed / 10) : prev.esp32.packetsSec
          }
        }));
      } else if (typeof apiDevices === 'object') {
        setDevices((prev) => ({ ...prev, ...apiDevices }));
      }
    }
  }, [apiDevices]);

  // Subscribe to live device metrics
  useEffect(() => {
    const unsub = subscribe('deviceMetrics', (metrics) => {
      if (Array.isArray(metrics)) {
        const mega = metrics.find((d) => d.deviceId?.includes('mega'));
        const esp = metrics.find((d) => d.deviceId?.includes('esp'));
        setDevices((prev) => ({
          arduino: mega ? {
            ...prev.arduino,
            cpu: Math.round(mega.cpuUsage ?? prev.arduino.cpu),
            memory: Math.round(mega.memoryUsage ?? prev.arduino.memory),
            flashPct: Math.round(mega.flashUsage ?? prev.arduino.flashPct),
            sramPct: Math.round(mega.sramUsage ?? prev.arduino.sramPct),
            temp: mega.temperature ?? prev.arduino.temp
          } : prev.arduino,
          esp32: esp ? {
            ...prev.esp32,
            cpu: Math.round(esp.cpuUsage ?? prev.esp32.cpu),
            memory: Math.round(esp.memoryUsage ?? prev.esp32.memory),
            flashPct: Math.round(esp.flashUsage ?? prev.esp32.flashPct),
            sramPct: Math.round(esp.sramUsage ?? prev.esp32.sramPct),
            temp: esp.temperature ?? prev.esp32.temp
          } : prev.esp32
        }));
      }
    });
    return () => unsub?.();
  }, [subscribe]);

  // Inference Time Comparison Bar Chart Data (Horizontal Bar)
  const models = ['Logistic Reg', 'Decision Tree', 'Random Forest', 'XGBoost', 'LightGBM', 'MLP'];
  const arduinoTimes = [14.2, 18.5, 42.6, 38.4, 32.1, 56.8]; // in milliseconds
  const esp32Times = [2.1, 2.8, 6.2, 5.4, 4.2, 7.3];       // in milliseconds

  const comparisonChartData = {
    labels: models,
    datasets: [
      {
        label: 'Arduino Mega (AVR 8-bit @ 16 MHz)',
        data: arduinoTimes,
        backgroundColor: 'rgba(239, 68, 68, 0.75)',
        borderColor: '#ef4444',
        borderWidth: 1.5,
        borderRadius: 6
      },
      {
        label: 'ESP32-C3 (RISC-V 32-bit @ 160 MHz) — 5.8× to 7.8× Speedup',
        data: esp32Times,
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: '#22d3ee',
        borderWidth: 1.5,
        borderRadius: 6
      }
    ]
  };

  const comparisonChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#cbd5e1',
          font: { size: 12, family: "'Inter', sans-serif" },
          padding: 16,
          boxWidth: 14,
          boxHeight: 14
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.raw} ms`
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Inference Latency (Milliseconds — Lower is Faster)',
          color: '#94a3b8',
          font: { size: 12 }
        },
        grid: { color: 'rgba(148, 163, 184, 0.08)' },
        ticks: { color: '#64748b' }
      },
      y: {
        grid: { display: false },
        ticks: { color: '#f1f5f9', font: { weight: '500' } }
      }
    }
  };

  return (
    <>
      {/* Header */}
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">
            <HiCpuChip style={{ color: 'var(--accent-secondary)' }} />
            Embedded Hardware Testbed
          </h1>
          <p className="page-subtitle">
            Microcontroller performance analysis & resource constraints on AVR ATmega vs RISC-V edge platforms
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <span className="badge badge-normal">2 Edge Nodes Active</span>
          <span className="badge badge-low">FreeRTOS / Bare-Metal</span>
        </div>
      </div>

      {/* Two Large Device Cards Side-by-Side */}
      <div className="grid-2">
        {/* Device 1: Arduino Mega 2560 */}
        <div className="card animate-in stagger-1" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card-header" style={{ marginBottom: 0 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="page-title" style={{ fontSize: '1.25rem' }}>
                  {devices.arduino.name}
                </span>
                <span className="badge badge-warning">Constrained</span>
              </div>
              <div className="card-subtitle" style={{ marginTop: 4 }}>
                {devices.arduino.arch}
              </div>
            </div>
            <div className="status-indicator">
              <span className="status-dot status-dot-active" />
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-success)' }}>Active</span>
            </div>
          </div>

          {/* 4 Circular Gauges */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: 12, 
            padding: '16px 0',
            borderTop: '1px solid var(--border-color)',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <CircularGauge value={devices.arduino.cpu} label="CPU Load" color="var(--accent-warning)" />
            <CircularGauge value={devices.arduino.memory} label="SRAM Load" color="var(--accent-danger)" />
            <CircularGauge value={devices.arduino.flashPct} label="Flash Used" color="var(--accent-purple)" />
            <CircularGauge value={devices.arduino.sramPct} label="Stack/Heap" color="var(--accent-danger)" />
          </div>

          {/* Hardware Specs & Telemetry List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.45)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Avg Inference Latency</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-warning)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <HiBolt /> {devices.arduino.avgInference}
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.45)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Core Temperature</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <HiFire /> {devices.arduino.temp}°C
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.45)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Flash Memory</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>
                {devices.arduino.flashText}
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.45)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>SRAM Constraint</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>
                {devices.arduino.sramText}
              </div>
            </div>
          </div>

          {/* Total packets counter */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '12px 16px', 
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.15)',
            borderRadius: 'var(--radius-sm)'
          }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>Packets Evaluated</span>
            <span style={{ fontSize: '0.96rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
              {devices.arduino.totalPackets} ({devices.arduino.packetsSec} pkts/s)
            </span>
          </div>
        </div>

        {/* Device 2: ESP32-C3 Mini */}
        <div className="card animate-in stagger-2" style={{ display: 'flex', flexDirection: 'column', gap: 20, borderColor: 'rgba(34, 211, 238, 0.3)' }}>
          <div className="card-header" style={{ marginBottom: 0 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="page-title" style={{ fontSize: '1.25rem' }}>
                  {devices.esp32.name}
                </span>
                <span className="badge badge-normal">Recommended</span>
              </div>
              <div className="card-subtitle" style={{ marginTop: 4, color: 'var(--accent-secondary)' }}>
                {devices.esp32.arch}
              </div>
            </div>
            <div className="status-indicator">
              <span className="status-dot status-dot-active" />
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-success)' }}>High Throughput</span>
            </div>
          </div>

          {/* 4 Circular Gauges */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: 12, 
            padding: '16px 0',
            borderTop: '1px solid var(--border-color)',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <CircularGauge value={devices.esp32.cpu} label="CPU Load" color="var(--accent-secondary)" />
            <CircularGauge value={devices.esp32.memory} label="SRAM Load" color="var(--accent-success)" />
            <CircularGauge value={devices.esp32.flashPct} label="Flash Used" color="var(--accent-purple)" />
            <CircularGauge value={devices.esp32.sramPct} label="Heap Used" color="var(--accent-secondary)" />
          </div>

          {/* Hardware Specs & Telemetry List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.45)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Avg Inference Latency</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <HiBolt /> {devices.esp32.avgInference}
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.45)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Core Temperature</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <HiFire /> {devices.esp32.temp}°C
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.45)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Flash Memory</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>
                {devices.esp32.flashText}
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.45)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>SRAM Headroom</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent-secondary)', marginTop: 4 }}>
                {devices.esp32.sramText}
              </div>
            </div>
          </div>

          {/* Total packets counter */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '12px 16px', 
            background: 'rgba(34, 211, 238, 0.08)',
            border: '1px solid rgba(34, 211, 238, 0.2)',
            borderRadius: 'var(--radius-sm)'
          }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>Packets Evaluated</span>
            <span style={{ fontSize: '0.96rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent-secondary)' }}>
              {devices.esp32.totalPackets} ({devices.esp32.packetsSec} pkts/s)
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Inference Time Comparison Bar Chart */}
      <div className="card animate-in stagger-3">
        <div className="card-header">
          <div>
            <div className="card-title">
              <HiArrowTrendingUp style={{ color: 'var(--accent-secondary)' }} />
              MCU Inference Latency Benchmark Across Models
            </div>
            <div className="card-subtitle">
              Comparative testbed analysis demonstrating 5.8× – 7.8× speedup on RISC-V 32-bit architecture over AVR 8-bit
            </div>
          </div>
          <span className="badge badge-normal">Paper Key Result</span>
        </div>

        <div className="chart-container-tall">
          <Bar data={comparisonChartData} options={comparisonChartOptions} />
        </div>
      </div>
    </>
  );
}
