import express from 'express';
import { AlertStore } from '../store.js';

const router = express.Router();

/**
 * GET /api/alerts/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const now = Date.now();
    const last24hTime = now - 24 * 60 * 60 * 1000;
    const items = AlertStore.items;

    const totalAlerts = items.length;
    let last24hCount = 0;
    let anomalyCount = 0;
    const typeCounts = {};
    const severityCounts = {};

    for (const item of items) {
      const itemTime = item.timestamp instanceof Date ? item.timestamp.getTime() : new Date(item.timestamp).getTime();
      if (itemTime >= last24hTime) {
        last24hCount++;
      }
      if (item.isAnomaly) {
        anomalyCount++;
      }

      typeCounts[item.attackType] = (typeCounts[item.attackType] || 0) + 1;
      severityCounts[item.severity] = (severityCounts[item.severity] || 0) + 1;
    }

    const anomalyRate = totalAlerts > 0 ? Number((anomalyCount / totalAlerts).toFixed(4)) : 0;

    const alertsByType = Object.entries(typeCounts)
      .map(([_id, count]) => ({ _id, count }))
      .sort((a, b) => b.count - a.count);

    const alertsBySeverity = Object.entries(severityCounts)
      .map(([_id, count]) => ({ _id, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      totalAlerts,
      last24hCount,
      anomalyCount,
      anomalyRate,
      alertsByType,
      alertsBySeverity,
    });
  } catch (error) {
    console.error('Error fetching alert stats:', error);
    res.status(500).json({ error: 'Failed to retrieve alert statistics' });
  }
});

/**
 * GET /api/alerts/distribution
 */
router.get('/distribution', async (req, res) => {
  try {
    const attackClasses = [
      'Normal', 'Backdoor', 'DDoS', 'DoS', 'Injection', 
      'MITM', 'Password', 'Ransomware', 'Scanning', 'XSS'
    ];
    const countsMap = {};
    for (const cls of attackClasses) countsMap[cls] = 0;

    for (const item of AlertStore.items) {
      if (item.attackType in countsMap) {
        countsMap[item.attackType]++;
      }
    }

    res.json({
      labels: attackClasses,
      counts: attackClasses.map(cls => countsMap[cls] || 0)
    });
  } catch (error) {
    console.error('Error fetching alert distribution:', error);
    res.status(500).json({ error: 'Failed to retrieve distribution' });
  }
});

/**
 * GET /api/alerts/timeline
 */
router.get('/timeline', async (req, res) => {
  try {
    const now = new Date();
    const last24hTime = now.getTime() - 24 * 60 * 60 * 1000;
    const items = AlertStore.items;

    const bucketMap = new Map();
    const currentHour = new Date(now);
    currentHour.setMinutes(0, 0, 0);

    for (let i = 23; i >= 0; i--) {
      const bucketTime = new Date(currentHour.getTime() - i * 60 * 60 * 1000);
      const hourKey = bucketTime.toISOString().slice(0, 14) + '00:00.000Z';
      bucketMap.set(hourKey, { hour: hourKey, count: 0, attacks: 0 });
    }

    for (const item of items) {
      const itemDate = item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp);
      if (itemDate.getTime() >= last24hTime) {
        const itemHourKey = itemDate.toISOString().slice(0, 14) + '00:00.000Z';
        if (bucketMap.has(itemHourKey)) {
          const bucket = bucketMap.get(itemHourKey);
          bucket.count++;
          if (item.isAnomaly) {
            bucket.attacks++;
          }
        }
      }
    }

    res.json(Array.from(bucketMap.values()));
  } catch (error) {
    console.error('Error fetching alert timeline:', error);
    res.status(500).json({ error: 'Failed to retrieve alert timeline' });
  }
});

/**
 * GET /api/alerts/recent
 */
router.get('/recent', async (req, res) => {
  try {
    const recentAlerts = await AlertStore.find()
      .sort({ timestamp: -1 })
      .limit(10);
    res.json(recentAlerts);
  } catch (error) {
    console.error('Error fetching recent alerts:', error);
    res.status(500).json({ error: 'Failed to retrieve recent alerts' });
  }
});

/**
 * GET /api/alerts
 */
router.get('/', async (req, res) => {
  try {
    const { attackType, severity, limit = 100, skip = 0 } = req.query;
    const filter = {};

    if (attackType) {
      filter.attackType = attackType;
    }
    if (severity) {
      filter.severity = severity;
    }

    const parsedLimit = Math.max(1, Math.min(1000, parseInt(limit, 10) || 100));
    const parsedSkip = Math.max(0, parseInt(skip, 10) || 0);

    const alerts = await AlertStore.find(filter)
      .sort({ timestamp: -1 })
      .skip(parsedSkip)
      .limit(parsedLimit);

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to retrieve alerts' });
  }
});

export default router;
