import React from 'react';
import { useStore } from '../store/useStore.js';
import { Power, PowerOff } from 'lucide-react';

export function AgentSidebar() {
  const { agents, setAgents, agentStatuses, currentRoom } = useStore();

  if (!currentRoom) return null;

  const roomAgents = agents.filter(a => currentRoom.activeAgents.includes(a.id));

  const toggleAgent = async (agentId: string, enabled: boolean) => {
    const res = await fetch(`/api/agents/${agentId}/enabled`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
    if (res.ok) {
      setAgents(agents.map(a => a.id === agentId ? { ...a, enabled } : a));
    }
  };

  return (
    <div className="w-64 bg-gray-900 border-l border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h2 className="font-semibold text-gray-200">Agents in Room</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {roomAgents.map(agent => (
          <div key={agent.id} className={`bg-gray-800 rounded-lg p-3 border ${agent.enabled ? 'border-gray-700' : 'border-red-900/50 opacity-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">{agent.displayName}</span>
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${agentStatuses[agent.id] === 'PROCESSING' ? 'bg-yellow-500 animate-pulse' : (agent.enabled ? 'bg-green-500' : 'bg-red-500')}`}></span>
                <button
                  onClick={() => toggleAgent(agent.id, !agent.enabled)}
                  className="text-gray-400 hover:text-white"
                  title={agent.enabled ? "Pause Agent" : "Resume Agent"}
                >
                  {agent.enabled ? <Power size={14} /> : <PowerOff size={14} className="text-red-400" />}
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-400">{agent.specialization}</div>
            {agentStatuses[agent.id] === 'PROCESSING' && (
              <div className="text-xs text-yellow-500 mt-2">Thinking...</div>
            )}
            {!agent.enabled && (
              <div className="text-xs text-red-400 mt-2">Paused</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
