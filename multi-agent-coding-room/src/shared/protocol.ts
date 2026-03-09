import { RoomMessageTypeSchema, RoomMessageType } from './schemas.js';

/**
 * Parses a raw text block into a structured payload if it matches the protocol format.
 * Format:
 * === ROOM MESSAGE START ===
 * FROM: <sender>
 * TO: <recipient>
 * TYPE: <type>
 * SUBJECT: <subject>
 * CONTEXT:
 * <context...>
 * REQUEST:
 * <request...>
 * EXPECTED OUTPUT:
 * <expected output...>
 * PRIORITY: <priority>
 * === ROOM MESSAGE END ===
 */

export interface ParsedProtocolMessage {
  from?: string;
  to?: string;
  type?: RoomMessageType;
  subject?: string;
  context?: string;
  request?: string;
  expectedOutput?: string;
  priority?: string;
  raw: string;
}

export function parseProtocolMessage(text: string): ParsedProtocolMessage | null {
  const startMarker = '=== ROOM MESSAGE START ===';
  const endMarker = '=== ROOM MESSAGE END ===';

  const startIndex = text.indexOf(startMarker);
  const endIndex = text.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
    return null;
  }

  const block = text.substring(startIndex + startMarker.length, endIndex).trim();
  const parsed: ParsedProtocolMessage = { raw: text };

  const lines = block.split('\n');
  let currentSection: 'CONTEXT' | 'REQUEST' | 'EXPECTED OUTPUT' | null = null;

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('FROM:')) {
      parsed.from = trimmed.substring(5).trim();
      currentSection = null;
    } else if (trimmed.startsWith('TO:')) {
      parsed.to = trimmed.substring(3).trim();
      currentSection = null;
    } else if (trimmed.startsWith('TYPE:')) {
      const typeStr = trimmed.substring(5).trim();
      const res = RoomMessageTypeSchema.safeParse(typeStr);
      if (res.success) parsed.type = res.data;
      currentSection = null;
    } else if (trimmed.startsWith('SUBJECT:')) {
      parsed.subject = trimmed.substring(8).trim();
      currentSection = null;
    } else if (trimmed.startsWith('PRIORITY:')) {
      parsed.priority = trimmed.substring(9).trim();
      currentSection = null;
    } else if (trimmed.startsWith('CONTEXT:')) {
      currentSection = 'CONTEXT';
      parsed.context = '';
    } else if (trimmed.startsWith('REQUEST:')) {
      currentSection = 'REQUEST';
      parsed.request = '';
    } else if (trimmed.startsWith('EXPECTED OUTPUT:')) {
      currentSection = 'EXPECTED OUTPUT';
      parsed.expectedOutput = '';
    } else if (currentSection) {
      if (parsed[currentSection === 'EXPECTED OUTPUT' ? 'expectedOutput' : currentSection.toLowerCase() as 'context' | 'request']) {
         parsed[currentSection === 'EXPECTED OUTPUT' ? 'expectedOutput' : currentSection.toLowerCase() as 'context' | 'request'] += '\n' + line;
      } else {
         parsed[currentSection === 'EXPECTED OUTPUT' ? 'expectedOutput' : currentSection.toLowerCase() as 'context' | 'request'] = line;
      }
    }
  }

  if (parsed.context) parsed.context = parsed.context.trim();
  if (parsed.request) parsed.request = parsed.request.trim();
  if (parsed.expectedOutput) parsed.expectedOutput = parsed.expectedOutput.trim();

  return parsed;
}

export function formatProtocolMessage(msg: {
  from: string,
  to: string,
  type: RoomMessageType,
  subject?: string,
  context?: string,
  request?: string,
  expectedOutput?: string,
  priority?: string,
}): string {
  let output = `=== ROOM MESSAGE START ===\n`;
  output += `FROM: ${msg.from}\n`;
  output += `TO: ${msg.to}\n`;
  output += `TYPE: ${msg.type}\n`;
  if (msg.subject) output += `SUBJECT: ${msg.subject}\n`;
  if (msg.context) {
    output += `CONTEXT:\n${msg.context}\n`;
  }
  if (msg.request) {
    output += `REQUEST:\n${msg.request}\n`;
  }
  if (msg.expectedOutput) {
    output += `EXPECTED OUTPUT:\n${msg.expectedOutput}\n`;
  }
  if (msg.priority) output += `PRIORITY: ${msg.priority}\n`;
  output += `=== ROOM MESSAGE END ===`;
  return output;
}
