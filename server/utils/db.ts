import Database from 'better-sqlite3'
import { join } from 'path'

const db = new Database(join(process.cwd(), 'crypto-tracker.db'))

// Проверяем существование колонки parent_trade_id
const columns = db.prepare("PRAGMA table_info(trades)").all() as any[]
const hasParentTradeId = columns.some(col => col.name === 'parent_trade_id')

if (!hasParentTradeId) {
  db.exec(`ALTER TABLE trades ADD COLUMN parent_trade_id INTEGER`)
}

// Инициализация таблиц
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    symbol TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('buy', 'sell')),
    price REAL NOT NULL,
    quantity REAL NOT NULL,
    date DATETIME NOT NULL,
    parent_trade_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (parent_trade_id) REFERENCES trades(id)
  );
`)

export { db }