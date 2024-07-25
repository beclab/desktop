import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import * as WebSocket from 'ws';
import {
  WsResponse,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
//import { getAccessToken, question_ai } from './search';
import {
  FileSearchAIQuestionRequest,
  FileSearchAIQuestionResponse,
} from '@bytetrade/core';

@WebSocketGateway(3100, { transports: ['websocket'] })
export class WsStartGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private readonly logger = new Logger(WsStartGateway.name);

  @WebSocketServer() private server: any;
  wsClients = [];
  afterInit() {
    console.log('afterInit');
    // this.server.emit('testing', { do: 'stuff' });
  }

  private aiMap: Record<string, any> = {};

  handleConnection(client: any) {
    console.log('handleConnection ' + client.id);

    this.wsClients.push(client);
  }

  handleDisconnect(client) {
    console.log('handleDisconnect');
    for (let i = 0; i < this.wsClients.length; i++) {
      if (this.wsClients[i] === client) {
        this.wsClients.splice(i, 1);
        break;
      }
    }
    this.broadcast('disconnect', {});
  }

  public setAIMap(id: string, client: any) {
    this.logger.debug('setAIMap ' + id);
    this.aiMap[id] = client;
  }

  public removeAIMap(id: string) {
    this.logger.debug('removeAIMap ' + id);
    delete this.aiMap[id];
  }

  public async sendAIMessage(
    id: string,
    event: string,
    message: any,
  ): Promise<boolean> {
    if (!(id in this.aiMap)) {
      this.logger.debug('id not in  sendAIMessage' + id);
      return true;
    }
    this.logger.debug('sendAI Message ' + id);
    try {
      //const broadCastMessage = JSON.stringify(message);
      this.aiMap[id].send(JSON.stringify({ event, data: message }));
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  public broadcast(event, message: any) {
    //const broadCastMessage = JSON.stringify(message);
    for (const c of this.wsClients) {
      c.send(JSON.stringify({ event, data: message }));
    }
  }

  @SubscribeMessage('login')
  async login(
    @MessageBody() data: any,
    @ConnectedSocket() client: WebSocket,
  ): Promise<any> {
    console.log('login');
    console.log(data);
    if (data.firebase_token) {
      // this.setFirebaseToken(data.firebase_token, client);
      return {
        event: 'binding',
        code: 0,
        msg: 'success',
      };
    } else {
      return {
        event: 'binding',
        code: 1,
        msg: 'failed',
      };
    }
  }

  @SubscribeMessage('ping')
  async ping(
    @MessageBody() data: any,
    @ConnectedSocket() client: WebSocket,
  ): Promise<any> {
    this.logger.log('ping');
    this.logger.log(data);
    return {
      event: 'pong',
      code: 0,
      msg: 'success',
    };
  }

  // @SubscribeMessage('ai')
  // async hello(
  //   @MessageBody() data: FileSearchAIQuestionRequest,
  //   @ConnectedSocket() client: WebSocket,
  // ): Promise<any> {
  //   console.log('ai');
  //   console.log(data);
  //   const acessToken = await getAccessToken(
  //     'service.search',
  //     'search',
  //     'QuestionAI',
  //   );
  //   //console.log('get token acesstoken ' + acessToken);
  //   if (!acessToken) {
  //     return {
  //       event: 'ai',
  //       code: 1,
  //       msg: 'get acessToken error',
  //     };
  //   }
  //   try {
  //     const str = await question_ai(acessToken, data);
  //     console.log('res');
  //     const result: FileSearchAIQuestionResponse = JSON.parse(str);
  //     console.log(result);

  //     this.setAIMap(result.conversationId, client);

  //     return {
  //       event: 'ai',
  //       code: 0,
  //       messageId: result.messageId,
  //       conversationId: result.conversationId,
  //     };
  //   } catch (err) {
  //     this.logger.error(err);
  //     return {
  //       event: 'ai',
  //       code: 1,
  //       text: 'Sorry something went wrong. Please try again.',
  //       messageId: '',
  //       conversationId: data.conversationId,
  //     };
  //   }
  // }
}
