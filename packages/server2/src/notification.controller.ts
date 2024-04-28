import { Controller, Logger, Get, Post, Body, Param } from '@nestjs/common';
//import { WsStartGateway } from './ws.gateway';
import {
  Result,
  ProviderRequest,
  NotificationMessage,
  NotificationResultCode,
} from '@bytetrade/core';
import { Cron } from '@nestjs/schedule';
import { broadcastWebsocketMessage } from './websocketClient';

@Controller('/notification')
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  private results: Record<number, any> = {};

  constructor() {
    //
  }

  updateNotification(data: Result<number>) {
    this.results[data.data] = data;
    this.results[data.data].timestamp = new Date().getTime();
    return data;
  }

  @Get('/:id')
  async get_notification(@Param('id') id: number): Promise<Result<number>> {
    console.log('get_notification ' + id);
    if (id in this.results) {
      return this.results[id];
    }
    return {
      code: NotificationResultCode.NotFound,
      message: 'Notification Not Found',
      data: id,
    };
  }

  @Post('/create')
  async push_notification(
    @Body() data: ProviderRequest<NotificationMessage>,
  ): Promise<Result<number>> {
    this.logger.debug('notification');
    this.logger.debug(data);
    const notification = data.data;
    this.logger.debug(notification);

    try {
      const push_ws = await broadcastWebsocketMessage(notification.message);
      this.logger.debug('push_ws' + push_ws);

      return this.updateNotification({
        code: NotificationResultCode.Success,
        message: 'Push Notification By Websocket',
        data: notification.id,
      });
    } catch (e) {
      this.logger.debug(e);
      return this.updateNotification({
        code: NotificationResultCode.Error,
        message: 'Push Notification Error',
        data: notification.id,
      });
    }
  }

  @Post('/query')
  async query_notification(
    @Body() data: ProviderRequest<NotificationMessage>,
  ): Promise<Result<number>> {
    this.logger.debug('query_notification');
    this.logger.debug(data);
    const notification = data.data;

    if (notification.id in this.results) {
      return this.results[notification.id];
    }
    return {
      code: NotificationResultCode.NotFound,
      message: 'Notification Not Found',
      data: notification.id,
    };
  }

  @Cron('0 * * * * *')
  async handleCron() {
    this.logger.debug('handleCron');
    const now = new Date().getTime();
    for (const id in this.results) {
      if (this.results[id].timestamp + 1000 * 30 > now) {
        this.logger.debug(
          'Remove from results ' + id + ' ' + this.results[id].timestamp,
        );
        delete this.results[id];
      } else {
        this.logger.debug(
          'Result not removed ' + id + ' ' + this.results[id].timestamp,
        );
      }
    }
  }
}
