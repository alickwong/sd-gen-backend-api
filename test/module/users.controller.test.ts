import {Test, TestingModule} from '@nestjs/testing';
import {UsersController} from '../../src/users/users.controller';
import request from 'supertest';
import {UsersModule} from "../../src/users/users.module";
import {INestApplication, ValidationPipe} from "@nestjs/common";


describe('UserController', () => {
  let appController: UsersController;
  let app: INestApplication;


  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile();

    // will skip the auth middleware check
    process.env.NODE_ENV = 'development';
    process.env.UNIT_TEST = '1';

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('root', () => {
    it('should return "Hello World!"', async () => {
      let result = await request(app.getHttpServer())
        .get('/user/login')
      expect(result.text).toBe('Hello in user service!');
    });

    it('delete instance', async () => {
      let result = await request(app.getHttpServer())
        .delete('/api/instance')
        .send({
          userId: '123123',
          instanceId: 'xth3aeeq4n'
        });
      console.log(result.body);
      // expect(appController.getHello()).toBe('Hello World!');
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
