import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { runSupabaseMigration } from './database/supabaseMigrate.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure Supabase tables and catalog are ready
runSupabaseMigration().catch(err => console.error('Supabase auto-init error:', err));

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['*']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder
const uploadDir = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadDir));

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Welcome to Dkart Backend API',
    brand: 'Dkart Store',
    domain: 'dkart.pk',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      categories: '/api/categories'
    }
  });
});

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    brand: 'Dkart Store',
    domain: 'dkart.pk',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Dkart Backend Server is running on http://localhost:${PORT}`);
  console.log(`📦 Brand: Dkart (dkart.pk) | Target Market: Pakistan`);
});
