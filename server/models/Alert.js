import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    sourceIP: {
      type: String,
      required: true,
      trim: true,
    },
    destIP: {
      type: String,
      required: true,
      trim: true,
    },
    sourcePort: {
      type: Number,
      min: 0,
      max: 65535,
    },
    destPort: {
      type: Number,
      min: 0,
      max: 65535,
    },
    protocol: {
      type: String,
      enum: ['TCP', 'UDP', 'ICMP', 'HTTP', 'DNS', 'MQTT'],
      required: true,
    },
    attackType: {
      type: String,
      enum: [
        'Normal',
        'Backdoor',
        'DDoS',
        'DoS',
        'Injection',
        'MITM',
        'Password',
        'Ransomware',
        'Scanning',
        'XSS',
      ],
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low', 'Info'],
      required: true,
      index: true,
    },
    modelUsed: {
      type: String,
      trim: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    deviceId: {
      type: String,
      trim: true,
      index: true,
    },
    isAnomaly: {
      type: Boolean,
      default: false,
    },
    packetSize: {
      type: Number,
      min: 0,
    },
    flowDuration: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Compound indexes for optimal query performance
alertSchema.index({ timestamp: -1, attackType: 1 });
alertSchema.index({ timestamp: -1, severity: 1 });

const Alert = mongoose.model('Alert', alertSchema);

export default Alert;
