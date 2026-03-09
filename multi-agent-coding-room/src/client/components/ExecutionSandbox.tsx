import React, { useState } from 'react';
import { Terminal, Play, Square, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';

export function ExecutionSandbox() {
  const [logs, setLogs] = useState<string[]>(['Sandbox initialized.', 'Ready to execute code...', '']);
  const [isRunning, setIsRunning] = useState(false);

  // Mock execution
  const runCode = () => {
    setIsRunning(true);
    setLogs(prev => [...prev, '> npm run test']);

    setTimeout(() => {
        setLogs(prev => [...prev, 'Running test suite...', '']);
    }, 500);

    setTimeout(() => {
        setLogs(prev => [...prev, ' PASS  src/math.test.ts']);
        setLogs(prev => [...prev, '  ✓ adds 1 + 2 to equal 3 (5 ms)']);
        setLogs(prev => [...prev, '']);
        setLogs(prev => [...prev, 'Test Suites: 1 passed, 1 total']);
        setLogs(prev => [...prev, 'Tests:       1 passed, 1 total']);
        setLogs(prev => [...prev, 'Snapshots:   0 total']);
        setLogs(prev => [...prev, 'Time:        1.234 s']);
        setLogs(prev => [...prev, 'Ran all test suites.']);
        setIsRunning(false);
    }, 2000);
  };

  const clearLogs = () => {
    setLogs(['Sandbox cleared.', '']);
  };

  return (
    <div className="flex flex-col h-full bg-black text-gray-300 font-mono text-sm relative">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center space-x-2 text-gray-400">
          <Terminal size={16} />
          <span className="font-semibold text-xs tracking-wider">EXECUTION SANDBOX</span>
          <span className={`w-2 h-2 rounded-full ml-2 ${isRunning ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></span>
        </div>
        <div className="flex space-x-2">
           <button
             onClick={runCode}
             disabled={isRunning}
             className={`p-1 rounded text-xs flex items-center space-x-1 ${isRunning ? 'text-gray-500 cursor-not-allowed' : 'text-green-400 hover:bg-gray-800'}`}
           >
             <Play size={14} /> <span>Run</span>
           </button>
           <button
             onClick={() => setIsRunning(false)}
             disabled={!isRunning}
             className={`p-1 rounded text-xs flex items-center space-x-1 ${!isRunning ? 'text-gray-500 cursor-not-allowed' : 'text-red-400 hover:bg-gray-800'}`}
           >
             <Square size={14} /> <span>Stop</span>
           </button>
           <button
             onClick={clearLogs}
             className="p-1 hover:bg-gray-800 text-gray-400 hover:text-white rounded ml-2"
           >
             <RotateCcw size={14} />
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-[#0d1117] text-[#c9d1d9] selection:bg-[#3392FF44]">
        {logs.map((log, i) => {
            let colorClass = 'text-gray-300';
            if (log.includes('PASS') || log.includes('passed')) colorClass = 'text-green-400 font-bold';
            if (log.includes('FAIL') || log.includes('Error')) colorClass = 'text-red-400 font-bold';
            if (log.startsWith('>')) colorClass = 'text-blue-400';

            return (
              <div key={i} className={`flex ${colorClass}`}>
                  {log || '\u00A0'}
              </div>
            );
        })}
        {isRunning && (
            <div className="flex items-center text-yellow-500 mt-2">
                <span className="animate-pulse mr-2">_</span>
                Executing...
            </div>
        )}
      </div>

      <div className="bg-gray-900 border-t border-gray-800 p-2 text-xs text-gray-500 flex justify-between items-center">
        <div className="flex items-center space-x-2">
            <CheckCircle size={12} className="text-green-500" />
            <span>Environment: Node.js v20.x</span>
        </div>
        <div>Memory: 12MB / 512MB</div>
      </div>
    </div>
  );
}
