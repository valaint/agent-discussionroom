import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStore } from '../store/useStore.js';
import { RoomMessage } from '../../shared/schemas.js';
import { Send, CheckCircle2, Clock } from 'lucide-react';
import clsx from 'clsx';
import { v4 as uuidv4 } from 'uuid';

let socket: Socket | null = null;

export function ChatArea() {
  const { currentRoom, messages, setMessages, addMessage, agents, setAgentStatus } = useStore();
  const [input, setInput] = useState('');
  const [target, setTarget] = useState<string | 'all'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showRaw, setShowRaw] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!socket) {
      socket = io();

      socket.on('room_message', (msg: RoomMessage) => {
        addMessage(msg);
      });

      socket.on('agent_status', ({ agentId, status }) => {
        setAgentStatus(agentId, status);
      });
    }

    return () => {
      // Don't disconnect here so it persists across renders
    };
  }, []);

  useEffect(() => {
    if (currentRoom && socket) {
      socket.emit('join_room', currentRoom.id);

      // Fetch history
      fetch(`/api/rooms/${currentRoom.id}/messages`)
        .then(res => res.json())
        .then(data => setMessages(data));
    } else {
      setMessages([]);
    }
  }, [currentRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !currentRoom || !socket) return;

    const msg: RoomMessage = {
      id: uuidv4(),
      roomId: currentRoom.id,
      timestamp: Date.now(),
      from: 'user',
      to: target === 'all' ? 'all' : target,
      type: 'CHAT',
      body: input,
    };

    socket.emit('send_message', msg);
    setInput('');
  };

  if (!currentRoom) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950 text-gray-500">
        Select a room to start or create a new one.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-950">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
        <h2 className="font-semibold text-gray-200">{currentRoom.title}</h2>
        <div className="text-sm text-gray-400">ID: {currentRoom.id.substring(0, 8)}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => {
          const isUser = msg.from === 'user';
          const senderName = isUser ? 'You' : agents.find(a => a.id === msg.from)?.displayName || msg.from;
          const targetName = msg.to === 'all' ? 'All Agents' : agents.find(a => a.id === msg.to)?.displayName || msg.to || 'Unknown';

          return (
            <div key={msg.id} className={clsx('flex flex-col max-w-[80%]', isUser ? 'ml-auto items-end' : 'mr-auto items-start')}>
              <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
                <span>{senderName} &rarr; {targetName}</span>
                <span className="px-1.5 py-0.5 rounded bg-gray-800">{msg.type}</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className={clsx('p-3 rounded-lg', isUser ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-800 text-gray-200 rounded-tl-none')}>
                {msg.subject && <div className="font-semibold text-sm mb-1">{msg.subject}</div>}
                <div className="whitespace-pre-wrap text-sm font-mono">{msg.body}</div>

                <button
                  onClick={() => setShowRaw(prev => ({...prev, [msg.id]: !prev[msg.id]}))}
                  className="mt-2 text-xs text-gray-400 hover:text-gray-300 underline"
                >
                  {showRaw[msg.id] ? 'Hide Details' : 'Show Details'}
                </button>

                {showRaw[msg.id] && (
                  <pre className="mt-2 p-2 bg-gray-900 rounded text-xs overflow-x-auto text-gray-400 border border-gray-700">
                    {JSON.stringify(msg, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="flex space-x-2">
          <select
            className="bg-gray-800 border border-gray-700 text-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={target}
            onChange={e => setTarget(e.target.value)}
          >
            <option value="all">Broadcast to All</option>
            {agents.filter(a => currentRoom.activeAgents.includes(a.id)).map(a => (
              <option key={a.id} value={a.id}>To: {a.displayName}</option>
            ))}
          </select>
          <input
            type="text"
            className="flex-1 bg-gray-800 border border-gray-700 text-white rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Type a message or command..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded px-4 flex items-center transition-colors"
          >
            <Send size={18} className="mr-2" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
