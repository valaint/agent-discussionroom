import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MockProvider } from '../src/server/providers/mock/mock-provider.js';
import { AgentRegistration, RoomMessage } from '../src/shared/schemas.js';
import { parseProtocolMessage } from '../src/shared/protocol.js';

describe('MockProvider', () => {
  const baseConfig: AgentRegistration = {
    id: 'agent-123',
    displayName: 'Test Agent',
    providerType: 'mock',
    specialization: 'chat',
    executionMode: 'auto',
    enabled: true,
  };

  const baseMessage: RoomMessage = {
    id: 'msg-123',
    roomId: 'room-123',
    timestamp: Date.now(),
    from: 'user-1',
    to: 'agent-123',
    type: 'CHAT',
    subject: 'Test Subject',
    body: 'Test body message',
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should respond with CHAT type and alternative ideas for general specialization', async () => {
    const provider = new MockProvider(baseConfig);
    const promise = provider.invoke([], baseMessage);

    // Fast-forward past the random delay
    vi.runAllTimers();

    const response = await promise;
    const parsed = parseProtocolMessage(response);

    expect(parsed).not.toBeNull();
    expect(parsed?.type).toBe('CHAT');
    expect(parsed?.subject).toBe('Re: Test Subject');
    expect(parsed?.request).toContain('alternative ideas');
    expect(parsed?.context).toBe('I am a mock chat agent.');
  });

  it('should respond with IMPLEMENTATION type for "implement" specialization', async () => {
    const config = { ...baseConfig, specialization: 'frontend implementer' };
    const provider = new MockProvider(config);
    const promise = provider.invoke([], baseMessage);

    vi.runAllTimers();

    const response = await promise;
    const parsed = parseProtocolMessage(response);

    expect(parsed).not.toBeNull();
    expect(parsed?.type).toBe('IMPLEMENTATION');
    expect(parsed?.request).toContain('Here is the mock implementation');
    expect(parsed?.request).toContain(baseMessage.body.substring(0, 20));
  });

  it('should respond with REVIEW type for "review" specialization', async () => {
    const config = { ...baseConfig, specialization: 'code reviewer' };
    const provider = new MockProvider(config);
    const promise = provider.invoke([], baseMessage);

    vi.runAllTimers();

    const response = await promise;
    const parsed = parseProtocolMessage(response);

    expect(parsed).not.toBeNull();
    expect(parsed?.type).toBe('REVIEW');
    expect(parsed?.request).toContain('I have reviewed the code');
  });

  it('should fallback to "Message" if currentMessage has no subject', async () => {
    const messageWithoutSubject = { ...baseMessage, subject: undefined };
    const provider = new MockProvider(baseConfig);
    const promise = provider.invoke([], messageWithoutSubject);

    vi.runAllTimers();

    const response = await promise;
    const parsed = parseProtocolMessage(response);

    expect(parsed?.subject).toBe('Re: Message');
  });

  it('should simulate a delay between 1000 and 3000 ms', async () => {
    const provider = new MockProvider(baseConfig);

    // Spy on setTimeout
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

    // We don't await yet so we can check the timer setup
    const promise = provider.invoke([], baseMessage);

    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
    const delay = setTimeoutSpy.mock.calls[0][1] as number;

    expect(delay).toBeGreaterThanOrEqual(1000);
    expect(delay).toBeLessThan(3000); // 1000 + Math.random() * 2000 => [1000, 3000)

    // Cleanup
    vi.runAllTimers();
    await promise;
  });
});
