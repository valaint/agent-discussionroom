import React from 'react';
import { GitMerge, Plus, Minus } from 'lucide-react';

interface DiffViewerProps {
  diff: string;
}

export function DiffViewer({ diff }: DiffViewerProps) {
  const lines = diff.split('\n');

  return (
    <div className="rounded-md border border-gray-700 bg-gray-900 overflow-hidden text-sm font-mono mt-2 shadow-sm">
      <div className="bg-gray-800 px-3 py-1.5 border-b border-gray-700 flex items-center text-gray-300 text-xs font-semibold">
        <GitMerge size={14} className="mr-2 text-purple-400" />
        Proposed Changes
      </div>
      <div className="overflow-x-auto p-2">
        {lines.map((line, i) => {
          if (!line) return null;

          let bgColor = 'bg-transparent';
          let textColor = 'text-gray-300';
          let icon = null;

          if (line.startsWith('+')) {
            bgColor = 'bg-green-900/30';
            textColor = 'text-green-400';
            icon = <Plus size={12} className="inline-block mr-2 opacity-70" />;
          } else if (line.startsWith('-')) {
            bgColor = 'bg-red-900/30';
            textColor = 'text-red-400';
            icon = <Minus size={12} className="inline-block mr-2 opacity-70" />;
          } else if (line.startsWith('@@')) {
            bgColor = 'bg-blue-900/20';
            textColor = 'text-blue-400';
          }

          return (
            <div key={i} className={`flex px-2 py-0.5 rounded-sm ${bgColor} ${textColor}`}>
              <span className="select-none text-gray-600 w-8 text-right pr-3 text-[10px] leading-5">{i + 1}</span>
              <span className="flex-1 whitespace-pre">{icon}{line.replace(/^[-+]/, '')}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
