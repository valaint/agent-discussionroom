import { BaseProvider } from '../base-provider.js';
import { RoomMessage, RoomMessageType } from '../../../shared/schemas.js';
import { formatProtocolMessage } from '../../../shared/protocol.js';

export class MockProvider extends BaseProvider {
  async invoke(messages: RoomMessage[], currentMessage: RoomMessage): Promise<string> {
    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    let responseType: RoomMessageType = 'CHAT';
    let subject = `Re: ${currentMessage.subject || 'Message'}`;
    let context = `I am a mock ${this.config.specialization} agent.`;
    let responseText = '';

    if (this.config.specialization.toLowerCase().includes('implement')) {
       responseText = `Here is the mock implementation you requested based on ${currentMessage.body.substring(0, 20)}...`;
       responseType = 'IMPLEMENTATION';
    } else if (this.config.specialization.toLowerCase().includes('review')) {
       responseText = `I have reviewed the code. Looks mostly good, but consider edge cases.`;
       responseType = 'REVIEW';
    } else {
       responseText = `Here are some alternative ideas: 1. Use an event bus. 2. Write more tests.`;
       responseType = 'CHAT';
    }

    return formatProtocolMessage({
      from: this.config.id,
      to: currentMessage.from,
      type: responseType,
      subject: subject,
      context: context,
      request: responseText,
    });
  }
}
