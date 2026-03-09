import React, { useState } from 'react';
import { useStore } from '../store/useStore.js';
import {
    Folder, File, ChevronRight, ChevronDown,
    GitBranch, GitCommit, GitPullRequest, UploadCloud,
    DownloadCloud, RefreshCw, FileCode2, Search, Settings
} from 'lucide-react';

// Mock file tree structure
const MOCK_FILES = [
  { name: 'src', type: 'dir', children: [
    { name: 'components', type: 'dir', children: [
        { name: 'App.tsx', type: 'file' },
        { name: 'Button.tsx', type: 'file' },
        { name: 'Header.tsx', type: 'file' },
    ]},
    { name: 'utils', type: 'dir', children: [
        { name: 'math.ts', type: 'file' },
        { name: 'api.ts', type: 'file' },
    ]},
    { name: 'index.ts', type: 'file' },
    { name: 'styles.css', type: 'file' }
  ]},
  { name: 'tests', type: 'dir', children: [
    { name: 'math.test.ts', type: 'file' }
  ]},
  { name: 'package.json', type: 'file' },
  { name: 'README.md', type: 'file' },
  { name: 'tsconfig.json', type: 'file' }
];

export function RepoSidebar() {
  const [openDirs, setOpenDirs] = useState<Record<string, boolean>>({'src': true, 'tests': true, 'components': true});
  const [activeFile, setActiveFile] = useState<string | null>(null);

  const toggleDir = (path: string) => {
    setOpenDirs(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const renderTree = (nodes: any[], path: string = '') => {
    return nodes.map(node => {
      const fullPath = `${path}/${node.name}`;
      const isOpen = openDirs[fullPath];

      if (node.type === 'dir') {
        return (
          <div key={fullPath} className="ml-2">
            <div
              className="flex items-center space-x-1 py-1 cursor-pointer hover:bg-gray-800 text-gray-300 rounded px-1 group"
              onClick={() => toggleDir(fullPath)}
            >
              {isOpen ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
              <Folder size={14} className="text-blue-400 group-hover:text-blue-300" />
              <span className="text-sm select-none">{node.name}</span>
            </div>
            {isOpen && node.children && (
              <div className="border-l border-gray-800 ml-2">
                {renderTree(node.children, fullPath)}
              </div>
            )}
          </div>
        );
      }

      return (
        <div
            key={fullPath}
            className={`flex items-center space-x-2 py-1 cursor-pointer rounded px-3 ml-2 group
                ${activeFile === fullPath ? 'bg-blue-900/50 text-blue-300 border border-blue-800/50' : 'hover:bg-gray-800 text-gray-400'}`}
            onClick={() => setActiveFile(fullPath)}
        >
          <FileCode2 size={14} className={activeFile === fullPath ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"} />
          <span className="text-sm select-none truncate">{node.name}</span>
        </div>
      );
    });
  };

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-gray-800 flex justify-between items-center bg-gray-950">
        <h2 className="font-semibold text-gray-200 text-sm flex items-center">
            <GitBranch size={16} className="mr-2 text-purple-400" />
            main
        </h2>
        <div className="flex space-x-1 text-gray-400">
           <button className="p-1 hover:bg-gray-800 hover:text-white rounded" title="Refresh"><RefreshCw size={14} /></button>
           <button className="p-1 hover:bg-gray-800 hover:text-white rounded" title="Settings"><Settings size={14} /></button>
        </div>
      </div>

      {/* File Explorer */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-700">
        <div className="text-xs font-semibold text-gray-500 mb-2 px-2 tracking-wider flex items-center justify-between">
            EXPLORER
            <Search size={12} className="cursor-pointer hover:text-gray-300" />
        </div>
        {renderTree(MOCK_FILES)}
      </div>

      {/* Git Integration Panel */}
      <div className="border-t border-gray-800 p-3 bg-gray-950 flex flex-col space-y-3">
         <div className="text-xs font-semibold text-gray-500 tracking-wider">SOURCE CONTROL</div>

         <div className="flex flex-col space-y-2">
             <div className="flex justify-between items-center text-xs text-gray-400">
                 <span className="flex items-center"><FileCode2 size={12} className="mr-1 text-yellow-500" /> 2 changed files</span>
                 <span className="text-gray-600">+14 -3</span>
             </div>

             <input
                type="text"
                placeholder="Commit message"
                className="bg-gray-900 border border-gray-800 rounded p-1.5 text-xs text-white placeholder-gray-600 focus:border-blue-500 outline-none"
             />

             <button className="bg-blue-600 hover:bg-blue-700 text-white rounded py-1.5 text-xs font-medium flex items-center justify-center transition-colors shadow-sm w-full">
                 <GitCommit size={14} className="mr-1.5" /> Commit Changes
             </button>

             <div className="flex justify-between space-x-2">
                 <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded py-1.5 text-xs font-medium flex items-center justify-center transition-colors">
                     <UploadCloud size={14} className="mr-1.5 text-green-400" /> Push
                 </button>
                 <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded py-1.5 text-xs font-medium flex items-center justify-center transition-colors">
                     <DownloadCloud size={14} className="mr-1.5 text-blue-400" /> Pull
                 </button>
             </div>
         </div>
      </div>
    </div>
  );
}
