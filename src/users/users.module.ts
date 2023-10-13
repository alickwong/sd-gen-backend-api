import {MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {UsersController} from './users.controller';
import {UsersService} from './users.service';
import {AuthMiddleware} from "../middleware/auth.middleware";
// import {User, UserSchema} from './schemas/user.schema';

@Module({
  imports: [
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer
      // .apply(AuthMiddleware)
      // .forRoutes({path: 'api/*', method: RequestMethod.ALL});
  }
}