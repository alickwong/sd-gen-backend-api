import {Body, Controller, Get, Post, Req, Delete, Param, Query} from '@nestjs/common';
import {AppService} from '../service/app.service';
import {InferenceService} from "../service/inference.service";
import {InstanceService} from "../service/instance.service";
import {DynamodbService} from "../service/app.dynamodb";
import {InstanceStatus} from "../enum/InstanceStatus";
import {SdAuthRequest} from "../interface/SdAuthRequest";

@Controller('public')
export class PublicController {
  constructor(
    private readonly appService: AppService,
    private readonly inferenceService: InferenceService,
    private readonly helmService: InstanceService,
    private readonly dynamodbService: DynamodbService
  ) {
  }

  // heartbeat for the instance
  @Get('webui/heartbeat/:instanceId')
  async heartbeat(@Param('instanceId') instanceId: string): Promise<string> {
    let [result, message] = await this.dynamodbService.updateInstanceStatus(instanceId, InstanceStatus.UserLoggedIn);
    console.log(result, message);
    return result ? result : message;
  }

  @Get('webui/instanceStarted/:instanceId')
  async instanceStarted(@Param('instanceId') instanceId: string, @Query('status') instanceStatus: string): Promise<string> {
    // Check if the status exist
    // if() {
    //
    // }

    let [result, message] = await this.dynamodbService.updateInstanceStatus(instanceId, instanceStatus);
    console.log(result, message);
    return result ? result : message;
  }
}
