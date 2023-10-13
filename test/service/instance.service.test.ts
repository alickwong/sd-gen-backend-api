import {Test, TestingModule} from '@nestjs/testing';
import {AppService} from "../../src/service/app.service";
import {InstanceService} from "../../src/service/instance.service";
import * as shell from "shelljs"
import {AppModule} from "../../src/app.module";
import {ValidationPipe} from "@nestjs/common";

jest.setTimeout(90 * 1000);

describe('AppController', () => {
  beforeEach(async () => {
    // will skip the auth middleware check
    process.env.NODE_ENV = 'development';
    process.env.UNIT_TEST = '1';
  });

  it('should return "Hello World!"', async () => {
    let appService = new InstanceService();
    console.log(123123);
    let userId = '123123';
    let instanceHash = "300";

    // appService.deployNewInstance(userId, instanceHash, 82, 'user', 'pass');
    // shell.exec('pwd && cd ./src/webui-chart && helm install webui-chart --dry-run -o yaml ./');
    // shell.exec('pwd && cd ./src/webui-chart');
    // shell.exec('cd ./src/webui-chart && ' +
    //   'cat values.yaml | sed "s/{{USER_ID}}/' + userId + '/g" > ./values_' + userId + '.yaml', {});
    //
    // shell.exec('cd ./src/webui-chart && ' +
    //   `helm template -f values_${userId}.yaml --output-dir helmOutput . && cd helmOutput/webui-chart && kubectl apply -f ./templates/deployment.yaml`, {});

    // expect(appService.getHello()).toBe('Hello World!');
  });
  it('delete instance', async () => {
    let appService = new InstanceService();
    let userId = '123123';
    let instanceHash = "300";

    appService.helmUnInstall(instanceHash);
  });

  it('get deployment list', async () => {
    let appService = new InstanceService();
    // let ressult_1 = 'xxxtestxxx'.indexOf('test');
    // let ressult_2 = 'testxxx'.indexOf('test');
    // let ressult_3 = 'xxxxxx'.indexOf('test');

    let result = appService.getWebUIDeploymentList();
  });
});
