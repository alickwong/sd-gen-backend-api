import {MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';
import {AppController} from './controller/app.controller';
import {AppService} from './service/app.service';
import {InferenceService} from "./service/inference.service";
import {InstanceService} from "./service/instance.service";
import {DynamodbService} from "./service/app.dynamodb";
import {AuthMiddleware} from "./middleware/auth.middleware";
import { CronController } from './controller/cron.controller';
import { PublicController } from './controller/public.controller';
import {AuthService} from "./service/auth.service";
import {FileService} from "./service/file.service";
import {UsersModule} from "./users/users.module";

@Module({
  imports: [UsersModule],
  controllers: [AppController, CronController, PublicController],
  providers: [AppService, InferenceService, InstanceService, DynamodbService, AuthService, FileService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({path: 'api/*', method: RequestMethod.ALL});

  }
}