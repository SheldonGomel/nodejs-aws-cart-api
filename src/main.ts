import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const port = configService.get('APP_PORT') || 4000;
  const host = configService.get('APP_HOST') || 'localhost';

  app.enableCors({
    origin: (req, callback) => callback(null, true),
  });

  await app.listen(port, host, () => {
    console.log('App is running on %s host and %s port', host, port);
  });
}
bootstrap();
