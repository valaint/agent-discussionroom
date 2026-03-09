import { db } from './db.js';
import { AgentRegistration } from '../../shared/schemas.js';

export const agentStore = {
  getAgents(): AgentRegistration[] {
    const rows = db.prepare(`SELECT * FROM agents`).all() as any[];
    return rows.map(r => ({
      ...r,
      enabled: Boolean(r.enabled)
    }));
  },
  updateAgentEnabled(agentId: string, enabled: boolean) {
    db.prepare(`UPDATE agents SET enabled = ? WHERE id = ?`).run(enabled ? 1 : 0, agentId);
  }
};
