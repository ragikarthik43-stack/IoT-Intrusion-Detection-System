import { randomUUID } from 'crypto';
import { AlertStore } from './store.js';

// Sliding window request tracking
const requestTimestamps = [];
const requestWindowMs = 60000; // 60 seconds

let activeRequests = 0;
let totalRequestsCount = 0;
let lastLagCheckTime = Date.now();
let eventLoopLagMs = 0;

// Notification cooldowns to prevent spamming
const lastNotificationTimes = {
  HIGH_TRAFFIC: 0,
  ATTACK_SURGE: 0,
  SERVER_OVERLOAD: 0
};
const NOTIFICATION_COOLDOWN_MS = 10000; // 10 seconds between same alert type

// Measure event loop lag
function measureEventLoopLag() {
  const start = Date.now();
  setTimeout(() => {
    const delta = Date.now() - start;
    eventLoopLagMs = Math.max(0, delta - 50); // timer was 50ms
  }, 50);
}
setInterval(measureEventLoopLag, 1000);

export function trafficMiddleware(req, res, next) {
  // Ignore static assets or health checks from noise if needed
  const now = Date.now();
  requestTimestamps.push(now);
  totalRequestsCount++;
  activeRequests++;

  // Clean old timestamps outside the 60s window
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - requestWindowMs) {
    requestTimestamps.shift();
  }

  const startTime = process.hrtime();

  res.on('finish', () => {
    activeRequests = Math.max(0, activeRequests - 1);
  });

  next();
}

export function getTrafficStats() {
  const now = Date.now();
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - requestWindowMs) {
    requestTimestamps.shift();
  }

  // Calculate requests in last 5 seconds and 60 seconds
  const last5SecCount = requestTimestamps.filter(t => t >= now - 5000).length;
  const requestsPerSecond = Number((last5SecCount / 5).toFixed(1));
  const requestsLastMinute = requestTimestamps.length;

  // Calculate recent attack alerts from AlertStore
  const last15Sec = now - 15000;
  const recentAlerts = AlertStore.items.filter(item => {
    const t = item.timestamp instanceof Date ? item.timestamp.getTime() : new Date(item.timestamp).getTime();
    return t >= last15Sec;
  });

  const recentAttacks = recentAlerts.filter(a => a.isAnomaly);
  const criticalAttacks = recentAttacks.filter(a => 
    a.severity === 'Critical' || a.attackType === 'DDoS' || a.attackType === 'Ransomware' || a.attackType === 'Backdoor'
  );

  const memoryUsage = process.memoryUsage();
  const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);

  return {
    requestsPerSecond,
    requestsLastMinute,
    totalRequestsCount,
    activeRequests,
    eventLoopLagMs,
    memoryUsedMB,
    recentAttacksCount15s: recentAttacks.length,
    criticalAttacksCount15s: criticalAttacks.length,
    timestamp: new Date().toISOString()
  };
}

export function startTrafficMonitor(io) {
  console.log('Traffic and Attack Surge Monitor started.');

  // Interval checker (every 3 seconds)
  setInterval(() => {
    if (!io) return;
    const stats = getTrafficStats();
    const now = Date.now();

    // 1. Check for High Traffic
    if (stats.requestsPerSecond > 18 || stats.requestsLastMinute > 300) {
      if (now - lastNotificationTimes.HIGH_TRAFFIC > NOTIFICATION_COOLDOWN_MS) {
        lastNotificationTimes.HIGH_TRAFFIC = now;
        const notification = {
          id: `NOTIF-${randomUUID().slice(0, 8)}`,
          type: 'HIGH_TRAFFIC',
          severity: 'warning',
          title: 'High Inbound Network Traffic Detected',
          message: `Backend processing ${stats.requestsPerSecond} req/sec (${stats.requestsLastMinute} req/min). System telemetry ingress is running under heavy load.`,
          data: {
            requestsPerSecond: stats.requestsPerSecond,
            requestsLastMinute: stats.requestsLastMinute,
            activeRequests: stats.activeRequests
          },
          timestamp: new Date().toISOString()
        };
        io.emit('serverNotification', notification);
      }
    }

    // 2. Check for Attack Surge (multiple anomalies in 15s or critical attacks)
    if (stats.recentAttacksCount15s >= 3 || stats.criticalAttacksCount15s >= 2) {
      if (now - lastNotificationTimes.ATTACK_SURGE > NOTIFICATION_COOLDOWN_MS) {
        lastNotificationTimes.ATTACK_SURGE = now;
        const notification = {
          id: `NOTIF-${randomUUID().slice(0, 8)}`,
          type: 'ATTACK_SURGE',
          severity: 'critical',
          title: 'Intrusion Surge Alert: High Threat Velocity',
          message: `${stats.recentAttacksCount15s} hostile intrusion vectors intercepted in last 15s! (${stats.criticalAttacksCount15s} critical threat signatures active).`,
          data: {
            attackCount: stats.recentAttacksCount15s,
            criticalCount: stats.criticalAttacksCount15s
          },
          timestamp: new Date().toISOString()
        };
        io.emit('serverNotification', notification);
      }
    }

    // 3. Check for Server Overload / Latency Spikes
    if (stats.eventLoopLagMs > 350 || stats.memoryUsedMB > 500) {
      if (now - lastNotificationTimes.SERVER_OVERLOAD > NOTIFICATION_COOLDOWN_MS) {
        lastNotificationTimes.SERVER_OVERLOAD = now;
        const notification = {
          id: `NOTIF-${randomUUID().slice(0, 8)}`,
          type: 'SERVER_OVERLOAD',
          severity: 'critical',
          title: 'Backend Engine Resource Congestion',
          message: `Server event loop delay is ${stats.eventLoopLagMs}ms. Memory footprint: ${stats.memoryUsedMB}MB. Edge processing delay elevated.`,
          data: {
            eventLoopLagMs: stats.eventLoopLagMs,
            memoryUsedMB: stats.memoryUsedMB
          },
          timestamp: new Date().toISOString()
        };
        io.emit('serverNotification', notification);
      }
    }

    // Broadcast live traffic pulse to connected clients
    io.emit('trafficPulse', {
      requestsPerSecond: stats.requestsPerSecond,
      activeRequests: stats.activeRequests,
      memoryUsedMB: stats.memoryUsedMB,
      eventLoopLagMs: stats.eventLoopLagMs,
      recentAttacksCount: stats.recentAttacksCount15s
    });

  }, 3000);
}

// Function to manually trigger simulated events (for testing from UI or testing tools)
export function triggerSimulatedEvent(io, eventType) {
  const stats = getTrafficStats();
  let notification;

  if (eventType === 'HIGH_TRAFFIC') {
    notification = {
      id: `NOTIF-${randomUUID().slice(0, 8)}`,
      type: 'HIGH_TRAFFIC',
      severity: 'warning',
      title: 'High Inbound Traffic Spike',
      message: `Simulated traffic burst: 48.5 req/sec across edge broker gateways. Throughput capacity alert active.`,
      data: { requestsPerSecond: 48.5, simulated: true },
      timestamp: new Date().toISOString()
    };
  } else if (eventType === 'ATTACK_SURGE') {
    notification = {
      id: `NOTIF-${randomUUID().slice(0, 8)}`,
      type: 'ATTACK_SURGE',
      severity: 'critical',
      title: 'Active DDoS & Injection Attack Surge',
      message: `Multi-vector intrusion wave detected! 12 malicious signatures intercepted across IoT cluster within 10 seconds.`,
      data: { attackCount: 12, criticalCount: 7, simulated: true },
      timestamp: new Date().toISOString()
    };
  } else if (eventType === 'SERVER_OVERLOAD') {
    notification = {
      id: `NOTIF-${randomUUID().slice(0, 8)}`,
      type: 'SERVER_OVERLOAD',
      severity: 'critical',
      title: 'Backend Congestion / Latency Threshold Exceeded',
      message: `High latency detected on core worker threads (lag: 420ms). Packet inspection pipeline running at 94% capacity.`,
      data: { eventLoopLagMs: 420, memoryUsedMB: 380, simulated: true },
      timestamp: new Date().toISOString()
    };
  }

  if (notification && io) {
    io.emit('serverNotification', notification);
  }
  return notification;
}
