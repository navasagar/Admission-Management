import 'dotenv/config';
import express, { Express } from 'express';
import cors from 'cors';
import { testConnection, initializeDatabase } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import institutionRoutes from './routes/institution';
import campusRoutes from './routes/campus';
import departmentRoutes from './routes/department';
import academicYearRoutes from './routes/academicYear';
import programRoutes from './routes/program';
import quotaRoutes from './routes/quota';
import applicantRoutes from './routes/applicant';
import seatAllocationRoutes from './routes/seatAllocation';
import documentRoutes from './routes/document';
import dashboardRoutes from './routes/dashboard';

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/campuses', campusRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/academic-years', academicYearRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/quotas', quotaRoutes);
app.use('/api/applicants', applicantRoutes);
app.use('/api/seat-allocations', seatAllocationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize and start server
async function startServer() {
  try {
    // Test database connection
    await testConnection();
    console.log('Database connection verified');

    // Initialize database tables
    await initializeDatabase();
    console.log('Database initialized');

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ API available at http://localhost:${PORT}/api`);
      console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
