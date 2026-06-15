import express from 'express';
import db from './database/connection.js';
import { createSchema } from './database/schema.js';
import { seed } from './database/seed.js';
import { setupApiRoutes } from './routes/index.js';

let databaseReady = false;

function setupDatabase() {
  if (databaseReady) return;

  const table = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'users'")
    .get();

  if (!table) {
    createSchema();
    seed();
  }

  databaseReady = true;
}

setupDatabase();

const app = express();

app.use(express.json({ limit: '2mb' }));
setupApiRoutes(app);

app.get('/api/health', (_request, response) => {
  response.json({
    status: 'ok',
    database: process.env.VERCEL ? 'ephemeral-sqlite' : 'local-sqlite',
  });
});

export default app;
