import React, { useEffect } from 'react';
import { RoomList } from './components/RoomList.js';
import { AgentSidebar } from './components/AgentSidebar.js';
import { ChatArea } from './components/ChatArea.js';
import { useStore } from './store/useStore.js';

export function App() {
  const { setRooms, setAgents, setCurrentRoom } = useStore();

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
      <ChatArea />
      <AgentSidebar />
    </div>
  );
}
