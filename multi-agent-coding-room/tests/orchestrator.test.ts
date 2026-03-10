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
  });
});
