import { BaseProvider } from '../base-provider.js';
import { RoomMessage, AgentRegistration } from '../../../shared/schemas.js';

export class ClaudeProvider extends BaseProvider {
  constructor(config: AgentRegistration) {
    super(config);
  }

  async invoke(messages: RoomMessage[], currentMessage: RoomMessage): Promise<string> {
    // Stub for real Claude implementation
    throw new Error('Claude provider not implemented yet. Use mock provider.');
  }
}
