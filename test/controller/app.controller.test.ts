import {Test, TestingModule} from '@nestjs/testing';
import {AppController} from '../../src/controller/app.controller';
import {DynamodbService} from "../../src/service/app.dynamodb";
import request from 'supertest';
import {AppModule} from "../../src/app.module";
import {INestApplication, ValidationPipe} from "@nestjs/common";



describe('AppController', () => {
  let appController: AppController;
  let dynamodbService: DynamodbService;
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
      let result = await request(app.getHttpServer())
        .get('/api/instance/list')
        .send();
      console.log(result.body);
      // expect(appController.getHello()).toBe('Hello World!');
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
