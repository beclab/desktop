import {
  Controller,
  Logger,
  Get,
  Post,
  Body,
  Req,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
//import { WsStartGateway } from './ws.gateway';
import { IntentService } from './intent.service';
import { AppInfo, AppStoreInfo, UpgradeState } from '@desktop/core/src/types';
import {
  Result,
  returnSucceed,
  ProviderRequest,
  returnError,
  FileSearchQueryRequest,
  FileSearchResponse,
  FileSearchAIQuestionMessage,
} from '@bytetrade/core';
import { broadcastWebsocketMessage, WebSocketMessage } from './websocketClient';
import {
  bflUrl,
  getAccessToken,
  query,
  // add_content,
  // remove_content,
} from './search';
export const appServiceUrl =
  'http://' +
  process.env.APP_SERVICE_SERVICE_HOST +
  ':' +
  process.env.APP_SERVICE_SERVICE_PORT;
import { createInstance, getRequestToken } from './bfl/utils';
import { AppService } from './app.service';

export interface Event<T> {
  type: string;
  version: string;
  data: T;
}

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly intentService: IntentService, //  private readonly ws: WsStartGateway,
    private readonly appService: AppService,
  ) {
    //
  }

  /*
  {
    "type":"app-installation-event",
    "version":"v1",
    "data":{
        "msg":"bazarr started to install",
        "payload":{
            "op":"install",
            "app":"bazarr",
            "id":"483a1ed0",
            "appid":"483a1ed0",
            "icon":"https://file.bttcdn.com/appstore/bazarr/icon.png",
            "title":"Bazarr",
            "entrances":[
                {
                    "id":"483a1ed0",
                    "name":"bazarr-svc",
                    "title":"Bazarr",
                    "icon":"https://file.bttcdn.com/appstore/bazarr/icon.png"
                }
            ],
            "uid":"1b85d640-a624-4d22-8065-8158687d8f53",
            "status":"installing"
        }
    }
}
*/
  @Post('/server/app_installation_event')
  async app_installation_event(
    @Body() event: ProviderRequest<Event<any>>,
  ): Promise<Result<null>> {
    this.logger.debug('app_installation_event');
    this.logger.debug(JSON.stringify(event, null, 2));

    const payload = event.data.data.payload;

    broadcastWebsocketMessage({
      event: 'app_installation_event',
      // data: event.data.data,
      data: payload,
    });

    return returnSucceed(null);
  }

  @Post('/server/system_upgrade_event')
  async system_upgrade_event(
    @Body() event: ProviderRequest<Event<any>>,
  ): Promise<Result<null>> {
    this.logger.debug('system_upgrade_event');
    this.logger.debug(JSON.stringify(event, null, 2));

    broadcastWebsocketMessage({
      event: 'system_upgrade_event',
      data: event.data.data,
    });

    return returnSucceed(null);
  }

  @Get('/server/upgrade/state')
  async upgrade_state(@Req() request: Request): Promise<Result<UpgradeState>> {
    this.logger.debug('myapps headers');
    // this.logger.debug(request.headers);

    // const token = request.headers['x-authorization'];

    const res: any = await createInstance(request).get(
      '/bfl/settings/v1alpha1/upgrade/state',
      {},
    );

    if (!res || res.status != 200 || !res.data) {
      return returnError(1, 'get upgrade state error');
    }

    console.log('upgrade code: ' + res.data.code);
    console.log('upgrade data: ' + res.data.data);

    if (res.data.code != 0) {
      return returnSucceed({ state: UpgradeState.NotRunning });
    }

    return returnSucceed(res.data.data);
  }

  @Post('/server/myapps')
  async myapps(@Req() request: Request): Promise<Result<AppInfo[]>> {
    this.logger.debug('myapps headers ');

    const apps = await this.appService.GetMyApps(request);

    await this.intentService.initIntentFilter(apps);

    return returnSucceed(apps);
  }

  @Get('/server/uninstall/:name')
  async uninstall(
    @Req() request: Request,
    @Param('name') name,
  ): Promise<Result<{ uid: string }>> {
    this.logger.debug('uninstall ' + name);

    const token = getRequestToken(request);

    const res = await this.appService.UninstallApp(name, token);
    //const apps = await this.appService.GetMyApps(request);
    return returnSucceed(res);
  }

  @Post('/server/query')
  async query(
    @Body() data: FileSearchQueryRequest,
  ): Promise<Result<FileSearchResponse>> {
    this.logger.debug('query');
    this.logger.debug(data);

    const acessToken = await getAccessToken('service.files', 'files', 'Query');
    this.logger.debug('get token acesstoken ' + acessToken);
    if (!acessToken) {
      return returnError(1, 'Generate AcessToken failed');
    }
    try {
      const str = await query(acessToken, data);
      this.logger.debug('res');
      const result = JSON.parse(str);
      this.logger.debug(str);

      const r = returnSucceed({
        count: result.count,
        offset: result.offset,
        limit: result.limit,
        items: result.items,
      });
      this.logger.debug('result');
      console.log(r);
      return r;
    } catch (err) {
      return returnSucceed({
        count: 0,
        offset: data.offset ? data.offset : 0,
        limit: data.limit ? data.limit : 0,
        items: [],
      });
    }
  }

  @Post('/server/ai_message')
  async ai_message(
    @Body() token: ProviderRequest<Result<FileSearchAIQuestionMessage>>,
  ): Promise<Result<null>> {
    this.logger.log('ai_message');
    this.logger.log(token.data);

    return returnSucceed(null);
  }
}
