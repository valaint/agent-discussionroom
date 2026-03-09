import { db } from './db.js';
import { Room } from '../../shared/schemas.js';

export const roomStore = {
  createRoom(room: Room) {
    db.transaction(() => {
      db.prepare(`INSERT INTO rooms (id, title, description, createdAt) VALUES (?, ?, ?, ?)`).run(room.id, room.title, room.description, room.createdAt);
      const stmt = db.prepare(`INSERT INTO room_agents (roomId, agentId) VALUES (?, ?)`);
      for (const agentId of room.activeAgents) {
        stmt.run(room.id, agentId);
      }
    })();
  },

  getRooms(): Room[] {
    const rows = db.prepare(`SELECT * FROM rooms`).all() as any[];
    return rows.map(r => ({
      ...r,
      activeAgents: db.prepare(`SELECT agentId FROM room_agents WHERE roomId = ?`).all(r.id).map((a: any) => a.agentId)
    }));
  },

  getRoom(roomId: string): Room | undefined {
    const room = db.prepare(`SELECT * FROM rooms WHERE id = ?`).get(roomId) as any;
    if (!room) return undefined;
    return {
      ...room,
      activeAgents: db.prepare(`SELECT agentId FROM room_agents WHERE roomId = ?`).all(roomId).map((a: any) => a.agentId)
    };
  }
};
