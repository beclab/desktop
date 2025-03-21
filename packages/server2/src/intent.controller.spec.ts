import { Test, TestingModule } from '@nestjs/testing';
import { IntentController } from './intent.controller';
import { IntentService } from './intent.service';
import { WsStartGateway } from './ws.gateway';
//import { BadRequestException } from '@nestjs/common';
import {
  IntentFilter,
  Intent,
  SendIntentResponse,
  SendIntentResult,
  CreateDefaultIntentChoiceRequest,
  ReplaceDefaultIntentChoiceRequest,
  Action,
  Category,
} from '@bytetrade/core';
import { Result } from '@bytetrade/core';

// function buildProviderRegister(data: any): ProviderRequest<any> {
//   return {
//     op: 'op',
//     datatype: 'datatype',
//     version: 'version',
//     group: 'group',
//     Token: 'token',
//     data: data,
//   };
// }

describe('AppController', () => {
  let appController: IntentController;
  let appService: IntentService;
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [IntentController],
      providers: [IntentService, WsStartGateway],
    }).compile();

    appController = app.get<IntentController>(IntentController);
    appService = app.get<IntentService>(IntentService);
  });

  describe('root', () => {
    it('Unregister not exist filter', async () => {
      await expect(appController.unregisterIntentFilter(10)).rejects.toThrow(
        'Filter not exists',
      );
    });
    it('Register & Unregsiter filter', async () => {
      const filter = new IntentFilter({
        router_id: 'com.nestjs.testing/A',
        actions: [Action.ACTION_MAIN],
        categories: [Category.CATEGORY_DEFAULT],
        data: {},
      });

      const res = await appController.registerIntentFilter(filter);
      await expect(
        appController.unregisterIntentFilter(res.data),
      ).resolves.toEqual({ code: 0, data: null, message: null });
    });
    it('Simple intent with implicit event', async () => {
      const filter = new IntentFilter({
        router_id: 'com.nestjs.testing/A',
        actions: [Action.ACTION_MAIN],
        categories: [Category.CATEGORY_DEFAULT],
        data: {},
      });

      const registerFilterResult = await appController.registerIntentFilter(
        filter,
      );

      const intent1 = {
        router_id: 'com.nestjs.testing/A',
        action: Action.ACTION_MAIN,
        category: Category.CATEGORY_DEFAULT,
      };

      let filters1: Result<SendIntentResponse> = await appController.sendIntent(
        intent1,
      );
      expect(filters1.code).toEqual(0);
      expect(filters1.data.result).toEqual(SendIntentResult.SENT);
      expect(filters1.data.filters[0].router_id).toEqual(
        'com.nestjs.testing/A',
      );

      const intent2 = new Intent({
        router_id: 'com.nestjs.testing/B',
        action: Action.ACTION_MAIN,
        category: Category.CATEGORY_DEFAULT,
      });
      filters1 = await appController.sendIntent(intent2);
      expect(filters1.code).toEqual(0);
      expect(filters1.data.result).toEqual(SendIntentResult.NO_MATCH_FILTER);

      await appController.unregisterIntentFilter(registerFilterResult.data);
      filters1 = await appController.sendIntent(intent1);
      expect(filters1.code).toEqual(0);
      expect(filters1.data.result).toEqual(SendIntentResult.NO_MATCH_FILTER);
    });
    it('Test View log', async () => {
      const filter = new IntentFilter({
        router_id: 'admin-console-user-space-pengpeng',
        actions: [Action.ACTION_VIEW],
        categories: [Category.CATEGORY_CONTAINER_LOG],
        data: { deployment: 'deployment', container: 'container' },
      });
      expect(
        filter.match(
          new Intent({
            action: Action.ACTION_VIEW,
            category: Category.CATEGORY_CONTAINER_LOG,
            data: {
              deployment: 'edge-desktop',
              container: 'desktop-server',
            },
          }),
        ),
      ).toBeTruthy();
    });

    it('Test View log2', async () => {
      await appController.registerIntentFilter(
        new IntentFilter({
          router_id: 'admin-console-user-space-pengpeng',
          actions: [Action.ACTION_VIEW],
          categories: [Category.CATEGORY_CONTAINER_LOG],
          data: { deployment: 'deployment', container: 'container' },
        }),
      );

      expect(appService.filters.length).toEqual(1);
    });

    it('Test Video ', async () => {
      const filter = new IntentFilter({
        router_id: 'video-user-space-pengpeng',
        actions: [Action.ACTION_VIEW],
        categories: [Category.CATEGORY_VIDEO],
        data: {
          name: 'name',
          path: 'path',
          extention: 'extention',
        },
      });
      expect(
        filter.match(
          new Intent({
            action: Action.ACTION_VIEW,
            category: Category.CATEGORY_VIDEO,
            data: {
              name: '2.mp4',
              path: '/Home/Downloads/2.mp4',
              extension: '.mp4',
            },
          }),
        ),
      ).toBeTruthy();
    });

    it('Simple intent with action and category', async () => {
      const filter = new IntentFilter({
        router_id: 'com.nestjs.testing/A',
        actions: [Action.ACTION_MAIN],
        categories: [Category.CATEGORY_DEFAULT],
        data: {},
      });

      expect(filter.containAction(Action.ACTION_MAIN)).toBeTruthy();
      expect(filter.containCategory(Category.CATEGORY_DEFAULT)).toBeTruthy();

      expect(
        filter.match(
          new Intent({
            action: Action.ACTION_MAIN,
          }),
        ),
      ).toBeFalsy();

      expect(
        filter.match(
          new Intent({
            action: Action.ACTION_MAIN,
            category: Category.CATEGORY_DEFAULT,
          }),
        ),
      ).toBeTruthy();

      await appController.registerIntentFilter(filter);

      const intent1 = new Intent({
        action: Action.ACTION_MAIN,
        category: Category.CATEGORY_DEFAULT,
      });
      const filter1 = await appController.queryIntent(intent1);
      expect(filter1.code).toEqual(0);
      expect(filter1.data.length).toEqual(1);
      expect(filter1.data[0].router_id).toEqual('com.nestjs.testing/A');
    });
    it('Use default choice to send explicit intent', async () => {
      const filterA = new IntentFilter({
        router_id: 'com.nestjs.testing/A',
        actions: [Action.ACTION_MAIN],
        categories: [Category.CATEGORY_DEFAULT],
        data: {},
      });
      const filterB = new IntentFilter({
        router_id: 'com.nestjs.testing/B',
        actions: [Action.ACTION_MAIN],
        categories: [Category.CATEGORY_DEFAULT],
        data: {},
      });

      await appController.registerIntentFilter(filterA);
      await appController.registerIntentFilter(filterB);

      const intent1 = new Intent({
        action: Action.ACTION_MAIN,
        category: Category.CATEGORY_DEFAULT,
      });
      expect(appService.filters.length).toEqual(2);
      const rk = await appService.queryFilters(intent1);
      expect(rk.length).toEqual(2);
      expect(filterA.match(intent1)).toBeTruthy();
      const filters1: Result<SendIntentResponse> =
        await appController.sendIntent(intent1);
      expect(filters1.code).toEqual(0);
      expect(filters1.data.result).toEqual(SendIntentResult.RETURN_FILTERS);
      expect(filters1.data.filters.length).toEqual(2);
      expect(filters1.data.filters[0].router_id).toEqual(
        'com.nestjs.testing/A',
      );
      expect(filters1.data.filters[1].router_id).toEqual(
        'com.nestjs.testing/B',
      );
      /**
       *  Create dafault choice
       */
      const defaultChoice: Result<string> =
        await appController.createDefaultChoice(
          new CreateDefaultIntentChoiceRequest({
            intent: new Intent({
              action: Action.ACTION_MAIN,
              category: Category.CATEGORY_DEFAULT,
            }),
            router_id: 'com.nestjs.testing/A',
          }),
        );
      const filters2: Result<SendIntentResponse> =
        await appController.sendIntent(intent1);
      expect(filters2.code).toEqual(0);
      expect(filters2.data.result).toEqual(
        SendIntentResult.SENT_WITH_DEFAULT_CHOICE,
      );
      expect(filters2.data.filters.length).toEqual(1);
      expect(filters2.data.filters[0].router_id).toEqual(
        'com.nestjs.testing/A',
      );

      /**
       *  Replace dafault choice
       */
      await appController.replaceDefaultChoice(
        // replace default choice
        new ReplaceDefaultIntentChoiceRequest({
          choice_id: defaultChoice.data,
          router_id: 'com.nestjs.testing/B',
        }),
      );
      const filters3: Result<SendIntentResponse> =
        await appController.sendIntent(intent1);
      expect(filters3.code).toEqual(0);
      expect(filters3.data.result).toEqual(
        SendIntentResult.SENT_WITH_DEFAULT_CHOICE,
      );
      expect(filters3.data.filters.length).toEqual(1);
      expect(filters3.data.filters[0].router_id).toEqual(
        'com.nestjs.testing/B',
      );

      /**
       *  List dafault choice
       */
      let fs = await appController.listDefaultChoice();
      expect(fs.code).toEqual(0);
      expect(fs.data.length).toEqual(1);

      /**
       *  Remove dafault choice
       */
      await appController.removeDefaultChoice(defaultChoice.data);
      fs = await appController.listDefaultChoice();
      expect(fs.code).toEqual(0);
      expect(fs.data.length).toEqual(0);

      const filters4: Result<SendIntentResponse> =
        await appController.sendIntent(intent1);
      expect(filters4.code).toEqual(0);
      expect(filters4.data.result).toEqual(SendIntentResult.RETURN_FILTERS);
      expect(filters4.data.filters.length).toEqual(2);
    });
  });
});
