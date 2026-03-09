const fs = require('fs');
let code = fs.readFileSync('src/client/components/ChatArea.tsx', 'utf8');
code = code.replace(
  /import \{ Send, CheckCircle2, Clock \} from 'lucide-react';/,
  "import { Send, CheckCircle2, Clock, Download, FileJson } from 'lucide-react';"
);

const exportFunctions = `
  const exportAsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(messages, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", \`transcript-\${currentRoom?.id}.json\`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const exportAsMarkdown = () => {
    const md = messages.map(m => \`**\${m.from} &rarr; \${m.to || 'all'}** [\${new Date(m.timestamp).toISOString()}]\\n\\n\${m.body}\\n\\n---\`).join('\\n\\n');
    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", \`transcript-\${currentRoom?.id}.md\`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
`;

code = code.replace(
  /const handleSend = \(\) => \{/,
  exportFunctions + '\n  const handleSend = () => {'
);

const exportButtons = `
        <div className="flex space-x-2">
          <button onClick={exportAsJSON} className="p-1 text-gray-400 hover:text-white" title="Export JSON"><FileJson size={18} /></button>
          <button onClick={exportAsMarkdown} className="p-1 text-gray-400 hover:text-white" title="Export Markdown"><Download size={18} /></button>
        </div>
`;

code = code.replace(
  /<div className="text-sm text-gray-400">ID: \{currentRoom\.id\.substring\(0, 8\)\}<\/div>/,
  `<div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">ID: {currentRoom.id.substring(0, 8)}</div>
${exportButtons}
        </div>`
);

fs.writeFileSync('src/client/components/ChatArea.tsx', code);
