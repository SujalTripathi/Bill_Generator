import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler.middleware.js';

import authRoutes from './routes/auth.routes.js';
import businessRoutes from './routes/business.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import customerRoutes from './routes/customer.routes.js';
import templateRoutes from './routes/template.routes.js';

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://bill-generator-347e.onrender.com',
    process.env.CLIENT_URL
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/templates', templateRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
