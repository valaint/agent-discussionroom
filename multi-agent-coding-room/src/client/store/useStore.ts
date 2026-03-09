import { create } from 'zustand';
import { Room, AgentRegistration, RoomMessage } from '../../shared/schemas.js';

interface AppState {
  rooms: Room[];
  currentRoom: Room | null;
  agents: AgentRegistration[];
  messages: RoomMessage[];
  agentStatuses: Record<string, string>;
  setRooms: (rooms: Room[]) => void;
  setCurrentRoom: (room: Room | null) => void;
  setAgents: (agents: AgentRegistration[]) => void;
  setMessages: (messages: RoomMessage[]) => void;
  addMessage: (message: RoomMessage) => void;
  setAgentStatus: (agentId: string, status: string) => void;
}

export const useStore = create<AppState>((set) => ({
  rooms: [],
  currentRoom: null,
  agents: [],
  messages: [],
  agentStatuses: {},
  setRooms: (rooms) => set({ rooms }),
  setCurrentRoom: (room) => set({ currentRoom: room }),
  setAgents: (agents) => set({ agents }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setAgentStatus: (agentId, status) => set((state) => ({
    agentStatuses: { ...state.agentStatuses, [agentId]: status }
  })),
}));
