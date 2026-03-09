import React, { useEffect, useState } from 'react';
import { AgentSidebar } from './components/AgentSidebar.js';
import { ChatArea } from './components/ChatArea.js';
import { RepoSidebar } from './components/RepoSidebar.js';
import { TaskBoard } from './components/TaskBoard.js';
import { ExecutionSandbox } from './components/ExecutionSandbox.js';
import { RoomList } from './components/RoomList.js';
import { useStore } from './store/useStore.js';
import { Layout, Terminal } from 'lucide-react';

export function App() {
  const { setRooms, setAgents, setCurrentRoom } = useStore();
  const [showSandbox, setShowSandbox] = useState(false);

  useEffect(() => {
    fetch('/api/agents')
      .then(res => res.json())
      .then(data => setAgents(data));

    fetch('/api/rooms')
      .then(res => res.json())
      .then(data => {
        setRooms(data);
        if (data.length > 0) {
          setCurrentRoom(data[0]);
        }
      });
  }, []);

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200 overflow-hidden font-sans">
      <RoomList />
      <RepoSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Task Board */}
            <div className="h-64 border-b border-gray-800 overflow-y-auto bg-gray-900/50">
               <TaskBoard />
            </div>

            {/* Chat/Lineage */}
            <div className={`flex-1 overflow-hidden flex flex-col`}>
              <ChatArea />
            </div>

            {/* Execution Sandbox (Optional Bottom Pane) */}
            {showSandbox && (
              <div className="h-64 border-t border-gray-800 bg-gray-950">
                <ExecutionSandbox />
              </div>
            )}
        </div>
      </div>

      <div className="flex flex-col border-l border-gray-800 w-64 bg-gray-900">
        <div className="p-2 border-b border-gray-800 flex justify-end bg-gray-900">
            <button
              onClick={() => setShowSandbox(!showSandbox)}
              className={`p-1.5 rounded flex items-center space-x-1 ${showSandbox ? 'bg-blue-900 text-blue-300' : 'hover:bg-gray-800 text-gray-400'}`}
              title="Toggle Execution Sandbox"
            >
              <Terminal size={16} />
              <span className="text-xs font-medium">Sandbox</span>
            </button>
        </div>
        <AgentSidebar />
      </div>
    </div>
  );
}
