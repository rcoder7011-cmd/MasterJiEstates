import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { corsOptions } from './config/corsOptions.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import enquiryRoutes from './routes/enquiryRoutes.js';
import siteVisitRoutes from './routes/siteVisitRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import adminContentRoutes from './routes/adminContentRoutes.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables reliably from server/.env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const app = express();

// Security Headers
app.use(helmet());

// Cross-Origin Resource Sharing with Credentials
app.use(cors(corsOptions));

// Cookie Parsing Middleware
app.use(cookieParser());

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Service Index
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MasterJiEstates API Service is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      ready: '/api/health/ready',
      auth: '/api/auth',
      properties: '/api/properties',
      enquiries: '/api/enquiries',
      siteVisits: '/api/site-visits',
      dashboard: '/api/dashboard',
      admin: '/api/admin',
      business: '/api/admin/business',
      content: '/api/content',
    },
  });
});

// Mount API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/site-visits', siteVisitRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/business', businessRoutes);
app.use('/api/admin/content', adminContentRoutes);
app.use('/api/content', contentRoutes);

// 404 Catch-All Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

export default app;
