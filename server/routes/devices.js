import express from 'express';
import { DeviceMetricStore } from '../store.js';

const router = express.Router();

/**
 * GET /api/devices
 * Return the latest metric for each unique deviceId
 */
router.get('/', async (req, res) => {
  try {
    const items = [...DeviceMetricStore.items].sort((a, b) => {
      const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
      const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
      return bTime - aTime;
    });

    const latestMap = new Map();
    for (const item of items) {
      if (!latestMap.has(item.deviceId)) {
        latestMap.set(item.deviceId, item);
      }
    }

    const latestMetrics = Array.from(latestMap.values()).sort((a, b) => 
      a.deviceId.localeCompare(b.deviceId)
    );

    res.json(latestMetrics);
  } catch (error) {
    console.error('Error fetching device metrics:', error);
    res.status(500).json({ error: 'Failed to retrieve device metrics' });
  }
});

/**
 * GET /api/devices/:id/metrics
 * Return last 50 metrics for a specific device
 */
router.get('/:id/metrics', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = Math.max(1, Math.min(500, parseInt(req.query.limit, 10) || 50));

    const metrics = await DeviceMetricStore.find({ deviceId: id })
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json(metrics);
  } catch (error) {
    console.error(`Error fetching metrics for device ${req.params.id}:`, error);
    res.status(500).json({ error: `Failed to retrieve metrics for device ${req.params.id}` });
  }
});

export default router;
