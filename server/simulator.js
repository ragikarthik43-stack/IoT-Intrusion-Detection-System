import { AlertStore as Alert, DeviceMetricStore as DeviceMetric, ModelPerformanceStore as ModelPerformance } from './store.js';

// Pre-defined model evaluation data from the research paper
const SEED_MODEL_DATA = [
  // LightGBM (Best performer)
  {
    modelName: 'LightGBM',
    accuracy: 0.9994,
    precision: 0.9992,
    recall: 0.9994,
    f1Score: 0.9993,
    flashSizeKB: 890,
    sramKB: 45,
    inferenceTimeUs: 195,
    quantisationType: 'Float32',
    compressionRatio: 1.0,
    targetDevice: 'ESP32-C3',
  },
  {
    modelName: 'LightGBM',
    accuracy: 0.9992,
    precision: 0.9991,
    recall: 0.9993,
    f1Score: 0.9992,
    flashSizeKB: 48,
    sramKB: 12,
    inferenceTimeUs: 85,
    quantisationType: 'Custom-INT8',
    compressionRatio: 18.54,
    targetDevice: 'ESP32-C3',
  },
  {
    modelName: 'LightGBM',
    accuracy: 0.9992,
    precision: 0.9991,
    recall: 0.9993,
    f1Score: 0.9992,
    flashSizeKB: 48,
    sramKB: 12,
    inferenceTimeUs: 580,
    quantisationType: 'Custom-INT8',
    compressionRatio: 18.54,
    targetDevice: 'Arduino Mega 2560',
  },

  // XGBoost
  {
    modelName: 'XGBoost',
    accuracy: 0.9989,
    precision: 0.9987,
    recall: 0.9989,
    f1Score: 0.9988,
    flashSizeKB: 750,
    sramKB: 38,
    inferenceTimeUs: 165,
    quantisationType: 'Float32',
    compressionRatio: 1.0,
    targetDevice: 'ESP32-C3',
  },
  {
    modelName: 'XGBoost',
    accuracy: 0.9987,
    precision: 0.9985,
    recall: 0.9988,
    f1Score: 0.9986,
    flashSizeKB: 41,
    sramKB: 10,
    inferenceTimeUs: 72,
    quantisationType: 'Custom-INT8',
    compressionRatio: 18.29,
    targetDevice: 'ESP32-C3',
  },
  {
    modelName: 'XGBoost',
    accuracy: 0.9987,
    precision: 0.9985,
    recall: 0.9988,
    f1Score: 0.9986,
    flashSizeKB: 41,
    sramKB: 10,
    inferenceTimeUs: 490,
    quantisationType: 'Custom-INT8',
    compressionRatio: 18.29,
    targetDevice: 'Arduino Mega 2560',
  },

  // Random Forest
  {
    modelName: 'Random Forest',
    accuracy: 0.9978,
    precision: 0.9974,
    recall: 0.9976,
    f1Score: 0.9975,
    flashSizeKB: 620,
    sramKB: 32,
    inferenceTimeUs: 270,
    quantisationType: 'Float32',
    compressionRatio: 1.0,
    targetDevice: 'ESP32-C3',
  },
  {
    modelName: 'Random Forest',
    accuracy: 0.9975,
    precision: 0.9971,
    recall: 0.9973,
    f1Score: 0.9972,
    flashSizeKB: 95,
    sramKB: 8,
    inferenceTimeUs: 120,
    quantisationType: 'C-Export',
    compressionRatio: 6.53,
    targetDevice: 'ESP32-C3',
  },
  {
    modelName: 'Random Forest',
    accuracy: 0.9975,
    precision: 0.9971,
    recall: 0.9973,
    f1Score: 0.9972,
    flashSizeKB: 95,
    sramKB: 8,
    inferenceTimeUs: 850,
    quantisationType: 'C-Export',
    compressionRatio: 6.53,
    targetDevice: 'Arduino Mega 2560',
  },

  // Decision Tree
  {
    modelName: 'Decision Tree',
    accuracy: 0.9925,
    precision: 0.9918,
    recall: 0.9922,
    f1Score: 0.9920,
    flashSizeKB: 15,
    sramKB: 2,
    inferenceTimeUs: 18,
    quantisationType: 'Float32',
    compressionRatio: 1.0,
    targetDevice: 'ESP32-C3',
  },
  {
    modelName: 'Decision Tree',
    accuracy: 0.9923,
    precision: 0.9916,
    recall: 0.9920,
    f1Score: 0.9918,
    flashSizeKB: 5,
    sramKB: 1,
    inferenceTimeUs: 8,
    quantisationType: 'C-Export',
    compressionRatio: 3.0,
    targetDevice: 'ESP32-C3',
  },
  {
    modelName: 'Decision Tree',
    accuracy: 0.9923,
    precision: 0.9916,
    recall: 0.9920,
    f1Score: 0.9918,
    flashSizeKB: 5,
    sramKB: 1,
    inferenceTimeUs: 52,
    quantisationType: 'C-Export',
    compressionRatio: 3.0,
    targetDevice: 'Arduino Mega 2560',
  },

  // Logistic Regression
  {
    modelName: 'Logistic Regression',
    accuracy: 0.9680,
    precision: 0.9645,
    recall: 0.9655,
    f1Score: 0.9650,
    flashSizeKB: 8,
    sramKB: 1,
    inferenceTimeUs: 7,
    quantisationType: 'Float32',
    compressionRatio: 1.0,
    targetDevice: 'ESP32-C3',
  },
  {
    modelName: 'Logistic Regression',
    accuracy: 0.9675,
    precision: 0.9640,
    recall: 0.9650,
    f1Score: 0.9642,
    flashSizeKB: 3,
    sramKB: 0.5,
    inferenceTimeUs: 3,
    quantisationType: 'C-Export',
    compressionRatio: 2.67,
    targetDevice: 'ESP32-C3',
  },
  {
    modelName: 'Logistic Regression',
    accuracy: 0.9675,
    precision: 0.9640,
    recall: 0.9650,
    f1Score: 0.9642,
    flashSizeKB: 3,
    sramKB: 0.5,
    inferenceTimeUs: 18,
    quantisationType: 'C-Export',
    compressionRatio: 2.67,
    targetDevice: 'Arduino Mega 2560',
  },

  // MLP (Multi-Layer Perceptron)
  {
    modelName: 'MLP',
    accuracy: 0.9915,
    precision: 0.9908,
    recall: 0.9912,
    f1Score: 0.9910,
    flashSizeKB: 180,
    sramKB: 25,
    inferenceTimeUs: 105,
    quantisationType: 'Float32',
    compressionRatio: 1.0,
    targetDevice: 'ESP32-C3',
  },
  {
    modelName: 'MLP',
    accuracy: 0.9902,
    precision: 0.9892,
    recall: 0.9900,
    f1Score: 0.9895,
    flashSizeKB: 13,
    sramKB: 6,
    inferenceTimeUs: 45,
    quantisationType: 'INT8',
    compressionRatio: 13.85,
    targetDevice: 'ESP32-C3',
  },
  {
    modelName: 'MLP',
    accuracy: 0.9902,
    precision: 0.9892,
    recall: 0.9900,
    f1Score: 0.9895,
    flashSizeKB: 13,
    sramKB: 6,
    inferenceTimeUs: 310,
    quantisationType: 'INT8',
    compressionRatio: 13.85,
    targetDevice: 'Arduino Mega 2560',
  },
];

// Attack distribution specification (sum = 100%)
const ATTACK_DISTRIBUTION = [
  { type: 'DDoS', weight: 0.25, severity: 'Critical' },
  { type: 'DoS', weight: 0.20, severity: 'High' },
  { type: 'Scanning', weight: 0.18, severity: 'Low' },
  { type: 'Password', weight: 0.12, severity: 'Medium' },
  { type: 'XSS', weight: 0.10, severity: 'Medium' },
  { type: 'Injection', weight: 0.08, severity: 'High' },
  { type: 'Backdoor', weight: 0.03, severity: 'Critical' },
  { type: 'MITM', weight: 0.02, severity: 'High' },
  { type: 'Ransomware', weight: 0.02, severity: 'Critical' },
];

const AVAILABLE_MODELS = [
  { name: 'LightGBM', baseF1: 0.9993 },
  { name: 'XGBoost', baseF1: 0.9988 },
  { name: 'Random Forest', baseF1: 0.9975 },
  { name: 'Decision Tree', baseF1: 0.9920 },
  { name: 'Logistic Regression', baseF1: 0.9650 },
  { name: 'MLP', baseF1: 0.9910 },
];

const DEVICES = ['esp32-c3', 'arduino-mega-2560'];

// Helper to get random integer between min and max inclusive
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper to generate internal IoT network IP
function generateInternalIP() {
  const subnet = randomInt(0, 3);
  const host = randomInt(10, 250);
  return `10.0.${subnet}.${host}`;
}

// Helper to generate external IP
function generateExternalIP() {
  const octet1 = randomInt(24, 215);
  const octet2 = randomInt(1, 254);
  const octet3 = randomInt(1, 254);
  const octet4 = randomInt(1, 254);
  return `${octet1}.${octet2}.${octet3}.${octet4}`;
}

// Helper to pick attack type according to weighted distribution
function pickAttack() {
  const rand = Math.random();
  let cumulative = 0;
  for (const attack of ATTACK_DISTRIBUTION) {
    cumulative += attack.weight;
    if (rand <= cumulative) {
      return attack;
    }
  }
  return ATTACK_DISTRIBUTION[0];
}

// Generate realistic alert data
function generateAlertPayload(overrideTimestamp = null) {
  const isAttack = Math.random() < 0.3; // 70% normal, 30% attack
  let attackType = 'Normal';
  let severity = 'Info';
  let isAnomaly = false;

  if (isAttack) {
    const selectedAttack = pickAttack();
    attackType = selectedAttack.type;
    severity = selectedAttack.severity;
    isAnomaly = true;
  }

  // Protocol assignment based on attack type or realistic normal traffic
  let protocol = 'TCP';
  let sourcePort = randomInt(32768, 61000);
  let destPort = 80;
  let packetSize = randomInt(64, 1200);
  let flowDuration = randomInt(15, 600);

  if (!isAnomaly) {
    const protocols = ['TCP', 'UDP', 'HTTP', 'DNS', 'MQTT'];
    protocol = protocols[randomInt(0, protocols.length - 1)];
    if (protocol === 'MQTT') destPort = 1883;
    else if (protocol === 'HTTP') destPort = 80;
    else if (protocol === 'DNS') destPort = 53;
    else if (protocol === 'TCP') destPort = 443;
    else if (protocol === 'UDP') destPort = 5000;
  } else {
    switch (attackType) {
      case 'DDoS':
        protocol = Math.random() < 0.6 ? 'UDP' : 'TCP';
        destPort = [80, 443, 1883, 53][randomInt(0, 3)];
        packetSize = randomInt(1024, 1500);
        flowDuration = randomInt(2000, 12000);
        break;
      case 'DoS':
        protocol = Math.random() < 0.5 ? 'TCP' : 'HTTP';
        destPort = [80, 8080, 1883][randomInt(0, 2)];
        packetSize = randomInt(512, 1400);
        flowDuration = randomInt(1500, 8000);
        break;
      case 'Scanning':
        protocol = Math.random() < 0.8 ? 'TCP' : 'UDP';
        destPort = randomInt(20, 1024);
        packetSize = randomInt(40, 68);
        flowDuration = randomInt(5, 50);
        break;
      case 'Password':
        protocol = 'TCP';
        destPort = [22, 23, 1883, 8080][randomInt(0, 3)];
        packetSize = randomInt(120, 450);
        flowDuration = randomInt(100, 800);
        break;
      case 'XSS':
      case 'Injection':
        protocol = 'HTTP';
        destPort = [80, 8080, 3000][randomInt(0, 2)];
        packetSize = randomInt(400, 2400);
        flowDuration = randomInt(150, 900);
        break;
      case 'Backdoor':
        protocol = 'TCP';
        destPort = [4444, 5555, 6666, 8888][randomInt(0, 3)];
        packetSize = randomInt(150, 750);
        flowDuration = randomInt(500, 4500);
        break;
      case 'MITM':
        protocol = Math.random() < 0.5 ? 'DNS' : 'HTTP';
        destPort = protocol === 'DNS' ? 53 : 80;
        packetSize = randomInt(100, 600);
        flowDuration = randomInt(80, 1200);
        break;
      case 'Ransomware':
        protocol = 'TCP';
        destPort = [445, 139, 3389][randomInt(0, 2)];
        packetSize = randomInt(600, 1500);
        flowDuration = randomInt(1000, 6000);
        break;
      default:
        protocol = 'TCP';
        destPort = 80;
    }
  }

  // Realistic IP mapping
  let sourceIP;
  let destIP;
  if (!isAnomaly) {
    sourceIP = generateInternalIP();
    destIP = Math.random() < 0.5 ? generateInternalIP() : generateExternalIP();
  } else {
    // Attacks often originate externally or from compromised internal nodes
    sourceIP = Math.random() < 0.75 ? generateExternalIP() : generateInternalIP();
    destIP = generateInternalIP();
  }

  // Assign model and confidence
  const modelChoice = AVAILABLE_MODELS[randomInt(0, AVAILABLE_MODELS.length - 1)];
  const confidenceNoise = (Math.random() * 0.02 - 0.01);
  const confidence = Math.min(0.9999, Math.max(0.85, Number((modelChoice.baseF1 + confidenceNoise).toFixed(4))));

  // Pick device ID
  const deviceId = DEVICES[randomInt(0, DEVICES.length - 1)];

  return {
    timestamp: overrideTimestamp || new Date(),
    sourceIP,
    destIP,
    sourcePort,
    destPort,
    protocol,
    attackType,
    severity,
    modelUsed: modelChoice.name,
    confidence,
    deviceId,
    isAnomaly,
    packetSize,
    flowDuration,
  };
}

// Device simulation state counters
const deviceState = {
  'arduino-mega-2560': {
    packetCounter: 1420,
    tick: 0,
  },
  'esp32-c3': {
    packetCounter: 4850,
    tick: 0,
  },
};

// Generate device metric payload
function generateDeviceMetricPayload(deviceId) {
  const now = new Date();
  if (deviceId === 'arduino-mega-2560') {
    const state = deviceState['arduino-mega-2560'];
    state.tick += 1;
    state.packetCounter += randomInt(8, 28);

    // CPU oscillates 40-85%
    const cpuBase = 62.5 + 22.5 * Math.sin(state.tick * 0.2);
    const cpuNoise = (Math.random() - 0.5) * 8;
    const cpuUsage = Math.min(85, Math.max(40, Number((cpuBase + cpuNoise).toFixed(1))));

    // Memory oscillates 55-75%
    const memBase = 65 + 10 * Math.sin(state.tick * 0.15 + 1);
    const memNoise = (Math.random() - 0.5) * 4;
    const memoryUsage = Math.min(75, Math.max(55, Number((memBase + memNoise).toFixed(1))));

    // Temperature 35-48°C
    const tempBase = 41.5 + 6.5 * Math.sin(state.tick * 0.1);
    const tempNoise = (Math.random() - 0.5) * 2;
    const temperature = Math.min(48, Math.max(35, Number((tempBase + tempNoise).toFixed(1))));

    // Flash steady ~68%, SRAM ~72%
    const flashUsage = Number((68 + (Math.random() - 0.5) * 0.8).toFixed(1));
    const sramUsage = Number((72 + (Math.random() - 0.5) * 1.2).toFixed(1));

    // Inference time 480-620 us
    const inferenceTimeUs = randomInt(480, 620);

    const status = (cpuUsage > 82 || temperature > 46.5) ? 'Warning' : 'Online';

    return {
      deviceId: 'arduino-mega-2560',
      deviceName: 'Arduino Mega 2560',
      architecture: '8-bit ATmega2560',
      cpuUsage,
      memoryUsage,
      flashUsage,
      sramUsage,
      inferenceTimeUs,
      temperature,
      packetsProcessed: state.packetCounter,
      status,
      timestamp: now,
    };
  } else {
    // ESP32-C3 SuperMini
    const state = deviceState['esp32-c3'];
    state.tick += 1;
    state.packetCounter += randomInt(20, 55);

    // CPU oscillates 25-65%
    const cpuBase = 45 + 20 * Math.sin(state.tick * 0.25);
    const cpuNoise = (Math.random() - 0.5) * 6;
    const cpuUsage = Math.min(65, Math.max(25, Number((cpuBase + cpuNoise).toFixed(1))));

    // Memory oscillates 35-55%
    const memBase = 45 + 10 * Math.sin(state.tick * 0.18 + 0.5);
    const memNoise = (Math.random() - 0.5) * 4;
    const memoryUsage = Math.min(55, Math.max(35, Number((memBase + memNoise).toFixed(1))));

    // Temperature 30-42°C
    const tempBase = 36 + 6 * Math.sin(state.tick * 0.12);
    const tempNoise = (Math.random() - 0.5) * 1.5;
    const temperature = Math.min(42, Math.max(30, Number((tempBase + tempNoise).toFixed(1))));

    // Flash steady ~42%, SRAM ~38%
    const flashUsage = Number((42 + (Math.random() - 0.5) * 0.6).toFixed(1));
    const sramUsage = Number((38 + (Math.random() - 0.5) * 0.8).toFixed(1));

    // Inference time 68-95 us
    const inferenceTimeUs = randomInt(68, 95);

    const status = (cpuUsage > 62 || temperature > 40.5) ? 'Warning' : 'Online';

    return {
      deviceId: 'esp32-c3',
      deviceName: 'ESP32-C3 SuperMini',
      architecture: '32-bit RISC-V',
      cpuUsage,
      memoryUsage,
      flashUsage,
      sramUsage,
      inferenceTimeUs,
      temperature,
      packetsProcessed: state.packetCounter,
      status,
      timestamp: now,
    };
  }
}

/**
 * Seed initial model performance records if collection is empty
 */
async function seedModelPerformance() {
  try {
    const count = await ModelPerformance.countDocuments();
    if (count === 0) {
      console.log('Seeding initial model performance data...');
      await ModelPerformance.insertMany(SEED_MODEL_DATA);
      console.log(`Successfully seeded ${SEED_MODEL_DATA.length} model performance records.`);
    } else {
      console.log(`Model performance data already exists (${count} records). Skipping seed.`);
    }
  } catch (error) {
    console.error('Error seeding model performance data:', error);
  }
}

/**
 * Seed initial historical alerts and device metrics across past 24 hours
 * if collections are brand new, ensuring charts display rich immediate data.
 */
async function seedHistoricalDataIfEmpty() {
  try {
    const alertCount = await Alert.countDocuments();
    if (alertCount === 0) {
      console.log('Seeding initial historical alert data across past 24 hours...');
      const historicalAlerts = [];
      const now = Date.now();
      const numAlerts = 160;

      for (let i = 0; i < numAlerts; i++) {
        // Distribute timestamp across the last 24 hours
        const randomAgoMs = Math.random() * 24 * 60 * 60 * 1000;
        const timestamp = new Date(now - randomAgoMs);
        historicalAlerts.push(generateAlertPayload(timestamp));
      }

      await Alert.insertMany(historicalAlerts);
      console.log(`Successfully seeded ${historicalAlerts.length} historical alerts.`);
    }

    const metricCount = await DeviceMetric.countDocuments();
    if (metricCount === 0) {
      console.log('Seeding initial device metrics history...');
      const initialMetrics = [];
      const now = Date.now();
      // Seed 25 past metrics for each device
      for (let i = 25; i >= 1; i--) {
        const metricTime = new Date(now - i * 5000);
        const mega = generateDeviceMetricPayload('arduino-mega-2560');
        mega.timestamp = metricTime;
        const esp = generateDeviceMetricPayload('esp32-c3');
        esp.timestamp = metricTime;
        initialMetrics.push(mega, esp);
      }
      await DeviceMetric.insertMany(initialMetrics);
      console.log(`Successfully seeded ${initialMetrics.length} device metric records.`);
    }
  } catch (error) {
    console.error('Error seeding initial historical data:', error);
  }
}

/**
 * Main simulator runner
 */
export function startSimulator(io) {
  console.log('Starting IoT/IIoT IDS Simulator...');

  // 1. Seed model performance data & initial history on startup
  seedModelPerformance();
  seedHistoricalDataIfEmpty();

  // 2. Generate network alerts every 2-3 seconds with random jitter
  function scheduleNextAlert() {
    const jitterDelay = 2000 + Math.random() * 1000; // 2000ms - 3000ms
    setTimeout(async () => {
      try {
        const payload = generateAlertPayload();
        const alert = await Alert.create(payload);
        if (io) {
          io.emit('newAlert', alert);
        }
      } catch (err) {
        console.error('Error generating simulator alert:', err);
      } finally {
        scheduleNextAlert();
      }
    }, jitterDelay);
  }

  scheduleNextAlert();

  // 3. Update device metrics every 5 seconds for both devices
  setInterval(async () => {
    try {
      const megaPayload = generateDeviceMetricPayload('arduino-mega-2560');
      const espPayload = generateDeviceMetricPayload('esp32-c3');

      const savedMetrics = await DeviceMetric.insertMany([megaPayload, espPayload]);

      if (io) {
        // Emit array of updated device metrics
        io.emit('deviceMetrics', savedMetrics);
        // Also emit individually for flexible frontend listeners
        io.emit('deviceMetric', savedMetrics[0]);
        io.emit('deviceMetric', savedMetrics[1]);
      }
    } catch (err) {
      console.error('Error updating device metrics:', err);
    }
  }, 5000);

  console.log('IDS Simulator initialized (alerts: 2-3s jitter, device metrics: 5s)');
}
