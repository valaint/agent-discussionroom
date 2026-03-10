import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Orchestrator } from '../src/server/router/orchestrator.js';

// Mock the db dependency to avoid reading/writing the actual database
vi.mock('../src/server/store/db.js', () => ({
  db: {
    prepare: vi.fn().mockReturnValue({
      all: vi.fn().mockReturnValue([])
    })
  }
}));

describe('Orchestrator', () => {
  let orchestrator: Orchestrator;
  let mockIo: any;

  beforeEach(() => {
    // Provide a mocked socket.io Server instance
    mockIo = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn()
    };
    orchestrator = new Orchestrator(mockIo);
  });

  describe('getAgents', () => {
    it('should return an empty array when no agents are registered initially', () => {
      const agents = orchestrator.getAgents();
      expect(agents).toEqual([]);
    });

    it('should return all registered agents', () => {
      const mockAgent1 = {
        id: 'agent-1',
        displayName: 'Agent 1',
        providerType: 'mock',
        specialization: 'testing',
        executionMode: 'auto',
        enabled: true
      };
      const mockAgent2 = {
        id: 'agent-2',
        displayName: 'Agent 2',
        providerType: 'mock',
        specialization: 'dev',
        executionMode: 'auto',
        enabled: true
      };

      // Register agents
      orchestrator.registerAgent(mockAgent1 as any);
      orchestrator.registerAgent(mockAgent2 as any);

      // Call getAgents
      const agents = orchestrator.getAgents();

      // Verify the returned array
      expect(agents).toHaveLength(2);
      expect(agents).toContainEqual(mockAgent1);
      expect(agents).toContainEqual(mockAgent2);
    });
  });
});
