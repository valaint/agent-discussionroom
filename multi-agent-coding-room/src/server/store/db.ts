import Database from 'better-sqlite3';
import path from 'path';

export const db = new Database('room.db');

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    createdAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    displayName TEXT NOT NULL,
    providerType TEXT NOT NULL,
    systemPrompt TEXT,
    specialization TEXT NOT NULL,
    temperature REAL,
    modelName TEXT,
    executionMode TEXT NOT NULL,
    enabled INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS room_agents (
    roomId TEXT NOT NULL,
    agentId TEXT NOT NULL,
    FOREIGN KEY (roomId) REFERENCES rooms (id),
    FOREIGN KEY (agentId) REFERENCES agents (id),
    PRIMARY KEY (roomId, agentId)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    roomId TEXT NOT NULL,
    sessionId TEXT,
    timestamp INTEGER NOT NULL,
    sender TEXT NOT NULL,
    recipient TEXT,
    type TEXT NOT NULL,
    subject TEXT,
    body TEXT NOT NULL,
    correlationId TEXT,
    priority TEXT,
    FOREIGN KEY (roomId) REFERENCES rooms (id)
  );
`);
