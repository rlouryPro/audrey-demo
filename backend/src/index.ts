import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from './api/middlewares/error.middleware';

// Import routes
import authRoutes from './api/routes/auth.routes';
import eventsRoutes from './api/routes/events.routes';
import domainsRoutes from './api/routes/domains.routes';
import mySkillsRoutes from './api/routes/mySkills.routes';
import usersRoutes from './api/routes/users.routes';
import validationsRoutes from './api/routes/validations.routes';
import documentsRoutes from './api/routes/documents.routes';
import { authMiddleware } from './api/middlewares/auth.middleware';
import { adminMiddleware } from './api/middlewares/admin.middleware';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Parsing middleware
app.use(express.json());
app.use(cookieParser());

// Static files (uploads)
app.use('/uploads', express.static(process.env.UPLOAD_PATH || './uploads'));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, usersRoutes);
app.use('/api/events', authMiddleware, eventsRoutes);
app.use('/api/domains', authMiddleware, domainsRoutes);
app.use('/api/my-skills', authMiddleware, mySkillsRoutes);
app.use('/api/validations', authMiddleware, adminMiddleware, validationsRoutes);
app.use('/api/documents', authMiddleware, documentsRoutes);

// Error handler (always last)
app.use(errorMiddleware);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});

export { app };
