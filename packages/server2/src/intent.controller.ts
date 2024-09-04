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
import { IntentService } from './intent.service';
//import { WsStartGateway } from './ws.gateway';
import {
  Result,
  returnSucceed,
  IntentFilter,
  Intent,
  SendIntentResponse,
  SendIntentResult,
  CreateDefaultIntentChoiceRequest,
  ReplaceDefaultIntentChoiceRequest,
  // Action,
  // Category,
} from '@bytetrade/core';
import { broadcastWebsocketMessage } from './websocketClient';

@Controller()
export class IntentController {
  private readonly logger = new Logger(IntentController.name);

  constructor(
    private readonly intentService: IntentService, // private readonly ws: WsStartGateway,
  ) {
    //
  }

  @Post('/server/intent/register')
  async registerIntenFilter(
    @Body() intentFilter: IntentFilter,
  ): Promise<Result<string>> {
    this.logger.log('registerIntenFilter ' + JSON.stringify(intentFilter));

    const id = await this.intentService.registerIntenFilter(intentFilter);

    this.logger.log('registerIntenFilter Finished' + id);

    return returnSucceed(id);
  }

  @Get('/server/intent/unregister/:id')
  async unregisterIntenFilter(@Param('id') id): Promise<Result<null>> {
    this.logger.log('unregisterIntenFilter ' + id);
    await this.intentService.unregisterIntentFilter(id);
    return returnSucceed(null);
  }

  @Post('/server/intent/send')
  async sendIntent(
    @Body() intentParams: Partial<Intent>,
  ): Promise<Result<SendIntentResponse>> {
    this.logger.log('sendIntent ');
    this.logger.log(JSON.stringify(intentParams, null, 2));
    const intent = new Intent(intentParams);
    this.logger.log(JSON.stringify(intent, null, 2));
    const filters = await this.intentService.queryFilters(intent);
    this.logger.log(JSON.stringify(filters, null, 2));
    if (intent.isImplicit()) {
      this.logger.log('isImplicit ');
      const f = await this.intentService.matchDefaultChoice(intent);
      this.logger.log('filter.length ' + filters.length);
      this.logger.log(f);
      if (f && filters.length > 0) {
        for (const fi of filters) {
          this.logger.log('fi');
          this.logger.log(JSON.stringify(fi));
          if (fi.equal(f)) {
            //this.ws.broadcast('intent', fi);
            broadcastWebsocketMessage({ event: 'intent', data: fi });
            return returnSucceed(
              new SendIntentResponse({
                result: SendIntentResult.SENT_WITH_DEFAULT_CHOICE,
                filters: [fi],
              }),
            );
          }
        }
      }
      this.logger.log('path2 ' + filters.length);
      if (filters.length > 1) {
        return returnSucceed(
          new SendIntentResponse({
            result: SendIntentResult.RETURN_FILTERS,
            filters: filters,
          }),
        );
      } else if (filters.length == 1) {
        const fi = filters[0];
        if (intent.data) {
          fi.data = intent.data;
        }
        this.logger.log('snet intent');
        //this.ws.broadcast('intent', fi);
        broadcastWebsocketMessage({ event: 'intent', data: fi });
        return returnSucceed(
          new SendIntentResponse({
            result: SendIntentResult.RETURN_FILTERS,
            filters: [fi],
          }),
        );
      } else {
        return returnSucceed(
          new SendIntentResponse({
            result: SendIntentResult.RETURN_FILTERS,
            filters: [],
          }),
        );
      }
    }

    if (filters.length > 1) {
      return returnSucceed(
        new SendIntentResponse({
          result: SendIntentResult.NO_EXACTLY_ONE_FILTER,
          filters: filters,
        }),
      );
    } else if (filters.length == 0) {
      return returnSucceed(
        new SendIntentResponse({
          result: SendIntentResult.NO_MATCH_FILTER,
          filters: filters,
        }),
      );
    }

    //foward intent to desktop server

    //this.ws.broadcast('intent', filters[0]);
    broadcastWebsocketMessage({ event: 'intent', data: filters[0] });

    return returnSucceed(
      new SendIntentResponse({
        result: SendIntentResult.SENT,
        filters: filters,
      }),
    );
  }

  @Post('/server/intent/query')
  async queryIntent(@Body() intent: Intent): Promise<Result<IntentFilter[]>> {
    const filters = await this.intentService.queryFilters(intent);

    return returnSucceed(filters);
  }

  @Get('/server/intent/list_default_choice')
  async listDefaultChoice(): Promise<Result<IntentFilter[]>> {
    const filters = await this.intentService.getDefaultChoices();
    return returnSucceed(filters);
  }

  @Post('/server/intent/create_default_choice')
  async createDefaultChoice(
    @Body() choice: CreateDefaultIntentChoiceRequest,
  ): Promise<Result<string>> {
    const choice_id = await this.intentService.addDefaultChoice(
      choice.intent,
      choice.router_id,
    );
    return returnSucceed(choice_id);
  }

  @Delete('/server/intent/remove_default_choice/:id')
  async removeDefaultChoice(@Param('id') id): Promise<Result<null>> {
    await this.intentService.deleteDefaultChoice(id);
    return returnSucceed(null);
  }

  @Put('/server/intent/replace_default_choice')
  async replaceDefaultChoice(
    @Body() update: ReplaceDefaultIntentChoiceRequest,
  ): Promise<Result<null>> {
    await this.intentService.updateDefaultChoice(
      update.choice_id,
      update.router_id,
    );
    //
    return returnSucceed(null);
  }
}
