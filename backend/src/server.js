import { createServer } from 'http';
import mongoose from 'mongoose';
import app from './app.js';

const port = process.env.PORT || 8080;
const server = createServer(app);

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/capstone_project';

mongoose.connect(MONGO_URI)
  .then(() => console.log('[database] connected to mongodb'))
  .catch(err => console.error('[database] connection error:', err));

server.listen(port, () => {
  console.log(`[wellbeing-core] listening on :${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log('Interrupted');
    process.exit(0);
  });
});
