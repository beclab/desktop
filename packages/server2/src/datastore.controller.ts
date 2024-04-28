import { Controller, Logger, Get, Req, Put, Param, Body } from '@nestjs/common';
import { DataStoreService } from './datastore.service';
import { Result, returnSucceed, returnError } from '@bytetrade/core';
//worked
@Controller('/api/datastore')
export class DataStoreController {
  private readonly logger = new Logger(DataStoreController.name);

  constructor(
    private readonly dataStoreService: DataStoreService, // private readonly ws: WsStartGateway,
  ) {
    //
  }

  @Get('/:key')
  async get_key(@Param('key') key): Promise<Result<any>> {
    this.logger.debug('get_key ' + key);
    try {
      const data = await this.dataStoreService.GetKey(key);

      this.logger.debug(data);
      return returnSucceed(data);
    } catch (e) {
      console.log(e);
      return returnError(1, e.message || '');
    }
  }

  @Put('/:key')
  async put_key(@Param('key') key, @Body() body: any): Promise<Result<null>> {
    this.logger.debug('put_key ' + key);
    this.logger.debug(body);
    try {
      const data = await this.dataStoreService.SetKey(key, body);

      this.logger.debug(data);
      return returnSucceed(null);
    } catch (e) {
      console.log(e);
      return returnError(1, e.message || '');
    }
  }
}
