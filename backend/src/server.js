import { createApp } from './app.js';
import { env } from './config/env.js';
import { pool } from './config/db.js';

const app = createApp();

async function start() {
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    console.error(`[db] Could not connect to MySQL at ${env.db.host}:${env.db.port}/${env.db.database}: ${err.message}`);
    console.error('[db] Check backend/.env and run "npm run db:setup" if this is a fresh install.');
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    console.log(`The National Mail API running at ${env.publicUrl} (${env.nodeEnv})`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close(() => pool.end().then(() => process.exit(0)));
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start();
