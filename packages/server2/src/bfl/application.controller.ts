import {
  Controller,
  Logger,
  Get,
  Post,
  Req,
  Param,
  Body,
} from '@nestjs/common';
import { createInstance } from './utils';

@Controller('/api/applications')
export class ApplicationController {
  private readonly logger = new Logger(ApplicationController.name);

  // @Get('/')
  // async get_applications(@Req() request: Request): Promise<any> {
  //   this.logger.debug('get_applications');
  //   const data: any = await createInstance(request).get(
  //     '/bfl/app_process/v1alpha1/myapps',
  //   );
  //   if (data.status !== 200) {
  //     throw new Error(data.statusText);
  //   }
  //   this.logger.debug(data.data);
  //   return data.data;
  // }

  @Get('/:name/setup/policy')
  async get_appFa2(
    @Req() request: Request,
    @Param('name') name: string,
  ): Promise<any> {
    this.logger.debug('get_appFa2');
    const data: any = await createInstance(request).get(
      '/bfl/settings/v1alpha1/applications/' + name + '/setup/policy',
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }

  @Post('/:name/setup/policy')
  async set_appFa2(
    @Req() request: Request,
    @Param('name') name: string,
    @Body() body: any,
  ): Promise<any> {
    this.logger.debug('set_appFa2');
    this.logger.debug(body);
    const data: any = await createInstance(request).post(
      '/bfl/settings/v1alpha1/applications/' + name + '/setup/policy',
      body,
    );
    if (data.status !== 200) {
      throw new Error(data.statusText);
    }
    this.logger.debug(data.data);
    return data.data;
  }
}
