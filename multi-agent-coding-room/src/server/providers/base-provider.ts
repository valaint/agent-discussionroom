import { RoomMessage, AgentRegistration } from '../../shared/schemas.js';

export abstract class BaseProvider {
  protected config: AgentRegistration;

  constructor(config: AgentRegistration) {
    this.config = config;
  }

  abstract invoke(messages: RoomMessage[], currentMessage: RoomMessage): Promise<string>;
}
