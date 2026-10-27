import express from 'express';
import { getTrafficStats, triggerSimulatedEvent } from '../trafficMonitor.js';

const router = express.Router();

// Reference to Socket.IO will be injected via server/index.js
let ioRef = null;
export function setTrafficIO(io) {
  ioRef = io;
}

/**
 * GET /api/traffic/status
 */
router.get('/status', (req, res) => {
  try {
    const stats = getTrafficStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve traffic stats' });
  }
});

/**
 * POST /api/traffic/simulate
 * Body: { type: 'HIGH_TRAFFIC' | 'ATTACK_SURGE' | 'SERVER_OVERLOAD' }
 */
router.post('/simulate', (req, res) => {
  try {
    const { type = 'ATTACK_SURGE' } = req.body || {};
    const notif = triggerSimulatedEvent(ioRef, type);
    res.json({
      message: `Triggered simulated ${type} alert`,
      notification: notif
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to trigger simulation' });
  }
});

export default router;
