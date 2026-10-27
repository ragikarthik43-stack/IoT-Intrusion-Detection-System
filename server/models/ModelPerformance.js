import mongoose from 'mongoose';

const modelPerformanceSchema = new mongoose.Schema(
  {
    modelName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    accuracy: {
      type: Number,
      min: 0,
      max: 1,
    },
    precision: {
      type: Number,
      min: 0,
      max: 1,
    },
    recall: {
      type: Number,
      min: 0,
      max: 1,
    },
    f1Score: {
      type: Number,
      min: 0,
      max: 1,
    },
    flashSizeKB: {
      type: Number,
      min: 0,
    },
    sramKB: {
      type: Number,
      min: 0,
    },
    inferenceTimeUs: {
      type: Number,
      min: 0,
    },
    quantisationType: {
      type: String,
      enum: ['Float32', 'INT8', 'C-Export', 'Custom-INT8'],
      required: true,
    },
    compressionRatio: {
      type: Number,
      min: 0,
    },
    targetDevice: {
      type: String,
      trim: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Compound index for querying model by device and quantisation
modelPerformanceSchema.index({ modelName: 1, quantisationType: 1, targetDevice: 1 });

const ModelPerformance = mongoose.model('ModelPerformance', modelPerformanceSchema);

export default ModelPerformance;
