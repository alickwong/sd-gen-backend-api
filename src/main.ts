import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger';
import {ValidationPipe} from "@nestjs/common";
import { HttpExceptionFilter } from './filter/http-exception.filter';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  // TODO: should be more strict
  app.enableCors({
    origin: /.*/,
    methods: ['GET', 'HEAD', 'PUT', 'POST', 'OPTIONS', 'DELETE'],
    allowedHeaders: 'Access-Control-Allow-Origin, Access-Control-Allow-Headers, Origin, Authorization, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
    preflightContinue: false,
    optionsSuccessStatus: 200,
  });

  const config = new DocumentBuilder()
    .setTitle('SD Gen')
    .setDescription('The SD Gen API description')
    .setVersion('1.0')
    .addTag('SD Gen')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  await app.listen(3000);
}

bootstrap();
