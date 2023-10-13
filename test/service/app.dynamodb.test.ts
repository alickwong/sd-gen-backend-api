import {Test, TestingModule} from '@nestjs/testing';
import {DynamodbService} from "../../src/service/app.dynamodb";
import {InstanceStatus} from "../../src/enum/InstanceStatus";

jest.setTimeout(90 * 1000);

describe('Dynamodb Service Test', () => {
  beforeEach(async () => {
    // will skip the auth middleware check
    process.env.NODE_ENV = 'development';
    process.env.UNIT_TEST = '1';
  });

  it('Create Table', async () => {
    let appService = new DynamodbService();
    let userId = 123123;
    let instanceId = "200";

    await appService.createDDBTable(userId, instanceId, 82);
  });


  it('Add Instance Record to DDB', async () => {
    let appService = new DynamodbService();
    let userId = '123123';
    let instanceHash = "300";
    let instanceId = `userid-${userId}-instance-${instanceHash}`;
    console.log('test add');

    await appService.addInstanceRecord(userId, instanceId, 82, 'user', 'pass');
  });

  it('Update Instance Status', async () => {
    let appService = new DynamodbService();
    let instanceId = `w0xunz0jzp`;

    let result = await appService.updateInstanceStatus(instanceId, InstanceStatus.UpAndRunning);
    console.log(result);
  });

  it('delete instance', async () => {
    let appService = new DynamodbService();
    let userId = '123123';
    let instanceHash = "200";
    // let instanceId = `userid-${userId}-instance-${instanceHash}`;
    let instanceId = `xth3aeeq4n`;
    let instanceRecord = await appService.getInstanceByInstanceId(instanceId);

    await appService.deleteInstanceRecord(instanceRecord);
  });

  it('get instance records', async () => {
    let appService = new DynamodbService();
    let userId = '123123';
    await appService.getInstanceRecordList(userId);
  });

  it('get instance by instanceId', async () => {
    let appService = new DynamodbService();
    let userId = '123123';
    let instanceHash = "300";
    let instanceId = `userid-${userId}-instance-${instanceHash}`;
    let result = await appService.getInstanceByInstanceId(instanceId);
    console.log(result);
  });

  it('get unused port', async () => {
    let appService = new DynamodbService();
    let result = await appService.getUnusedPort();
    console.log(result);
  });

  it('reserve port', async () => {
    let appService = new DynamodbService();
    let userId = '123123';
    let instanceHash = "300";
    let instanceId = `userid-${userId}-instance-${instanceHash}`;
    let result = await appService.reservePort(80, instanceId);
    console.log(result);
  });
});

describe('Dynamodb Service Idle Check', () => {
  let appService: DynamodbService;
  let userId: string;
  let instanceId: string;
  let notExistId: string;

  beforeEach(async () => {
    // will skip the auth middleware check
    process.env.NODE_ENV = 'development';
    process.env.UNIT_TEST = '1';

    appService = new DynamodbService();
    userId = '123123';
    instanceId = 'testing';
    notExistId = 'asdfasdfasdfa';
  });


  it('if id not exist, should appear in onlyDeleteClusterResources', async () => {
    // not exist record
    let {instanceIdToBeTerminate, onlyDeleteClusterResources} = await appService.checkIdleInstance([notExistId]);
    expect(instanceIdToBeTerminate).toStrictEqual([]);
    expect(onlyDeleteClusterResources).toStrictEqual([notExistId]);
  });

  it('if no heartbeat for new instance, should no idle', async () => {
    await appService.addInstanceRecord(userId, instanceId, 82, 'user', 'pass');
    let {instanceIdToBeTerminate, onlyDeleteClusterResources} = await appService.checkIdleInstance([instanceId]);
    expect(instanceIdToBeTerminate).toStrictEqual([]);
    expect(onlyDeleteClusterResources).toStrictEqual([]);
    console.log(instanceIdToBeTerminate);
  });

  it('if heartbeatAt is too old should terminate it', async () => {
    await appService.addInstanceRecord(userId, instanceId, 82, 'user', 'pass');
    let result = await appService.updateInstanceStatus(instanceId, InstanceStatus.UpAndRunning, Date.now() - 30 * 60 * 1000);
    let {instanceIdToBeTerminate, onlyDeleteClusterResources} = await appService.checkIdleInstance([instanceId]);
    expect(instanceIdToBeTerminate.length).toStrictEqual(1);
    expect(onlyDeleteClusterResources).toStrictEqual([]);
  });
});