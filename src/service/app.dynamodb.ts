import {Injectable} from '@nestjs/common';
import {DynamoDB, CreateTableCommand, CreateTableInput} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  PutCommandInput,
  DeleteCommand,
  DeleteCommandInput,
  UpdateCommand,
  UpdateCommandInput,
  GetCommand,
  GetCommandInput, QueryCommandInput, QueryCommand, UpdateCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import {InstanceRecord} from 'src/interface/InstanceRecord';
import {PortUsage} from 'src/interface/PortUsage';
import * as process from "process";
import { restrictedPorts } from 'src/config/restrictedPorts';

@Injectable()
export class DynamodbService {

  private _client: DynamoDB;
  private _docClient: DynamoDBDocumentClient;

  private _instanceRecordTableName;
  private _portUsageTableName;


  constructor() {
    this._instanceRecordTableName = 'sg-gen-instances';
    this._portUsageTableName = 'sd-gen-port';

    if (process.env.UNIT_TEST) {
      this._instanceRecordTableName = 'unit-test-' + this._instanceRecordTableName;
      this._portUsageTableName = 'unit-test-' + this._portUsageTableName;
    }

    const marshallOptions = {
      // Whether to automatically convert empty strings, blobs, and sets to `null`.
      convertEmptyValues: false, // false, by default.
      // Whether to remove undefined values while marshalling.
      removeUndefinedValues: false, // false, by default.
      // Whether to convert typeof object to map attribute.
      convertClassInstanceToMap: false, // false, by default.
    };

    const unmarshallOptions = {
      // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
      wrapNumbers: false, // false, by default.
    };

    const translateConfig = {marshallOptions, unmarshallOptions};

    this._client = new DynamoDB({});
    this._docClient = DynamoDBDocumentClient.from(this._client, translateConfig);

  }

  public async createDDBTable(userId: number, instanceId: string, port: number) {
    let instanceKey = `userid-${userId}-instance-${instanceId}`;
    const command = new CreateTableCommand({
      TableName: this._instanceRecordTableName,
      AttributeDefinitions: [
        {
          AttributeName: "instanceId",
          AttributeType: "S",
        },
      ],
      KeySchema: [
        {
          AttributeName: "instanceId",
          KeyType: "HASH",
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10,
      },
    });

    let result = await this._docClient.send(command);
    console.log(result);
  }

  public async addInstanceRecord(userId: string, instanceId: string, port: number, username: string, password: string) {
    let putCommandInput: PutCommandInput = {
      TableName: this._instanceRecordTableName,
      Item: {
        userId: userId.toString(),
        instanceId: instanceId,
        port: port,
        createdAt: Date.now(),
        username: username,
        password: password,
        instanceStatus: 'pending'
      }
    }

    let result = await this._docClient.send(
      new PutCommand(putCommandInput)
    );

    return instanceId;
  }

  public async updateInstanceStatus(instanceId: string, instanceStatus: string, heartbeatAt?: number): Promise<[string, string]> {
    let item = await this.getInstanceByInstanceId(instanceId);
    if (!item) {
      return ['', 'item not found'];
    }

    if (!heartbeatAt) {
      heartbeatAt = Date.now();
    }

    let commandInput: UpdateCommandInput = {
      TableName: this._instanceRecordTableName,
      Key: {
        instanceId,
        userId: item.userId
      },
      UpdateExpression: "set instanceStatus = :status, heartbeatAt = :now",
      ExpressionAttributeValues: {
        ":status": instanceStatus,
        ":now": heartbeatAt,
      },
    }

    let result: UpdateCommandOutput = await this._docClient.send(
      new UpdateCommand(commandInput)
    );

    if (result.$metadata.httpStatusCode !== 200) {
      return ['', 'update not success'];
    }

    return [instanceId, ''];
  }

  public async deleteInstanceRecord(instanceRecord: InstanceRecord) {
    let command: DeleteCommandInput = {
      TableName: this._instanceRecordTableName,
      Key: {
        instanceId: instanceRecord.instanceId,
        userId: instanceRecord.userId
      }
    }

    let result = await this._docClient.send(
      new DeleteCommand(command)
    );
    console.log(result);
  }

  public async getInstanceRecordList(userId: string): Promise<InstanceRecord[]> {
    // TODO: and not deleted
    let command: QueryCommandInput = {
      TableName: this._instanceRecordTableName,
      KeyConditionExpression:
        "userId= :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
      IndexName: 'userId-index'
    }

    let result = await this._docClient.send(
      new QueryCommand(command)
    );

    let items = result.Items as InstanceRecord[];
    return items;
  }

  public async getInstanceByInstanceId(instanceId: string): Promise<InstanceRecord> {
    let command: QueryCommandInput = {
      TableName: this._instanceRecordTableName,
      KeyConditionExpression:
        "instanceId = :instanceId",
      ExpressionAttributeValues: {
        ":instanceId": instanceId,
      },
    }

    let result = await this._docClient.send(
      new QueryCommand(command)
    );

    let items = result.Items as InstanceRecord[];
    return items[0];
  }

  // TODO: write better port get logic
  public async getUnusedPort() {
    // TODO: change to query by page
    let command: QueryCommandInput = {
      TableName: this._portUsageTableName,
      KeyConditionExpression:
        "instanceType = :instanceType AND port > :port",
      ExpressionAttributeValues: {
        ':instanceType': 'automatic1111',
        ":port": 0,
      },
    }

    let result = await this._docClient.send(
      new QueryCommand(command)
    );

    let portMap = {};
    let data = result.Items.map((x: PortUsage) => {
      portMap[x.port] = 1;
    });

    let unusedPort = 80;
    for (let i = 80; i < 10000; i++) {
      if(restrictedPorts.indexOf(i) !== -1) {
        continue;
      }

      if (!portMap[i]) {
        unusedPort = i;
        break;
      }
    }

    return +unusedPort;
  }

  public async getPortRecord(port: number) {
    let command: QueryCommandInput = {
      TableName: this._portUsageTableName,
      KeyConditionExpression:
        "instanceType = :instanceType AND  port = :port",
      ExpressionAttributeValues: {
        ':instanceType': 'automatic1111',
        ":port": port,
      },
    }

    let result = await this._docClient.send(
      new QueryCommand(command)
    );

    let items = result.Items as InstanceRecord[];
    return items[0];
  }

  public async reservePort(port: number, instanceId: string) {
    let record = await this.getPortRecord(port);
    if (record) {
      return {
        isSuccess: false,
        message: 'record is exist'
      }
    }

    let portRecord: PortUsage = {
      port,
      createdAt: Date.now(),
      instanceId,
      instanceType: 'automatic1111'
    };

    let putCommandInput: PutCommandInput = {
      TableName: this._portUsageTableName,
      Item: {
        ...portRecord
      }
    }

    let result = await this._docClient.send(
      new PutCommand(putCommandInput)
    );

    console.log(result);

    return {
      isSuccess: true,
      message: 'record created'
    }

  }

  /**
   *
   * @return onlyDeleteClusterResources
   *  DB do not have record, but exist in k8s, need to be delete
   * @return instanceIdList
   *  idle instance
   */
  public async checkIdleInstance(instanceIdList: string[]): Promise<{
    instanceIdToBeTerminate: InstanceRecord[],
    onlyDeleteClusterResources: string[],
  }> {
    let idleDurationConfig = 60 * 60 * 1000 * 2; // 2hours
    let instanceIdToBeTerminate: InstanceRecord[] = []
    let onlyDeleteClusterResources = []
    for (let i = 0; i < instanceIdList.length; i++) {
      let currentInstanceId = instanceIdList[i];
      let instanceRecord = await this.getInstanceByInstanceId(currentInstanceId);

      // Record not exist
      if (!instanceRecord) {
        onlyDeleteClusterResources.push(currentInstanceId);
        continue;
      }

      // If do not have update
      let startTime = (Date.now() - instanceRecord.createdAt) / 1000;
      let isOpenTooLongWithoutUser = startTime > 60 * 30; // 30mins
      if (!instanceRecord.heartbeatAt && isOpenTooLongWithoutUser) {
        instanceIdToBeTerminate.push(instanceRecord)
        continue;
      }

      // if idle for 30 mins
      let now = Date.now();
      let idleTime = now - instanceRecord.heartbeatAt;
      if (idleTime > idleDurationConfig) {
        instanceIdToBeTerminate.push(instanceRecord);
        continue;
      }
    }

    return {
      instanceIdToBeTerminate,
      onlyDeleteClusterResources
    }
  }
}
