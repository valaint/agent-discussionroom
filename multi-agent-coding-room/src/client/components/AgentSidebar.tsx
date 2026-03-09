import React from 'react';
import { useStore } from '../store/useStore.js';

export function AgentSidebar() {
  const { agents, agentStatuses, currentRoom } = useStore();

  if (!currentRoom) return null;

  const roomAgents = agents.filter(a => currentRoom.activeAgents.includes(a.id));

  return (
    <div className="w-64 bg-gray-900 border-l border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h2 className="font-semibold text-gray-200">Agents in Room</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {roomAgents.map(agent => (
          <div key={agent.id} className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">{agent.displayName}</span>
              <span className={`w-2 h-2 rounded-full ${agentStatuses[agent.id] === 'PROCESSING' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></span>
            </div>
            <div className="text-xs text-gray-400">{agent.specialization}</div>
            {agentStatuses[agent.id] === 'PROCESSING' && (
              <div className="text-xs text-yellow-500 mt-2">Thinking...</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
