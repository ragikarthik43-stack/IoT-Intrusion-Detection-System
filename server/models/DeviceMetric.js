import mongoose from 'mongoose';

const deviceMetricSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    deviceName: {
      type: String,
      trim: true,
    },
    architecture: {
      type: String,
      trim: true,
    },
    cpuUsage: {
      type: Number,
      min: 0,
      max: 100,
    },
    memoryUsage: {
      type: Number,
      min: 0,
      max: 100,
    },
    flashUsage: {
      type: Number,
      min: 0,
      max: 100,
    },
    sramUsage: {
      type: Number,
      min: 0,
      max: 100,
    },
    inferenceTimeUs: {
      type: Number,
      min: 0,
    },
    temperature: {
      type: Number,
    },
    packetsProcessed: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Online', 'Offline', 'Warning'],
      default: 'Online',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Compound index for querying a device's recent metrics efficiently
deviceMetricSchema.index({ deviceId: 1, timestamp: -1 });

const DeviceMetric = mongoose.model('DeviceMetric', deviceMetricSchema);

export default DeviceMetric;
