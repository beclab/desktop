import {
  Injectable,
  Logger,
  OnModuleInit,
  BadRequestException,
} from '@nestjs/common';
import { IntentFilter, Intent, Action, Category } from '@bytetrade/core';
import { v4 as uuidv4 } from 'uuid';
import { AppInfo } from '@desktop/core/src/types';

@Injectable()
export class IntentService implements OnModuleInit {
  private readonly logger = new Logger(IntentService.name);
  filters: IntentFilter[] = [];
  intent_default_choice: IntentFilter[] = [];

  private _db: any;

  constructor() {
    this.logger.log('init service');
  }

  async onModuleInit(): Promise<void> {
    this.logger.log(`The module start initialize`);
    // this._db = level('./data');
    // try {
    //   const res = await this._db.get('filters');
    //   this.filters = JSON.parse(res);
    // } catch (err) {
    //   this.filters = [];
    // }
    this.filters = [];

    // try {
    //   const res = await this._db.get('intent_default_choice');
    //   this.intent_default_choice = JSON.parse(res);
    // } catch (err) {
    //   this.intent_default_choice = [];
    // }
    this.intent_default_choice = [];

    this.logger.log(
      `The module has been initialized. filter number is: ` +
        this.filters.length,
    );
    for (const filter of this.filters) {
      this.logger.log(JSON.stringify(filter));
    }
  }

  getFilters(): IntentFilter[] {
    return this.filters;
  }

  async registerIntenFilter(newFilter: IntentFilter): Promise<string> {
    for (const filter of this.filters) {
      if (newFilter.equal(filter)) {
        throw new BadRequestException('Filter already exists', {
          cause: new Error(),
        });
      }
    }

    newFilter.id = uuidv4();

    this.filters.push(newFilter);
    if (this._db) {
      await this._db.put('filters', JSON.stringify(this.filters));
    }
    return newFilter.id;
  }

  async unregisterIntentFilter(id: string) {
    const index = this.filters.findIndex((f) => f.id == id);
    if (index < 0) {
      throw new BadRequestException('Filter not exists', {
        cause: new Error(),
      });
    }

    this.filters = this.filters.filter((filter) => filter.id !== id);
    if (this._db) {
      await this._db.put('filters', JSON.stringify(this.filters));
    }

    this.intent_default_choice = this.intent_default_choice.filter(
      (filter) => filter.router_id == id,
    );
    if (this._db) {
      await this._db.put(
        'intent_default_choice',
        JSON.stringify(this.intent_default_choice),
      );
    }
  }

  async queryFilters(intent: Intent): Promise<IntentFilter[]> {
    const f = [];
    console.log('fitler length ' + this.filters.length);
    for (const filter of this.filters) {
      if (filter.match(intent)) {
        f.push(filter);
      }
    }

    return f;
  }

  getDefaultChoices(): IntentFilter[] {
    return this.intent_default_choice;
  }

  async addDefaultChoice(intent: Intent, router_id: string): Promise<string> {
    if (intent.isExplicit()) {
      throw new BadRequestException(
        'Explicit Intent not need set default choice',
        {
          cause: new Error(),
        },
      );
    }

    const filter = new IntentFilter({
      id: uuidv4(),
      router_id: router_id,
      actions: [intent.action],
      categories: [intent.category],
      data: intent.data,
    });

    for (const i of this.intent_default_choice) {
      if (i.equal(filter)) {
        throw new BadRequestException('Default choice already exists', {
          cause: new Error(),
        });
      }
    }

    this.intent_default_choice.push(filter);
    if (this._db) {
      await this._db.put(
        'intent_default_choice',
        JSON.stringify(this.intent_default_choice),
      );
    }
    return filter.id;
  }

  async updateDefaultChoice(id: string, router_id: string) {
    for (const i of this.intent_default_choice) {
      if (i.id == id) {
        i.router_id = router_id;
        if (this._db) {
          await this._db.put(
            'intent_default_choice',
            JSON.stringify(this.intent_default_choice),
          );
        }

        return;
      }
    }

    throw new BadRequestException('Default choice not exists', {
      cause: new Error(),
    });
  }

  async deleteDefaultChoice(id: string) {
    const index = this.intent_default_choice.findIndex((a) => a.id == id);
    if (index < 0) {
      throw new BadRequestException('Default choice not exists', {
        cause: new Error(),
      });
    }
    this.intent_default_choice.splice(index, 1);
    if (this._db) {
      await this._db.put(
        'intent_default_choice',
        JSON.stringify(this.intent_default_choice),
      );
    }
  }

  async matchDefaultChoice(intent: Intent): Promise<IntentFilter> {
    for (const i of this.intent_default_choice) {
      if (i.match(intent)) {
        return i;
      }
    }

    return null;
  }

  async initIntentFilter(apps: AppInfo[]) {
    if (this.filters.length != 0) {
      this.logger.debug('intentFilter alread inited');
      return;
    }

    let adminCosole = null;
    const video = 'home';
    for (const app of apps) {
      console.log(app.id);
      if (app.id.startsWith('monitoring')) {
        adminCosole = app.id;
      }
      // else if (app.id.startsWith('edge-desktop')) {
      //   video = app.id;
      // }
    }
    console.log('video ' + video);

    await this.registerIntenFilter(
      new IntentFilter({
        router_id: video,
        actions: [Action.ACTION_VIEW],
        categories: [Category.CATEGORY_VIDEO],
      }),
    );

    await this.registerIntenFilter(
      new IntentFilter({
        router_id: video,
        actions: [Action.ACTION_VIEW],
        categories: [Category.CATEGORY_LAUNCHER],
      }),
    );

    await this.registerIntenFilter(
      new IntentFilter({
        router_id: adminCosole,
        actions: [Action.ACTION_VIEW],
        categories: [Category.CATEGORY_CONTAINER_LOG],
        // data: {
        //   deployment: 'deployment',
        //   container: 'container',
        // },
      }),
    );

    // await this.registerIntenFilter(
    //   new IntentFilter({
    //     router_id: video,
    //     actions: [Action.ACTION_EDIT],
    //     categories: [Category.CATEGORY_LAUNCHER],
    //   }),
    // );

    // await this.appService.registerIntenFilter(
    //   new IntentFilter({
    //     router_id: adminCosole,
    //     actions: [Action.ACTION_VIEW],
    //     categories: [Category.CATEGORY_CONTAINER_LOG],
    //     data: {
    //       statefulset: 'statefulset',
    //       container: 'container',
    //     },
    //   }),
    // );

    // await this.appService.registerIntenFilter(
    //   new IntentFilter({
    //     router_id: adminCosole,
    //     actions: [Action.ACTION_VIEW],
    //     categories: [Category.CATEGORY_CONTAINER_LOG],
    //     data: {
    //       daemonset: 'daemonset',
    //       container: 'container',
    //     },
    //   }),
    // );
  }
}
