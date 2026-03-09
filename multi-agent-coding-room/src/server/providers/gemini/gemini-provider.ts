import { BaseProvider } from '../base-provider.js';
import { RoomMessage, AgentRegistration } from '../../../shared/schemas.js';

export class GeminiProvider extends BaseProvider {
  constructor(config: AgentRegistration) {
    super(config);
  }

  async invoke(messages: RoomMessage[], currentMessage: RoomMessage): Promise<string> {
    // Stub for real Gemini implementation
    throw new Error('Gemini provider not implemented yet. Use mock provider.');
  }
}
