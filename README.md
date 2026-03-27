# Real-Time Turbulence Correction and Dynamic Object Tracking in Long-Range Video

This project provides a professional dashboard for enhancing long-range video streams by correcting atmospheric turbulence and tracking moving objects in real-time.

## 🔷 Features
- **Clean UI**: Modern dark-themed dashboard with glassmorphism effects.
- **Side-by-Side Comparison**: View original vs. turbulence-corrected video streams.
- **Dynamic Tracking**: Real-time object detection and tracking using YOLO-inspired logic.
- **Analytics**: Real-time telemetry for processing latency, detection accuracy, and turbulence severity.
- **Full-Stack**: React.js frontend, Node.js/Express backend, and Python/FastAPI CV service.

## 🔷 Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Lucide-react, Chart.js, Socket.io-client.
- **Backend (Node)**: Express, Mongoose, JWT, Multer, Socket.io.
- **ML/CV Service**: Python, FastAPI, OpenCV, NumPy.
- **Database**: MongoDB.

## 🔷 Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- Python (3.9+)
- MongoDB (Running locally or on Atlas)

### 2. Backend Setup (Node.js)
```bash
cd backend
npm install
# Create .env file with your MONGO_URI and JWT_SECRET
npm run dev
```

### 3. CV Service Setup (Python)
```bash
cd python-backend
pip install -r requirements.txt
python main.py
```

### 4. Frontend Setup (React)
```bash
cd frontend
npm install
npm run dev
```

## 🔷 Project Structure
```text
├── backend/            # Express REST API & WebSockets
├── frontend/           # React Dashboard UI
└── python-backend/     # Computer Vision & ML Processing
```

## 🔷 API Endpoints
- `POST /api/auth/register` - User Signup
- `POST /api/auth/login` - User Login
- `POST /api/video` - Upload & Process Video
- `GET /api/video` - Get Processing History

---
Developed as a high-performance vision enhancement platform.
