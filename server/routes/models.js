import express from 'express';
import { ModelPerformanceStore } from '../store.js';

const router = express.Router();

/**
 * GET /api/models/compare
 * Return comparison data grouped by model, showing performance across different quantisation types
 */
router.get('/compare', async (req, res) => {
  try {
    const items = ModelPerformanceStore.items;
    const modelMap = new Map();

    for (const item of items) {
      if (!modelMap.has(item.modelName)) {
        modelMap.set(item.modelName, {
          _id: item.modelName,
          modelName: item.modelName,
          variants: []
        });
      }
      modelMap.get(item.modelName).variants.push({
        _id: item._id,
        quantisationType: item.quantisationType,
        targetDevice: item.targetDevice,
        accuracy: item.accuracy,
        precision: item.precision,
        recall: item.recall,
        f1Score: item.f1Score,
        flashSizeKB: item.flashSizeKB,
        sramKB: item.sramKB,
        inferenceTimeUs: item.inferenceTimeUs,
        compressionRatio: item.compressionRatio,
        timestamp: item.timestamp,
      });
    }

    const comparison = Array.from(modelMap.values()).sort((a, b) => 
      a.modelName.localeCompare(b.modelName)
    );

    res.json(comparison);
  } catch (error) {
    console.error('Error fetching model comparison data:', error);
    res.status(500).json({ error: 'Failed to retrieve model comparison data' });
  }
});

/**
 * GET /api/models
 * Return all model performance records
 */
router.get('/', async (req, res) => {
  try {
    const models = [...ModelPerformanceStore.items].sort((a, b) => {
      const cmp = a.modelName.localeCompare(b.modelName);
      if (cmp !== 0) return cmp;
      return (a.quantisationType || '').localeCompare(b.quantisationType || '');
    });
    res.json(models);
  } catch (error) {
    console.error('Error fetching model performance records:', error);
    res.status(500).json({ error: 'Failed to retrieve model performance records' });
  }
});

export default router;
