import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { roomStore } from '../src/server/store/room-store.js';
import { db } from '../src/server/store/db.js';
import { Room } from '../src/shared/schemas.js';

describe('Room Store', () => {
  beforeEach(() => {
    // Clean up database tables before each test
    // Need to temporarily disable foreign key checks or delete in proper order, but we already delete in proper order (room_agents then rooms).
    // The issue is messages might have a FK to rooms. Let's delete from messages too.
    db.exec(`
      DELETE FROM messages;
      DELETE FROM room_agents;
      DELETE FROM rooms;
      DELETE FROM agents;
    `);
  });

  afterEach(() => {
    // Final cleanup
    db.exec(`
      DELETE FROM messages;
      DELETE FROM room_agents;
      DELETE FROM rooms;
      DELETE FROM agents;
    `);
  });

  describe('getRoom', () => {
    it('should return undefined if the room does not exist', () => {
      const result = roomStore.getRoom('non-existent-id');
      expect(result).toBeUndefined();
    });

    it('should return the room if it exists', () => {
      const newRoom: Room = {
        id: 'test-room-id-1',
        title: 'Test Room',
        description: 'A test room',
        createdAt: Date.now(),
        activeAgents: ['agent-1', 'agent-2'],
      };

      db.exec(`
        INSERT OR IGNORE INTO agents (id, displayName, providerType, specialization, executionMode, enabled)
        VALUES ('agent-1', 'Agent 1', 'mock', 'Testing', 'auto', 1);
        INSERT OR IGNORE INTO agents (id, displayName, providerType, specialization, executionMode, enabled)
        VALUES ('agent-2', 'Agent 2', 'mock', 'Testing', 'auto', 1);
      `);

      roomStore.createRoom(newRoom);

      const result = roomStore.getRoom(newRoom.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(newRoom.id);
      expect(result?.title).toBe(newRoom.title);
      expect(result?.description).toBe(newRoom.description);
      expect(result?.createdAt).toBe(newRoom.createdAt);
      expect(result?.activeAgents).toEqual(expect.arrayContaining(['agent-1', 'agent-2']));
      expect(result?.activeAgents.length).toBe(2);
    });

    it('should return the room with an empty activeAgents array if there are none', () => {
      const newRoom: Room = {
        id: 'test-room-id-2',
        title: 'Empty Agents Room',
        description: 'No agents here',
        createdAt: Date.now(),
        activeAgents: [],
      };

      roomStore.createRoom(newRoom);

      const result = roomStore.getRoom(newRoom.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(newRoom.id);
      expect(result?.activeAgents).toEqual([]);
    });
  });
});
