import path from 'path';
import express from 'express';
import helmet from 'helmet';
import corsMiddleware from './middleware/corsConfig';
import errorHandler from './middleware/errorHandler';
import authRoutes from './routes/auth';
import dishRoutes from './routes/dishes';
import categoryRoutes from './routes/categories';
import tableRoutes from './routes/tables';
import orderRoutes from './routes/orders';
import ratingRoutes from './routes/ratings';
import settingsRoutes from './routes/settings';
import adminRoutes from './routes/admin';
import ratingController from './controllers/ratingController';

const app = express();

// Standard Security & Parser Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(corsMiddleware());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded dish images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Liveness Probe Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routing Registry
app.use('/auth', authRoutes);
app.use('/dishes', dishRoutes);
app.use('/categories', categoryRoutes);
app.use('/tables', tableRoutes);
app.use('/orders', orderRoutes);
app.use('/ratings', ratingRoutes);
app.use('/settings', settingsRoutes);
app.use('/admin', adminRoutes);

// Helper route to map standard REST pattern for ratings on specific items
app.get('/dishes/:id/ratings', ratingController.getDishRatings);

// Dedicated route map to align upload-image to upload/dish-image spec
app.use('/upload/dish-image', dishRoutes);

// Catch-all route handler for undefined paths
app.use((req, res, next) => {
  res.status(404).json({
    status: 'fail',
    code: 404,
    error: 'NotFoundError',
    message: `Path '${req.originalUrl}' does not exist on this server`,
  });
});

// Global Centralized Error Catch Middleware
app.use(errorHandler);

export default app;
