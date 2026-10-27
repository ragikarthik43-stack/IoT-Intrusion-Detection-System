import React from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { 
  HiChartBar, 
  HiSparkles, 
  HiCpuChip, 
  HiCheckBadge,
  HiArrowDownRight,
  HiScale
} from 'react-icons/hi2';
import { useApi } from '../hooks/useApi';

ChartJS.register(...registerables);

const modelBenchmarks = [
  {
    id: 'lr',
    name: 'Logistic Regression',
    short: 'LR',
    accuracy: 96.42,
    precision: 96.10,
    recall: 96.50,
    f1: 96.30,
    flashFloat32: 12.4,
    flashInt8: 3.2,
    sram: 1.8,
    espLatency: 2.1,
    megaLatency: 14.2,
    bestIn: 'Lightest Weight'
  },
  {
    id: 'dt',
    name: 'Decision Tree',
    short: 'DT',
    accuracy: 98.85,
    precision: 98.70,
    recall: 98.90,
    f1: 98.80,
    flashFloat32: 18.6,
    flashInt8: 4.8,
    sram: 2.4,
    espLatency: 2.8,
    megaLatency: 18.5,
    bestIn: 'Fastest Tree'
  },
  {
    id: 'rf',
    name: 'Random Forest (100 Trees)',
    short: 'RF',
    accuracy: 99.78,
    precision: 99.75,
    recall: 99.80,
    f1: 99.77,
    flashFloat32: 142.0,
    flashInt8: 36.5,
    sram: 18.4,
    espLatency: 6.2,
    megaLatency: 42.6,
    bestIn: 'Ensemble Robust'
  },
  {
    id: 'xgboost',
    name: 'XGBoost',
    short: 'XGBoost',
    accuracy: 99.89,
    precision: 99.88,
    recall: 99.90,
    f1: 99.89,
    flashFloat32: 118.5,
    flashInt8: 30.2,
    sram: 14.2,
    espLatency: 5.4,
    megaLatency: 38.4,
    bestIn: 'High Precision'
  },
  {
    id: 'lightgbm',
    name: 'LightGBM (Optimized GBDT)',
    short: 'LightGBM',
    accuracy: 99.94,
    precision: 99.92,
    recall: 99.95,
    f1: 99.93,
    flashFloat32: 84.2,
    flashInt8: 21.6,
    sram: 9.8,
    espLatency: 4.2,
    megaLatency: 32.1,
    isBest: true,
    bestIn: 'Highest Detection (F1: 99.93%)'
  },
  {
    id: 'mlp',
    name: 'Multi-Layer Perceptron',
    short: 'MLP',
    accuracy: 99.21,
    precision: 99.15,
    recall: 99.25,
    f1: 99.20,
    flashFloat32: 96.8,
    flashInt8: 24.5,
    sram: 12.6,
    espLatency: 7.3,
    megaLatency: 56.8,
    bestIn: 'Non-Linear Fit'
  }
];

export default function Models() {
  const { data: apiModels } = useApi('/models', { fallbackData: modelBenchmarks });
  
  // Safely fallback to comprehensive research paper benchmarks if API shape differs
  const models = (apiModels && Array.isArray(apiModels) && apiModels[0]?.short) 
    ? apiModels 
    : modelBenchmarks;

  // Chart 1: F1-Score & Accuracy Comparison
  const f1BarData = {
    labels: models.map((m) => m.short),
    datasets: [
      {
        label: 'F1-Score (%)',
        data: models.map((m) => m.f1),
        backgroundColor: models.map((m) => m.isBest ? '#10b981' : 'rgba(99, 102, 241, 0.75)'),
        borderColor: models.map((m) => m.isBest ? '#34d399' : '#818cf8'),
        borderWidth: 1.5,
        borderRadius: 6
      },
      {
        label: 'Accuracy (%)',
        data: models.map((m) => m.accuracy),
        backgroundColor: 'rgba(34, 211, 238, 0.65)',
        borderColor: '#22d3ee',
        borderWidth: 1.5,
        borderRadius: 6
      }
    ]
  };

  const f1BarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#cbd5e1', padding: 14 }
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
        min: 94,
        max: 100,
        grid: { color: 'rgba(148, 163, 184, 0.08)' },
        ticks: { color: '#64748b' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#f1f5f9' }
      }
    }
  };

  // Chart 2: Memory Footprint (Float32 vs Quantised INT8)
  const memoryChartData = {
    labels: models.map((m) => m.short),
    datasets: [
      {
        label: 'Float32 Flash (KB)',
        data: models.map((m) => m.flashFloat32),
        backgroundColor: 'rgba(239, 68, 68, 0.75)',
        borderColor: '#ef4444',
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: 'Quantized INT8 Flash (KB) — ~74% Reduction',
        data: models.map((m) => m.flashInt8),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: 'Runtime SRAM Working Heap (KB)',
        data: models.map((m) => m.sram),
        backgroundColor: 'rgba(168, 85, 247, 0.75)',
        borderColor: '#a855f7',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const memoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#cbd5e1', padding: 14 }
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
        grid: { color: 'rgba(148, 163, 184, 0.08)' },
        ticks: { color: '#64748b' },
        title: {
          display: true,
          text: 'Memory Size (Kilobytes)',
          color: '#94a3b8'
        }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#f1f5f9' }
      }
    }
  };

  return (
    <>
      {/* Header */}
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">
            <HiChartBar style={{ color: 'var(--accent-primary)' }} />
            Machine Learning Model Benchmarks
          </h1>
          <p className="page-subtitle">
            Empirical comparative analysis of lightweight classifiers evaluated on the TON_IoT testbed
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <span className="badge badge-normal">
            <HiSparkles /> Champion: LightGBM (99.93% F1)
          </span>
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className="card animate-in stagger-1" style={{ padding: 0 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="card-title">Comprehensive Algorithm Matrix</div>
            <div className="card-subtitle">Classification metrics, storage footprint, and MCU inference latency</div>
          </div>
          <span className="badge badge-low">Float32 / INT8 Quantized</span>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Model Architecture</th>
                <th>Accuracy</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1-Score</th>
                <th>Flash (F32 / INT8)</th>
                <th>SRAM</th>
                <th>ESP32-C3 Latency</th>
                <th>Arduino Latency</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model) => (
                <tr 
                  key={model.id}
                  style={model.isBest ? { backgroundColor: 'rgba(16, 185, 129, 0.08)' } : {}}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {model.name}
                      </span>
                      {model.isBest && (
                        <span className="badge badge-normal" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                          Top Pick
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {model.bestIn}
                    </div>
                  </td>
                  <td>
                    <span style={{ color: model.isBest ? 'var(--accent-success)' : 'inherit', fontWeight: model.isBest ? 700 : 500 }}>
                      {model.accuracy.toFixed(2)}%
                    </span>
                  </td>
                  <td>
                    <span style={{ color: model.isBest ? 'var(--accent-success)' : 'inherit', fontWeight: model.isBest ? 700 : 500 }}>
                      {model.precision.toFixed(2)}%
                    </span>
                  </td>
                  <td>
                    <span style={{ color: model.isBest ? 'var(--accent-success)' : 'inherit', fontWeight: model.isBest ? 700 : 500 }}>
                      {model.recall.toFixed(2)}%
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: model.isBest ? 'var(--accent-success)' : 'var(--accent-secondary)' }}>
                      {model.f1.toFixed(2)}%
                    </strong>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.84rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{model.flashFloat32} KB</span>
                      <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>/</span>
                      <strong style={{ color: 'var(--accent-success)' }}>{model.flashInt8} KB</strong>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>
                      {model.sram} KB
                    </span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--accent-secondary)', fontWeight: 700, fontFamily: 'monospace' }}>
                      {model.espLatency} ms
                    </span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {model.megaLatency} ms
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2 Column Charts */}
      <div className="grid-2">
        {/* LEFT: F1 & Accuracy Bar Chart */}
        <div className="card animate-in stagger-2">
          <div className="card-header">
            <div>
              <div className="card-title">Detection Accuracy & F1-Score</div>
              <div className="card-subtitle">Side-by-side classification performance on TON_IoT test partition</div>
            </div>
          </div>
          <div className="chart-container">
            <Bar data={f1BarData} options={f1BarOptions} />
          </div>
        </div>

        {/* RIGHT: Memory Footprint Chart */}
        <div className="card animate-in stagger-3">
          <div className="card-header">
            <div>
              <div className="card-title">Memory Footprint Breakdown</div>
              <div className="card-subtitle">Flash ROM (Float32 vs INT8) & runtime SRAM allocations</div>
            </div>
          </div>
          <div className="chart-container">
            <Bar data={memoryChartData} options={memoryChartOptions} />
          </div>
        </div>
      </div>

      {/* Quantisation Impact Cards */}
      <div className="grid-3 animate-in stagger-4">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div className="kpi-icon-wrap icon-green">
              <HiArrowDownRight />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Flash Storage Compression</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-success)' }}>
                74.3% Avg Drop
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Uniform INT8 weight quantisation compresses LightGBM leaf thresholds from 84.2 KB down to 21.6 KB, fitting comfortably within 32 KB embedded ROM budgets.
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div className="kpi-icon-wrap icon-cyan">
              <HiScale />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>F1-Score Penalty</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>
                &lt; 0.04% Loss
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Quantisation error is virtually negligible across tree-based ensembles, preserving 99.89%+ multi-class discrimination fidelity without retraining.
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div className="kpi-icon-wrap icon-indigo">
              <HiCpuChip />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Inference Speedup</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                1.42× Faster
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Integer arithmetic eliminates soft-FPU overhead on 32-bit RISC-V cores, accelerating per-packet inference latency by 1.42× over 32-bit floats.
          </p>
        </div>
      </div>
    </>
  );
}
