import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  originalFilename: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  processedVideoUrl: {
    type: String,
  },
  metrics: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  trackingLogs: [{
    frame: Number,
    fps: Number,
    trackingData: Array,
  }]
}, { timestamps: true });

export default mongoose.model('Video', videoSchema);
