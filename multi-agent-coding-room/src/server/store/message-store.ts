import { db } from './db.js';
import { RoomMessage } from '../../shared/schemas.js';

export const messageStore = {
  saveMessage(msg: RoomMessage) {
    const stmt = db.prepare(`
      INSERT INTO messages (id, roomId, sessionId, timestamp, sender, recipient, type, subject, body, correlationId, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(msg.id, msg.roomId, msg.sessionId || null, msg.timestamp, msg.from, msg.to || null, msg.type, msg.subject || null, msg.body, msg.correlationId || null, msg.priority || null);
  },

  getMessagesByRoom(roomId: string): RoomMessage[] {
    const stmt = db.prepare(`SELECT * FROM messages WHERE roomId = ? ORDER BY timestamp ASC`);
    const rows = stmt.all(roomId) as any[];
    return rows.map(row => ({
      ...row,
      from: row.sender,
      to: row.recipient,
    }));
  }
};
