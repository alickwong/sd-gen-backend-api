import {Test, TestingModule} from '@nestjs/testing';
import {AppController} from '../../src/controller/app.controller';
import {DynamodbService} from "../../src/service/app.dynamodb";
import request from 'supertest';
import {AppModule} from "../../src/app.module";
import {INestApplication, ValidationPipe} from "@nestjs/common";

jest.setTimeout(90 * 1000);


describe('AppController', () => {
  let appController: AppController;
  let app: INestApplication;


  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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
      let instanceId = 'w0xunz0jzp';
      let userId = '123123';
      let service = new DynamodbService();
      await service.updateInstanceStatus(instanceId, userId, Date.now() - 60 * 35 * 1000);

      let result = await request(app.getHttpServer())
        .get('/cron/checkIdleInstance')
        .send();
      console.log(result.body);
      // expect(appController.getHello()).toBe('Hello World!');
    });

  });

  afterAll(async () => {
    await app.close();
  });
});
