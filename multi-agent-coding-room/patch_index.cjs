const fs = require('fs');
let code = fs.readFileSync('src/server/index.ts', 'utf8');
code = code.replace(
  /app\.get\('\/api\/agents', \(req, res\) => \{/,
  `app.put('/api/agents/:id/enabled', (req, res) => {
  const { enabled } = req.body;
  agentStore.updateAgentEnabled(req.params.id, enabled);
  const updated = agentStore.getAgents().find(a => a.id === req.params.id);
  if (updated) orchestrator.registerAgent(updated);
  res.json({ success: true, enabled });
});

app.get('/api/agents', (req, res) => {`
);
fs.writeFileSync('src/server/index.ts', code);
