import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');

try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`Created data directory at ${dataDir}`);
  }
} catch (err) {
  console.error(`Warning: Could not create data directory at ${dataDir}. Error:`, err);
  // Fallback to /tmp if allowed (ephemeral but better than crashing)
  // Or just let it try to open the DB and fail there with a clearer error
}

const dbPath = path.join(dataDir, 'sit-erp-demo.sqlite');

export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Provide an easy way to export it
export default db;
