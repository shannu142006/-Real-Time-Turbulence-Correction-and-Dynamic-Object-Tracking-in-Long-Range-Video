import multer from 'multer';
import express from 'express'; // Router setup
import { protect } from '../middleware/authMiddleware.js';
import { uploadVideo, getVideos, getVideoStatus, deleteVideo } from '../controllers/videoController.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.route('/')
  .post(protect, upload.single('video'), uploadVideo)
  .get(protect, getVideos);

router.route('/:id')
  .get(protect, getVideoStatus)
  .delete(protect, deleteVideo);

export default router;
