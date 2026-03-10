import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Server } from 'socket.io';
import { Orchestrator } from '../src/server/router/orchestrator.js';
import { AgentRegistration } from '../src/shared/schemas.js';
import { MockProvider } from '../src/server/providers/mock/mock-provider.js';

// Mock the database to prevent errors during Orchestrator initialization
vi.mock('../src/server/store/db.js', () => ({
  db: {
    prepare: vi.fn(() => ({
      all: vi.fn(() => []),
    })),
  },
}));

// Mock the MockProvider so we can track its instantiation
vi.mock('../src/server/providers/mock/mock-provider.js', () => ({
  MockProvider: vi.fn(),
}));

describe('Orchestrator.registerAgent', () => {
  let orchestrator: Orchestrator;
  let mockIo: Server;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIo = new Server();
    orchestrator = new Orchestrator(mockIo);
  });

  it('should store a mock agent in the map and initialize a MockProvider', () => {
    const mockAgent: AgentRegistration = {
      id: 'agent-123',
      displayName: 'Test Mock Agent',
      providerType: 'mock',
      specialization: 'testing',
      executionMode: 'auto',
      enabled: true,
    };

    orchestrator.registerAgent(mockAgent);

    // Verify agent is stored in the map
    const agents = orchestrator.getAgents();
    expect(agents).toHaveLength(1);
    expect(agents[0]).toEqual(mockAgent);

    // Verify MockProvider was initialized
    expect(MockProvider).toHaveBeenCalledWith(mockAgent);

    // Check private activeProviders map using any
    const activeProviders = (orchestrator as any).activeProviders;
    expect(activeProviders.get('agent-123')).toBeDefined();
  });

  it('should store a non-mock agent without initializing a MockProvider', () => {
    const nonMockAgent: AgentRegistration = {
      id: 'agent-456',
      displayName: 'Test Codex Agent',
      providerType: 'codex',
      specialization: 'coding',
      executionMode: 'manual',
      enabled: true,
    };

    orchestrator.registerAgent(nonMockAgent);

    // Verify agent is stored in the map
    const agents = orchestrator.getAgents();
    expect(agents).toHaveLength(1);
    expect(agents[0]).toEqual(nonMockAgent);

    // Verify MockProvider was NOT initialized
    expect(MockProvider).not.toHaveBeenCalled();

    // Check private activeProviders map using any
    const activeProviders = (orchestrator as any).activeProviders;
    expect(activeProviders.get('agent-456')).toBeUndefined();
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
