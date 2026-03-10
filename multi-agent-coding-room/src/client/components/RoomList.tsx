import React from 'react';
import { useStore } from '../store/useStore.js';
import { Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export function RoomList() {
  const { rooms, currentRoom, setCurrentRoom, setRooms, agents } = useStore();

  const handleCreateRoom = async () => {
    const room = {
      id: uuidv4(),
      title: `Room ${rooms.length + 1}`,
      description: 'A new coding session',
      createdAt: Date.now(),
      activeAgents: agents.map(a => a.id),
    };

    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room),
    });

    if (res.ok) {
      const newRoom = await res.json();
      setRooms([...rooms, newRoom]);
      setCurrentRoom(newRoom);
    }
  };

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h2 className="font-semibold text-gray-200">Rooms</h2>
        <button onClick={handleCreateRoom} className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white">
          <Plus size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {rooms.map(room => (
          <div
            key={room.id}
            onClick={() => setCurrentRoom(room)}
            className={`p-3 cursor-pointer border-b border-gray-800/50 hover:bg-gray-800 transition-colors ${currentRoom?.id === room.id ? 'bg-gray-800 border-l-4 border-l-blue-500' : ''}`}
          >
            <div className="font-medium truncate">{room.title}</div>
            <div className="text-xs text-gray-500 truncate">{new Date(room.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
