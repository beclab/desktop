import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
//import { WsAdapter } from './ws.adapter';
import * as bodyParser from 'body-parser';
//import { WsAdapter } from '@nestjs/websockets';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //app.useWebSocketAdapter(new WsAdapter(app)); // 使用我们的适配器
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  await app.listen(3010);
}
bootstrap();
