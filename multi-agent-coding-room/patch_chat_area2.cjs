const fs = require('fs');
let code = fs.readFileSync('src/client/components/ChatArea.tsx', 'utf8');

code = code.replace(
  /const \[target, setTarget\] = useState<string \| 'all'>\('all'\);/,
  `const [target, setTarget] = useState<string | 'all'>('all');
  const [filterSender, setFilterSender] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');`
);

code = code.replace(
  /\{messages\.map\(msg => \{/,
  `{messages.filter(m => (filterSender === 'all' || m.from === filterSender) && (filterType === 'all' || m.type === filterType)).map(msg => {`
);

const filtersUI = `
      <div className="p-2 bg-gray-900 border-b border-gray-800 flex space-x-4 text-sm">
        <select value={filterSender} onChange={e => setFilterSender(e.target.value)} className="bg-gray-800 border border-gray-700 text-gray-300 rounded p-1">
          <option value="all">All Senders</option>
          <option value="user">User</option>
          {agents.map(a => <option key={a.id} value={a.id}>{a.displayName}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-gray-800 border border-gray-700 text-gray-300 rounded p-1">
          <option value="all">All Types</option>
          <option value="CHAT">CHAT</option>
          <option value="REVIEW">REVIEW</option>
          <option value="IMPLEMENTATION">IMPLEMENTATION</option>
          <option value="BROADCAST">BROADCAST</option>
        </select>
      </div>
`;

code = code.replace(
  /<div className="flex-1 overflow-y-auto p-4 space-y-4">/,
  filtersUI + '\n      <div className="flex-1 overflow-y-auto p-4 space-y-4">'
);

fs.writeFileSync('src/client/components/ChatArea.tsx', code);
