import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import crypto from 'crypto';
import './db/database.js'; // Initialize DB

import chatRouter from './routes/chat.js';
import suggestionsRouter from './routes/suggestions.js';
import profileRouter from './routes/profile.js';

const app = express();

// minimal privacy-first logging (no request bodies)
app.use(morgan('tiny', { skip: () => process.env.NODE_ENV === 'test' }));
app.use(cors());
app.use(express.json({ limit: '200kb' }));

// attach request context (no sensitive data)
app.use((req, _res, next) => {
  req.context = {
    requestId: crypto.randomUUID?.() ?? String(Date.now())
  };
  next();
});

// health check
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// routes
app.use('/chat', chatRouter);
app.use('/suggestions', suggestionsRouter);
app.use('/profile', profileRouter);

// global error handler (redacted response)
app.use((err, _req, res, _next) => {
  console.error('[error]', err?.message);
  res.status(err?.status || 500).json({ error: 'internal_error' });
});

export default app;
