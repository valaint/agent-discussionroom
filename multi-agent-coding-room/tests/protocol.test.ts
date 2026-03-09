import { describe, it, expect } from 'vitest';
import { parseProtocolMessage, formatProtocolMessage } from '../src/shared/protocol.js';

describe('Protocol Parser', () => {
  it('should parse a valid protocol message', () => {
    const rawMsg = `
Some random preceding text
=== ROOM MESSAGE START ===
FROM: codex-agent
TO: claude-agent
TYPE: REVIEW
SUBJECT: Check this PR
CONTEXT:
Here is some context.
It spans multiple lines.
REQUEST:
Please review my changes.
EXPECTED OUTPUT:
List of bugs.
PRIORITY: HIGH
=== ROOM MESSAGE END ===
Trailing text.
`;

    const parsed = parseProtocolMessage(rawMsg);

    expect(parsed).not.toBeNull();
    expect(parsed?.from).toBe('codex-agent');
    expect(parsed?.to).toBe('claude-agent');
    expect(parsed?.type).toBe('REVIEW');
    expect(parsed?.subject).toBe('Check this PR');
    expect(parsed?.context).toBe('Here is some context.\nIt spans multiple lines.');
    expect(parsed?.request).toBe('Please review my changes.');
    expect(parsed?.expectedOutput).toBe('List of bugs.');
    expect(parsed?.priority).toBe('HIGH');
  });

  it('should parse minimal protocol message', () => {
    const rawMsg = `=== ROOM MESSAGE START ===
FROM: agent-1
TO: agent-2
TYPE: CHAT
=== ROOM MESSAGE END ===`;

    const parsed = parseProtocolMessage(rawMsg);

    expect(parsed).not.toBeNull();
    expect(parsed?.from).toBe('agent-1');
    expect(parsed?.to).toBe('agent-2');
    expect(parsed?.type).toBe('CHAT');
    expect(parsed?.subject).toBeUndefined();
    expect(parsed?.context).toBeUndefined();
  });

  it('should return null for malformed message', () => {
    const rawMsg = `Missing start marker
FROM: agent
=== ROOM MESSAGE END ===`;

    const parsed = parseProtocolMessage(rawMsg);
    expect(parsed).toBeNull();
  });

  it('should format a protocol message correctly', () => {
    const msg = {
      from: 'agent-1',
      to: 'agent-2',
      type: 'IMPLEMENTATION' as any,
      subject: 'New Feature',
      context: 'Adding auth',
      request: 'Write token verification logic',
    };

    const formatted = formatProtocolMessage(msg);

    expect(formatted).toContain('=== ROOM MESSAGE START ===');
    expect(formatted).toContain('FROM: agent-1');
    expect(formatted).toContain('TO: agent-2');
    expect(formatted).toContain('TYPE: IMPLEMENTATION');
    expect(formatted).toContain('SUBJECT: New Feature');
    expect(formatted).toContain('CONTEXT:\nAdding auth');
    expect(formatted).toContain('REQUEST:\nWrite token verification logic');
    expect(formatted).toContain('=== ROOM MESSAGE END ===');
  });
});
