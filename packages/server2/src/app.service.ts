import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ProviderClient } from './provider.client';
import { AppInfo } from '@desktop/core/src/types';
const appClient = new ProviderClient('app', 'service.bfl', 'app', ['UserApps']);
const appStoreClient = new ProviderClient(
  'appstore',
  'service.appstore',
  'app',
  ['UninstallDevApp'],
);

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor() {
    //
  }

  async onModuleInit(): Promise<void> {
    //
  }

  async GetMyApps(request: Request): Promise<AppInfo[]> {
    const host = request.headers['host'];
    this.logger.log('host ' + host);
    let isLocal = false;
    if (host.indexOf('.local.') >= 0) {
      isLocal = true;
    }
    this.logger.log('GetMyApps isLocal ' + isLocal);

    const response = await appClient.execute('/UserApps', { isLocal });

    this.logger.log(response.data);
    if (response.data.code != 0) {
      throw new Error('GetMyApps error');
    }

    return response.data.data.items;
  }

  async UninstallApp(name: string, token: string): Promise<{ uid: string }> {
    this.logger.log('UninstallApp');
    const response = await appStoreClient.execute(
      '/UninstallDevApp',
      { name },
      token,
    );

    this.logger.log(response.data);
    if (response.data.code != 200) {
      throw new Error('UninstallApp error');
    }

    return response.data.data;
  }
}
