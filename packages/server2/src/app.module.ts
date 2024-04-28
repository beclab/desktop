import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { IntentController } from './intent.controller';
import { IntentService } from './intent.service';
import { VideoController } from './video.controller';
import { WebSocketController } from './websocket.controller';
import { BFLModule } from './bfl/bfl.module';
import { NotificationController } from './notification.controller';
import { InitController } from './init.controller';
import { DataStoreService } from './datastore.service';
import { DataStoreController } from './datastore.controller';
import { AppService } from './app.service';

@Module({
  imports: [BFLModule],
  controllers: [
    AppController,
    IntentController,
    VideoController,
    NotificationController,
    WebSocketController,
    InitController,
    DataStoreController,
  ],
  providers: [IntentService, DataStoreService, AppService],
})
export class AppModule {}
