const fs = require('fs');
let code = fs.readFileSync('src/server/index.ts', 'utf8');
code = code.replace(
  /app\.put\('\/api\/agents\/:id\/enabled', \(req, res\) => \{\n  const \{ enabled \} = req\.body;\n  agentStore\.updateAgentEnabled\(req\.params\.id, enabled\);\n  const updated = agentStore\.getAgents\(\)\.find\(a => a\.id === req\.params\.id\);\n  if \(updated\) orchestrator\.registerAgent\(updated\);\n  res\.json\(\{ success: true, enabled \}\);\n\}\);\n\napp\.put\('\/api\/agents\/:id\/enabled', \(req, res\) => \{/g,
  `app.put('/api/agents/:id/enabled', (req, res) => {`
);
fs.writeFileSync('src/server/index.ts', code);
