import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStore } from '../store/useStore.js';
import { RoomMessage } from '../../shared/schemas.js';
import { Send, CheckCircle2, Clock, FileCode, Cpu, User, Network, MessageSquare, ChevronDown, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { v4 as uuidv4 } from 'uuid';
import { DiffViewer } from './DiffViewer.js';

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

  const getSenderIcon = (isUser: boolean, senderName: string) => {
    if (isUser) return <User size={16} className="text-white" />;
    if (senderName.toLowerCase().includes('plan')) return <Network size={16} className="text-yellow-400" />;
    if (senderName.toLowerCase().includes('implement')) return <FileCode size={16} className="text-blue-400" />;
    return <Cpu size={16} className="text-green-400" />;
  };

  if (!currentRoom) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950 text-gray-500">
        Select a room to start or create a new one.
      </div>
    );
  }

  // Feature 8: Message Lineage - group by correlationId if present
  const renderMessageContent = (msg: RoomMessage) => {
    const isPatch = msg.type === 'IMPLEMENTATION' && msg.body.includes('```diff');

    if (isPatch) {
      // Extract diff block
      const diffMatch = msg.body.match(/```diff\n([\s\S]*?)\n```/);
      const diffContent = diffMatch ? diffMatch[1] : '';
      const textBefore = msg.body.substring(0, diffMatch?.index || msg.body.length);

      return (
        <div className="space-y-3">
          <div className="whitespace-pre-wrap text-sm font-sans">{textBefore}</div>
          {diffContent && <DiffViewer diff={diffContent} />}
        </div>
      );
    }

    return <div className="whitespace-pre-wrap text-sm font-sans leading-relaxed">{msg.body}</div>;
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-950 h-full">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900 shadow-sm z-10">
        <div className="flex items-center space-x-2">
            <MessageSquare size={18} className="text-blue-500" />
            <h2 className="font-semibold text-gray-200">{currentRoom.title}</h2>
        </div>
        <div className="text-sm text-gray-400 font-mono bg-gray-800 px-2 py-1 rounded">ID: {currentRoom.id.substring(0, 8)}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-gray-950/50">
        {/* Message Lineage View */}
        <div className="relative">
          {/* Connecting line for lineage */}
          <div className="absolute left-6 top-4 bottom-4 w-px bg-gray-800 z-0 hidden md:block"></div>

          {messages.map((msg, index) => {
            const isUser = msg.from === 'user';
            const senderName = isUser ? 'You' : agents.find(a => a.id === msg.from)?.displayName || msg.from;
            const targetName = msg.to === 'all' ? 'All Agents' : agents.find(a => a.id === msg.to)?.displayName || msg.to || 'Unknown';
            const isHandoff = msg.type === 'HANDOFF';

            return (
              <div key={msg.id} className={clsx('relative flex w-full mb-6 z-10', isUser ? 'justify-end' : 'justify-start')}>

                {/* Lineage connector dot */}
                {!isUser && <div className="hidden md:flex absolute -left-1 top-4 w-3 h-3 rounded-full bg-gray-700 border-2 border-gray-950 items-center justify-center"></div>}

                <div className={clsx('flex flex-col w-full max-w-[85%] md:max-w-[75%]', isUser ? 'items-end' : 'items-start ml-0 md:ml-10')}>

                  {/* Sender Info Bar */}
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
                    <div className="flex items-center space-x-1 font-medium text-gray-300">
                        {getSenderIcon(isUser, senderName)}
                        <span>{senderName}</span>
                    </div>
                    <span>&rarr;</span>
                    <span className="text-gray-400">{targetName}</span>

                    <span className={clsx(
                        'px-2 py-0.5 rounded text-[10px] font-bold tracking-wider',
                        isHandoff ? 'bg-purple-900/50 text-purple-400 border border-purple-800' :
                        msg.type === 'IMPLEMENTATION' ? 'bg-blue-900/50 text-blue-400 border border-blue-800' :
                        msg.type === 'REVIEW' ? 'bg-green-900/50 text-green-400 border border-green-800' :
                        'bg-gray-800 text-gray-400 border border-gray-700'
                    )}>
                        {msg.type}
                    </span>

                    <span className="text-[10px] opacity-70 flex items-center">
                        <Clock size={10} className="mr-1" />
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div className={clsx(
                    'p-4 rounded-xl shadow-md border',
                    isUser ? 'bg-blue-900/40 border-blue-800/50 text-gray-100 rounded-tr-sm' :
                    isHandoff ? 'bg-purple-900/20 border-purple-800/50 text-gray-200 rounded-tl-sm w-full' :
                    'bg-gray-900 border-gray-800 text-gray-300 rounded-tl-sm w-full'
                  )}>
                    {msg.subject && <div className="font-semibold text-sm mb-3 border-b border-gray-800/50 pb-2 flex items-center">
                        {msg.subject}
                    </div>}

                    {renderMessageContent(msg)}

                    <div className="mt-3 flex items-center justify-between border-t border-gray-800/50 pt-2">
                        <button
                          onClick={() => setShowRaw(prev => ({...prev, [msg.id]: !prev[msg.id]}))}
                          className="flex items-center text-xs text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          {showRaw[msg.id] ? <ChevronDown size={14} className="mr-1" /> : <ChevronRight size={14} className="mr-1" />}
                          {showRaw[msg.id] ? 'Hide Protocol Source' : 'View Protocol Source'}
                        </button>

                        {msg.correlationId && (
                            <span className="text-[10px] text-gray-600 font-mono bg-gray-950 px-1 rounded" title="Correlation ID">
                                {msg.correlationId.substring(0,8)}
                            </span>
                        )}
                    </div>

                    {showRaw[msg.id] && (
                      <pre className="mt-3 p-3 bg-gray-950 rounded text-xs overflow-x-auto text-gray-400 border border-gray-800 font-mono">
                        {JSON.stringify(msg, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="flex space-x-3 items-end">
          <div className="flex flex-col space-y-1">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold ml-1">Target</label>
              <select
                className="bg-gray-800 border border-gray-700 text-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-[46px]"
                value={target}
                onChange={e => setTarget(e.target.value)}
              >
                <option value="all">Broadcast to All</option>
                {agents.filter(a => currentRoom.activeAgents.includes(a.id)).map(a => (
                  <option key={a.id} value={a.id}>To: {a.displayName}</option>
                ))}
              </select>
          </div>
          <div className="flex-1 relative">
             <input
                type="text"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 h-[46px] shadow-inner"
                placeholder="Type a message or command for the agents..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button
                onClick={handleSend}
                className={clsx(
                    "absolute right-1.5 top-1.5 bottom-1.5 rounded-md px-3 flex items-center justify-center transition-all",
                    input.trim() ? "bg-blue-600 hover:bg-blue-500 text-white shadow-md" : "bg-gray-700 text-gray-500 cursor-not-allowed"
                )}
                disabled={!input.trim()}
              >
                <Send size={16} />
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
