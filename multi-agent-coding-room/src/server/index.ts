import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { db } from './store/db.js';
import { Orchestrator } from './router/orchestrator.js';
import { roomStore } from './store/room-store.js';
import { messageStore } from './store/message-store.js';
import { AgentRegistration, Room, RoomMessage } from '../shared/schemas.js';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // For development
  }
});

const orchestrator = new Orchestrator(io);

// Seed some initial agents if empty
const existingAgents = db.prepare('SELECT count(*) as c FROM agents').get() as { c: number };
if (existingAgents.c === 0) {
  const seedAgents: AgentRegistration[] = [
    { id: 'agent-codex-1', displayName: 'Codex Dev', providerType: 'mock', specialization: 'Implementation', executionMode: 'auto', enabled: true },
    { id: 'agent-claude-1', displayName: 'Claude Reviewer', providerType: 'mock', specialization: 'Code Review', executionMode: 'auto', enabled: true },
    { id: 'agent-gemini-1', displayName: 'Gemini Thinker', providerType: 'mock', specialization: 'Architecture', executionMode: 'auto', enabled: true },
  ];
  for (const a of seedAgents) {
    db.prepare('INSERT INTO agents (id, displayName, providerType, specialization, executionMode, enabled) VALUES (?, ?, ?, ?, ?, ?)').run(a.id, a.displayName, a.providerType, a.specialization, a.executionMode, a.enabled ? 1 : 0);
    orchestrator.registerAgent(a);
  }
}

// REST endpoints
app.get('/api/agents', (req, res) => {
  res.json(orchestrator.getAgents());
});

app.get('/api/rooms', (req, res) => {
  res.json(roomStore.getRooms());
});

app.post('/api/rooms', (req, res) => {
  const room: Room = req.body;
  roomStore.createRoom(room);
  res.status(201).json(room);
});

app.get('/api/rooms/:roomId/messages', (req, res) => {
  res.json(messageStore.getMessagesByRoom(req.params.roomId));
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_room', (roomId: string) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('send_message', (msg: RoomMessage) => {
    orchestrator.handleIncomingMessage(msg);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
