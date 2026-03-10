import { Server } from 'socket.io';
import { RoomMessage, AgentRegistration } from '../../shared/schemas.js';
import { messageStore } from '../store/message-store.js';
import { roomStore } from '../store/room-store.js';
import { parseProtocolMessage } from '../../shared/protocol.js';
import { MockProvider } from '../providers/mock/mock-provider.js';
import { db } from '../store/db.js';
import { randomUUID } from 'crypto';

export class Orchestrator {
  private io: Server;
  private agents: Map<string, AgentRegistration> = new Map();
  private activeProviders: Map<string, MockProvider> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.loadAgents();
  }

  private loadAgents() {
    const rows = db.prepare(`SELECT * FROM agents`).all() as any[];
    for (const row of rows) {
      this.registerAgent(row);
    }
  }

  registerAgent(agent: AgentRegistration) {
    this.agents.set(agent.id, agent);
    // In a real app, instantiate the correct provider based on providerType
    // For now, only MockProvider is supported.
    if (agent.providerType === 'mock') {
       this.activeProviders.set(agent.id, new MockProvider(agent));
    }
  }

  getAgents() {
    return Array.from(this.agents.values());
  }

  async handleIncomingMessage(msg: RoomMessage) {
    console.log(`[Orchestrator] Received message from ${msg.from} to ${msg.to}`);

    // Save to DB
    messageStore.saveMessage(msg);

    // Broadcast to clients
    this.io.to(msg.roomId).emit('room_message', msg);

    // Check if any agent needs to respond
    const room = roomStore.getRoom(msg.roomId);
    if (!room) return;

    // Determine targets
    const targets = msg.to === 'all' ? room.activeAgents : (msg.to ? [msg.to] : []);

    for (const targetId of targets) {
      if (this.agents.has(targetId) && targetId !== msg.from) {
        // Process in background, don't await so we don't block
        this.invokeAgent(targetId, msg.roomId, msg).catch(e => console.error(e));
      }
    }
  }

  private async invokeAgent(agentId: string, roomId: string, currentMessage: RoomMessage) {
    const agent = this.agents.get(agentId);
    const provider = this.activeProviders.get(agentId);
    if (!agent || !agent.enabled || !provider) return;

    // Emit 'typing' or processing event
    this.io.to(roomId).emit('agent_status', { agentId, status: 'PROCESSING' });

    try {
      const messages = messageStore.getMessagesByRoom(roomId);
      const rawResponse = await provider.invoke(messages, currentMessage);

      const parsed = parseProtocolMessage(rawResponse);

      if (parsed) {
        const replyMsg: RoomMessage = {
          id: randomUUID(),
          roomId,
          timestamp: Date.now(),
          from: agentId,
          to: parsed.to || currentMessage.from,
          type: parsed.type || 'CHAT',
          subject: parsed.subject,
          body: parsed.request || parsed.context || parsed.expectedOutput || 'No content provided',
        };
        await this.handleIncomingMessage(replyMsg);
      } else {
         // Fallback if parsing fails
         const fallbackMsg: RoomMessage = {
          id: randomUUID(),
          roomId,
          timestamp: Date.now(),
          from: agentId,
          to: currentMessage.from,
          type: 'CHAT',
          body: rawResponse,
        };
        await this.handleIncomingMessage(fallbackMsg);
      }
    } catch (e) {
      console.error(`Agent ${agentId} failed:`, e);
    } finally {
       this.io.to(roomId).emit('agent_status', { agentId, status: 'IDLE' });
    }
  }
}
