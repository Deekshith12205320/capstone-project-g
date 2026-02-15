import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const dbPath = path.join(__dirname, '../../chats.db');
const db = new Database('chats.db');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_crisis BOOLEAN DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    score INTEGER,
    severity TEXT,
    answers TEXT,
    insight TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_profile (
    id INTEGER PRIMARY KEY,
    name TEXT DEFAULT 'User',
    email TEXT DEFAULT 'user@example.com',
    location TEXT,
    bio TEXT,
    role TEXT,
    hobbies TEXT,
    likes TEXT,
    dislikes TEXT,
    contact_name TEXT,
    contact_phone TEXT
  );

  INSERT OR IGNORE INTO user_profile (id, name, bio) VALUES (1, 'User', 'Taking it one day at a time. 🌱');
`);

console.log('[DB] Chat history database initialized at', dbPath);

export default db;
