import express from 'express';
import { tracer } from './config/datadog';
import requestLogger from './middleware/requestLogger';
import rateLimiter from './middleware/rateLimiter';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import { applyPerformanceOptimizations } from './config/performanceOptimization';
import v1Router from './routes/v1';
import v2Router from './routes/v2';
import { versionCheck } from './middleware/versionCheck';

const app = express();

// Apply DataDog tracing to Express
tracer.use('express');

// ... (existing middleware setup)

// API versioning
app.use('/api', versionCheck);
app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);

// ... (rest of your app setup)

export default app;