import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ProviderClient } from './provider.client';

const client = new ProviderClient('datastore', 'service.bfl', 'datastore', [
  'GetKey',
  'GetKeyPrefix',
  'SetKey',
  'DeleteKey',
]);

@Injectable()
export class DataStoreService implements OnModuleInit {
  private readonly logger = new Logger(DataStoreService.name);

  constructor() {
    //
  }

  async onModuleInit(): Promise<void> {
    //
  }

  async GetKey(key: string): Promise<any> {
    const response = await client.execute('/GetKey', { key });

    this.logger.debug(response.data);

    if (response.data.code != 0) {
      return null;
    }
    return response.data.data;
  }

  async SetKey(key: string, value: any): Promise<boolean> {
    const response = await client.execute('/SetKey', { key, value });

    this.logger.debug(response.data);

    if (response.data.code != 0) {
      return false;
    }
    return true;
  }
}
