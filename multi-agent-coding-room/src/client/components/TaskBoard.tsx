import React, { useState } from 'react';
import { useStore } from '../store/useStore.js';
import { LayoutList, Circle, Clock, CheckCircle2, AlertCircle, ArrowRightLeft, User, Search } from 'lucide-react';

const mockTasks = [
  { id: 't1', title: 'Setup database schema', status: 'DONE', assignee: 'CoderAgent', priority: 'High' },
  { id: 't2', title: 'Implement authentication API', status: 'IN_PROGRESS', assignee: 'CoderAgent', priority: 'High' },
  { id: 't3', title: 'Review PR #42 for security flaws', status: 'TODO', assignee: 'ReviewerAgent', priority: 'Medium' },
  { id: 't4', title: 'Draft project architecture plan', status: 'TODO', assignee: 'PlannerAgent', priority: 'Low' },
  { id: 't5', title: 'Fix CSS rendering bug in Safari', status: 'BLOCKED', assignee: null, priority: 'High' },
];

export function TaskBoard() {
  const { agents } = useStore();
  const [tasks, setTasks] = useState(mockTasks);

  const columns = [
    { id: 'TODO', title: 'To Do', icon: <Circle size={16} className="text-gray-400" /> },
    { id: 'IN_PROGRESS', title: 'In Progress', icon: <Clock size={16} className="text-yellow-400" /> },
    { id: 'DONE', title: 'Done', icon: <CheckCircle2 size={16} className="text-green-400" /> },
    { id: 'BLOCKED', title: 'Blocked', icon: <AlertCircle size={16} className="text-red-400" /> }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
        case 'high': return 'bg-red-900/40 text-red-400 border-red-800';
        case 'medium': return 'bg-yellow-900/40 text-yellow-400 border-yellow-800';
        case 'low': return 'bg-blue-900/40 text-blue-400 border-blue-800';
        default: return 'bg-gray-800 text-gray-400';
    }
  };

  const getAssigneeInitials = (assignee: string | null) => {
      if (!assignee) return <User size={12} className="text-gray-500" />;

      const agent = agents.find(a => a.displayName === assignee || a.id === assignee);
      if (agent) {
          return <span className="text-[10px] font-bold text-gray-200">{agent.displayName.substring(0, 2).toUpperCase()}</span>;
      }
      return <span className="text-[10px] font-bold text-gray-200">{assignee.substring(0, 2).toUpperCase()}</span>;
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('taskId', id);
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    const id = e.dataTransfer.getData('taskId');
    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
  };

  const simulateHandoff = (taskId: string) => {
    // Feature 3: Agent handoff visual action
    setTasks(tasks.map(t => {
      if (t.id === taskId && t.assignee) {
          const nextAssignee = t.assignee === 'CoderAgent' ? 'ReviewerAgent' : 'CoderAgent';
          return { ...t, assignee: nextAssignee };
      }
      return t;
    }));
  };

  return (
    <div className="flex flex-col h-full bg-gray-950">
      <div className="p-3 border-b border-gray-800 flex justify-between items-center bg-gray-900 sticky top-0 z-10 shadow-sm">
        <h2 className="font-semibold text-gray-200 flex items-center text-sm">
            <LayoutList size={16} className="mr-2 text-blue-500" />
            Agent Task Board
        </h2>
        <div className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full border border-gray-700 shadow-inner">
            {tasks.filter(t => t.status === 'DONE').length} / {tasks.length} Completed
        </div>
      </div>

      <div className="flex-1 flex overflow-x-auto p-4 space-x-4 bg-gray-950/50">
        {columns.map(col => (
          <div
            key={col.id}
            className="flex-1 min-w-[280px] max-w-sm flex flex-col bg-gray-900/50 border border-gray-800 rounded-lg p-3 shadow-sm"
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDrop(e, col.id)}
          >
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-semibold text-gray-300 flex items-center text-sm">
                   {col.icon} <span className="ml-2 tracking-wide">{col.title}</span>
               </h3>
               <span className="text-xs font-mono bg-gray-800 text-gray-400 px-2 py-0.5 rounded shadow-inner">
                   {tasks.filter(t => t.status === col.id).length}
               </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-800">
              {tasks.filter(t => t.status === col.id).map(task => (
                <div
                    key={task.id}
                    draggable
                    onDragStart={e => handleDragStart(e, task.id)}
                    className="bg-gray-800 p-3 rounded-md border border-gray-700 shadow-md cursor-grab active:cursor-grabbing hover:border-blue-500/50 transition-colors group relative"
                >
                  <div className="flex justify-between items-start mb-2">
                      <div className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono tracking-tighter">#{task.id}</span>
                  </div>

                  <div className="text-sm text-gray-200 mb-4 leading-tight font-medium pr-6">{task.title}</div>

                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-700/50">
                      {/* Handoff Action */}
                      <button
                          onClick={() => simulateHandoff(task.id)}
                          title="Handoff to next agent"
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-700 rounded-full text-blue-400 focus:outline-none"
                      >
                          <ArrowRightLeft size={14} />
                      </button>

                      <div className="flex items-center space-x-2">
                          {task.assignee && <span className="text-[10px] text-gray-400 tracking-wider truncate max-w-[80px]">{task.assignee}</span>}
                          <div
                            className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600 shadow-sm"
                            title={task.assignee || 'Unassigned'}
                          >
                            {getAssigneeInitials(task.assignee)}
                          </div>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
