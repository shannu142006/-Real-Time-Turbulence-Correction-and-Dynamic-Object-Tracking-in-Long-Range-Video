import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

console.log('Starting server.js...');
import authRoutes from './routes/authRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import { protect } from './middleware/authMiddleware.js';
import Video from './models/Video.js';

dotenv.config();
console.log('Dotenv configured');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Set up static serving for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|mkv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/video', videoRoutes);

// File upload route
app.post('/api/upload', protect, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedFiles = [];
    const axios = (await import('axios')).default;

    for (const file of req.files) {
      // Create Database entry
      const videoDoc = await Video.create({
        user: req.user.id,
        originalFilename: file.filename,
        status: 'processing'
      });

      const fileData = {
        id: videoDoc._id,
        name: file.originalname,
        filename: file.filename,
        url: `/uploads/${file.filename}`,
        size: file.size,
        type: file.mimetype,
        uploadedAt: videoDoc.createdAt,
        status: 'processing'
      };

      // Call Python backend
      try {
        const analysisResponse = await axios.post('http://localhost:8000/analyze', {
          file_path: path.join(process.cwd(), 'uploads', file.filename),
          file_type: file.mimetype
        }, {
          timeout: 600000 // 10 minutes
        });

        videoDoc.metrics = {
          psnr: analysisResponse.data.psnr,
          ssim: analysisResponse.data.ssim
        };
        videoDoc.status = 'completed';
        videoDoc.processedVideoUrl = analysisResponse.data.processed_video_url || `/uploads/${file.filename}`;
        await videoDoc.save();

        fileData.analysis = analysisResponse.data;
        fileData.status = 'completed';
      } catch (err) {
        console.error('Analysis error for', file.filename, ':', err.message);
        videoDoc.status = 'failed';
        await videoDoc.save();
        fileData.status = 'failed';
      }

      uploadedFiles.push(fileData);
    }

    res.json({
      message: 'Files uploaded and processed successfully',
      files: uploadedFiles
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Socket.io for real-time tracking logs
io.on('connection', (socket) => {
  console.log('Client connected for real-time updates: ' + socket.id);
  
  // Smooth simulated tracking state
  let mockEntities = [
    { id: 'T-852', label: 'VEHICLE', x: 50, y: 100, dx: 2, dy: 1, w: 100, h: 80 },
    { id: 'H-124', label: 'PERSON', x: 300, y: 200, dx: -1, dy: 1.5, w: 40, h: 120 },
    { id: 'T-901', label: 'VEHICLE', x: 500, y: 50, dx: -2, dy: -0.5, w: 120, h: 90 }
  ];

  const trackInterval = setInterval(() => {
    // Update positions incrementally
    mockEntities = mockEntities.map(e => {
      let nx = e.x + e.dx;
      let ny = e.y + e.dy;
      
      // Bounce off boundaries for the demo
      let ndx = e.dx;
      let ndy = e.dy;
      if (nx < 0 || nx > 800) ndx = -e.dx;
      if (ny < 0 || ny > 500) ndy = -e.dy;

      return { ...e, x: nx, y: ny, dx: ndx, dy: ndy };
    });

    const mockData = {
      timestamp: Date.now(),
      entities: mockEntities.map(e => ({
        id: e.id,
        label: e.label,
        bbox: [e.x, e.y, e.w, e.h],
        confidence: 0.94 + Math.random() * 0.05
      })),
      systemStatus: {
        cpu: (15 + Math.random()*10).toFixed(1),
        memory: (42 + Math.random()*5).toFixed(1),
        gpu: (28 + Math.random()*12).toFixed(1)
      }
    };
    socket.emit('liveTracking', mockData);
  }, 100);

  socket.on('disconnect', () => {
    console.log('Client disconnected: ' + socket.id);
    clearInterval(trackInterval);
  });
});

// Create uploads directory if doesn't exist
if (!fs.existsSync(path.join(process.cwd(), 'uploads'))) {
  fs.mkdirSync(path.join(process.cwd(), 'uploads'));
}

// Global context to send info down to routes or use event emitter
app.set('io', io);

// Serve frontend in production
const distPath = path.join(process.cwd(), '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('MongoDB connected successfully');
})
.catch((err) => {
  console.error('MongoDB connection error:', err.message);
  console.log('Starting server in offline mode...');
});

const server = httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Set server timeout to 10 minutes (600,000ms) for long video processing
server.timeout = 600000;
server.keepAliveTimeout = 600000;
server.headersTimeout = 600000;
