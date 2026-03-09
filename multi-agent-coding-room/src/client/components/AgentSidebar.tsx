import React from 'react';
import { useStore } from '../store/useStore.js';
import { Bot, UserCog, Lightbulb, FileCode2, Search, Download } from 'lucide-react';
import { RoomMessage } from '../../shared/schemas.js';

export function AgentSidebar() {
  const { agents, agentStatuses, currentRoom, messages } = useStore();

  if (!currentRoom) return null;

  const roomAgents = agents.filter(a => currentRoom.activeAgents.includes(a.id));

  // Determine role icon based on specialization or name
  const getRoleIcon = (agent: any) => {
    const spec = agent.specialization.toLowerCase();
    const name = agent.displayName.toLowerCase();

    if (spec.includes('plan') || name.includes('plan')) return <Lightbulb size={18} className="text-yellow-400" />;
    if (spec.includes('code') || spec.includes('implement') || name.includes('implement')) return <FileCode2 size={18} className="text-blue-400" />;
    if (spec.includes('review') || name.includes('review')) return <Search size={18} className="text-purple-400" />;
    return <Bot size={18} className="text-green-400" />;
  };

  const exportTranscript = () => {
    if (!messages || messages.length === 0) return;

    const transcript = messages.map(msg => {
        const isUser = msg.from === 'user';
        const senderName = isUser ? 'You' : agents.find(a => a.id === msg.from)?.displayName || msg.from;
        return `[${new Date(msg.timestamp).toISOString()}] ${senderName} (${msg.type}):\n${msg.body}\n\n`;
    }).join('---\n');

    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${currentRoom.id.substring(0,8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 bg-gray-900 flex flex-col">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h2 className="font-semibold text-gray-200">Agents in Room</h2>
        <button
            onClick={exportTranscript}
            className="p-1 hover:bg-gray-800 text-gray-400 hover:text-white rounded"
            title="Export Transcript"
        >
            <Download size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {roomAgents.map(agent => (
          <div key={agent.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getRoleIcon(agent)}
                <span className="font-medium text-sm text-gray-200">{agent.displayName}</span>
              </div>
              <span className={`w-2 h-2 rounded-full ${agentStatuses[agent.id] === 'PROCESSING' ? 'bg-yellow-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`}></span>
            </div>
            <div className="text-xs text-gray-400 bg-gray-900 p-2 rounded truncate mt-1">
                {agent.specialization}
            </div>
            {agentStatuses[agent.id] === 'PROCESSING' && (
              <div className="text-xs text-yellow-500 mt-2 flex items-center">
                 <span className="inline-block w-3 h-3 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mr-2"></span>
                 Thinking...
              </div>
            )}

            {/* Mock Agent Turn Limit indicator */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                 <span>Turn Limit</span>
                 <span>7/10</span>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-1.5">
                 <div className="bg-blue-500 h-1.5 rounded-full w-[70%]"></div>
              </div>
            </div>
          </div>
        ))}

        {/* Human User representation */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 mt-4">
            <div className="flex items-center space-x-2 mb-2">
                <UserCog size={18} className="text-gray-400" />
                <span className="font-medium text-sm text-gray-400">Human Operator</span>
            </div>
            <div className="text-xs text-gray-500 bg-gray-900 p-2 rounded truncate mt-1">
                Overrides & Guidance
            </div>
        </div>
      </div>
    </div>
  );
}
