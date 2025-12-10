import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;

export async function initDb() {
  db = await open({
    filename: path.join(__dirname, 'homework.db'),
    driver: sqlite3.Database
  });

  await db.exec('PRAGMA foreign_keys = ON');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      line_user_id TEXT UNIQUE,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS homework (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      task_name TEXT NOT NULL,
      received_date TEXT,
      due_date TEXT NOT NULL,
      difficulty TEXT DEFAULT 'medium',
      importance TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'incomplete',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      homework_id INTEGER NOT NULL,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(homework_id) REFERENCES homework(id)
    );

    CREATE INDEX IF NOT EXISTS idx_homework_user_id ON homework(user_id);
    CREATE INDEX IF NOT EXISTS idx_homework_due_date ON homework(due_date);
    CREATE INDEX IF NOT EXISTS idx_homework_status ON homework(status);
  `);

  return db;
}

export function getDb() {
  return db;
}
