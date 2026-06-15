import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const isVercel = Boolean(process.env.VERCEL);
const dataDir = isVercel
  ? path.join('/tmp', 'sit-erp-prototype')
  : path.join(process.cwd(), 'data');

try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
} catch (err) {
  console.error(`Could not create SQLite directory at ${dataDir}.`, err);
  throw err;
}

const dbPath = path.join(dataDir, 'sit-erp-demo.sqlite');

export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');
db.pragma(isVercel ? 'journal_mode = DELETE' : 'journal_mode = WAL');

// Provide an easy way to export it
export default db;
