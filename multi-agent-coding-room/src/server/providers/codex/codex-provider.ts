import { BaseProvider } from '../base-provider.js';
import { RoomMessage, AgentRegistration } from '../../../shared/schemas.js';

export class CodexProvider extends BaseProvider {
  constructor(config: AgentRegistration) {
    super(config);
  }

  async invoke(messages: RoomMessage[], currentMessage: RoomMessage): Promise<string> {
    // Stub for real Codex implementation
    throw new Error('Codex provider not implemented yet. Use mock provider.');
  }
}
