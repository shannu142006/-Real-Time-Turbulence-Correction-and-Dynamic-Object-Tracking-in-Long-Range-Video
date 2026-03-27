import Video from '../models/Video.js';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';

export const uploadVideo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const video = await Video.create({
      user: req.user.id,
      originalFilename: req.file.filename,
      status: 'pending',
    });

    res.status(201).json(video);

    // After responding, we can trigger the python backend process
    triggerPythonProcessing(video._id, req.file.path, req.app.get('io'));

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const triggerPythonProcessing = async (videoId, filepath, io) => {
  try {
    const video = await Video.findById(videoId);
    video.status = 'processing';
    await video.save();

    console.log(`Sending video ${videoId} to python service for processing`);
    io.emit('videoStatus', { videoId, status: 'processing' });
    
    // Call python backend using JSON /analyze (shared filesystem)
    const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:8000';
    
    const response = await axios.post(`${pythonApiUrl}/analyze`, {
      file_path: path.resolve(filepath),
      file_type: 'video/mp4' // Generic video type
    }, {
      timeout: 600000 // 10 minutes
    });

    console.log('Python Service Response:', response.data);

    // Mark as completed
    console.log('Finalizing video result for', videoId);
    video.status = 'completed';
    
    video.metrics = {
      ...response.data.metrics,
      objects_detected: response.data.detections ? response.data.detections.length : 0,
      corrected_frame: response.data.corrected_frame
    };
    
    // Save detections safely
    if (response.data.detections) {
      video.trackingLogs = [{
        frame: 0,
        fps: 24,
        trackingData: response.data.detections.map(d => ({
          id: d.id,
          label: d.label,
          confidence: d.confidence,
          bbox: d.bbox
        }))
      }];
    }
    
    video.processedVideoUrl = response.data.processed_video_url || `/uploads/${path.basename(filepath)}`;
    await video.save();
    console.log('Video saved successfully:', videoId);

    io.emit('videoStatus', { 
      videoId, 
      status: 'completed', 
      metrics: video.metrics, 
      url: video.processedVideoUrl,
      trackingLogs: video.trackingLogs
    });

  } catch (error) {
    console.error('Error during video processing:', error.message);
    if (error.response) console.error('Python Error Response:', error.response.data);
    
    const video = await Video.findById(videoId);
    if(video) {
      video.status = 'failed';
      await video.save();
      io.emit('videoStatus', { videoId, status: 'failed' });
    }
  }
};

export const getVideos = async (req, res) => {
  try {
    const videos = await Video.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getVideoStatus = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (video) {
      res.json(video);
    } else {
      res.status(404).json({ message: 'Video not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Delete file from disk if it exists
    const filePath = path.join(process.cwd(), 'uploads', video.originalFilename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Video.deleteOne({ _id: video._id });
    res.json({ message: 'Video removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
