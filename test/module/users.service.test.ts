import {Test, TestingModule} from '@nestjs/testing';
import {UsersService} from "../../src/users/users.service";
import {MongodbService} from "../../src/service/mongodb.service";
import {SdUser} from "../../src/users/schemas/user.schema";
import {UsersModule} from "../../src/users/users.module";
import {ValidationPipe} from "@nestjs/common";

jest.setTimeout(90 * 1000);


describe('AppController', () => {
  let userService;
  beforeAll(async () => {
    let mongodbService = new MongodbService();
    await mongodbService.connect();
    userService = new UsersService(mongodbService);
  });

  it('should return "Hello World!"', async () => {
    let user = await userService.createUser({
      name: 'aaaa',
      userId: '113',
      email: 'xxxx@gmail.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      workspaceId: 0,
      freeCredit: 100,
      paidCredit: 0,
      avatar: 'asdfasdfasdf'
    });
    console.log(user);
  });

  it('Query by UserId', async () => {
    let user = await userService.findByUserId('asdfasdfasdfasdfdd')
    console.log(user);
  });
});
