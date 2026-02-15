import { createServer } from 'http';
import app from './app.js';

const port = process.env.PORT || 8080;
createServer(app).listen(port, () => {
  console.log(`[wellbeing-core] listening on :${port}`);
});
