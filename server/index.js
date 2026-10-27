import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import alertRoutes from './routes/alerts.js';
import deviceRoutes from './routes/devices.js';
import modelRoutes from './routes/models.js';
import authRoutes from './routes/auth.js';
import trafficRoutes, { setTrafficIO } from './routes/traffic.js';
import { startSimulator } from './simulator.js';
import { trafficMiddleware, startTrafficMonitor } from './trafficMonitor.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Traffic monitoring middleware (tracks request rate and latency)
app.use(trafficMiddleware);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/traffic', trafficRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/models', modelRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'IoT/IIoT Intrusion Detection System API Server',
    status: 'online',
    version: '1.2.0',
    health: '/api/health',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        me: 'GET /api/auth/me'
      },
      traffic: {
        status: 'GET /api/traffic/status',
        simulate: 'POST /api/traffic/simulate'
      },
      stats: '/api/alerts/stats',
      timeline: '/api/alerts/timeline',
      distribution: '/api/alerts/distribution',
      alerts: '/api/alerts',
      devices: '/api/devices',
      models: '/api/models'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for unknown API routes
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5001;

httpServer.listen(PORT, () => {
  console.log(`IDS Dashboard Server running on port ${PORT}`);
  console.log(`In-memory database initialized (zero external database dependency).`);
  setTrafficIO(io);
  startSimulator(io);
  startTrafficMonitor(io);
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
