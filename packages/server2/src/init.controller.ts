import { Controller, Get, Req, Logger, Post, Body } from '@nestjs/common';

import {
  Result,
  returnSucceed,
  ProviderRequest,
  returnError,
  MessageTopic,
} from '@bytetrade/core';
import { createInstance } from './bfl/utils';
import { CONFIG_KEY } from './global';
import { TerminusInfo } from '@bytetrade/core';
import { DataStoreService } from './datastore.service';
import { broadcastWebsocketMessage, WebSocketMessage } from './websocketClient';

@Controller('/server')
export class InitController {
  private readonly logger = new Logger(InitController.name);
  constructor(private readonly dataStoreService: DataStoreService) {
    //
  }

  async getConfig() {
    const configData = await this.dataStoreService.GetKey(CONFIG_KEY);

    if (configData) {
      this.logger.debug('old config');
      this.logger.debug(configData);
      return configData;
    }
    this.logger.debug('new config');

    // const configData: any = await createInstance(request).get(
    //   '/bfl/datastore/v1alpha1/' + CONFIG_KEY,
    // );
    const config = {
      bg: '/bg/0.jpg',
    };

    // await createInstance(request).put(
    //   '/bfl/datastore/v1alpha1/' + CONFIG_KEY,
    //   config,
    //   {
    //     headers: { 'Content-Type': 'application/json' },
    //   },
    // );
    await this.dataStoreService.SetKey(CONFIG_KEY, config);
    return config;
  }

  @Get('/init')
  async init(@Req() request: Request): Promise<Result<TerminusInfo>> {
    console.log('init');
    // const userData: any = await createInstance(request).get(
    //   '/bfl/backend/v1/user-info',
    // );
    const terminusInfoResponse: any = await createInstance(request).get(
      '/bfl/backend/v1/terminus-info',
    );

    const terminus = terminusInfoResponse.data.data;
    console.log('user');
    console.log(terminus);

    const config = await this.getConfig();
    console.log('config');
    console.log(config);

    return returnSucceed({ config, terminus });
  }

  // @Post('/updateConfig')
  // async updateConfig(
  //   @Req() request: Request,
  //   @Body() body: any,
  // ): Promise<Result<any>> {
  //   console.log('updateConfig');
  //   console.log(body);

  //   let config = await this.getConfig();
  //   console.log('old_config');
  //   console.log(config);

  //   config = {
  //     ...config,
  //     ...body,
  //   };

  //   console.log('new_config');
  //   console.log(config);

  //   // await createInstance(request).put(
  //   //   '/bfl/datastore/v1alpha1/' + CONFIG_KEY,
  //   //   config,
  //   //   {
  //   //     headers: { 'Content-Type': 'application/json' },
  //   //   },
  //   // );
  //   await this.dataStoreService.SetKey(CONFIG_KEY, config);

  //   return returnSucceed(config);
  // }

  @Post('/updateDesktopConfig')
  async updateDesktopConfig(
    @Body() msg: ProviderRequest<any>,
  ): Promise<Result<null>> {
    this.logger.debug('updateDesktopConfig');
    this.logger.debug(msg);
    const data = msg.data;
    this.logger.debug(data);

    try {
      const config = await this.getConfig();
      console.log(config);

      if (data.bg) {
        config.bg = data.bg;
      }

      await this.dataStoreService.SetKey(CONFIG_KEY, config);

      broadcastWebsocketMessage({
        topic: MessageTopic.Data,
        event: 'updateConfig',
        message: {
          data: config,
        },
      });

      return returnSucceed(null);
    } catch (e) {
      return returnError(1, e.message || 'update background bg failed');
    }
  }
}
