import { Controller, Logger, Post, Body } from '@nestjs/common';
import { sendWebsocketMessage, WebSocketMessage } from './websocketClient';

@Controller('/websocket')
export class WebSocketController {
  private readonly logger = new Logger(WebSocketController.name);

  constructor() {
    //
  }

  @Post('/message')
  async push_notification(@Body() message: WebSocketMessage): Promise<void> {
    this.logger.debug('websocket/message');
    this.logger.debug(message);

    if (message.data.event == 'ai') {
      sendWebsocketMessage(
        { event: 'ai_message', data: { message: 'Hello world!' } },
        message.conn_id,
        null,
      );
    }

    return;
  }
}
