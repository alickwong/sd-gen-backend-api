import {Test, TestingModule} from '@nestjs/testing';
import {AppService} from "../../src/service/app.service";

describe('AppController', () => {
  it('should return "Hello World!"', () => {
    let appService = new AppService();
    console.log(123123);
    expect(appService.getHello()).toBe('Hello World!');
  });
});
