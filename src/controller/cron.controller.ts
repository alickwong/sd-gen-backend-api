import {Body, Controller, Get, Post, Req, Delete, Param} from '@nestjs/common';
import {AppService} from '../service/app.service';
import {InferenceService} from "../service/inference.service";
import {Txt2ImgDto} from "../dataTransferObject/txt2Img.dto";
import {InstanceService} from "../service/instance.service";
import {DynamodbService} from "../service/app.dynamodb";
import {InstanceStatus} from "../enum/InstanceStatus";
import {SdAuthRequest} from "../interface/SdAuthRequest";

@Controller('cron')
export class CronController {
  constructor(
    private readonly appService: AppService,
    private readonly inferenceService: InferenceService,
    private readonly instanceService: InstanceService,
    private readonly dynamodbService: DynamodbService
  ) {
  }

  // check idle instance and remove it
  @Get('/checkIdleInstance')
  async checkIdleInstances() {
    // Get all id from k8s deployment
    let deploymentInfo = this.instanceService.getWebUIDeploymentList();
    let instanceIdList = deploymentInfo.map(x => x.instanceId);
    let {
      instanceIdToBeTerminate,
      onlyDeleteClusterResources
    } = await this.dynamodbService.checkIdleInstance(instanceIdList);

    for (let i = 0; i < instanceIdToBeTerminate.length; i++) {
      let record = instanceIdToBeTerminate[i];
      let result = await this.instanceService.helmUnInstall(record.instanceId);
      let deleteResult = await this.dynamodbService.deleteInstanceRecord(record);
    }

    for (let i = 0; i < onlyDeleteClusterResources.length; i++) {
      let instanceId = onlyDeleteClusterResources[i];
      let result = await this.instanceService.helmUnInstall(instanceId);
    }

    return {
      instanceIdToBeTerminateCount: instanceIdToBeTerminate.length,
      onlyDeleteClusterResourcesCount: onlyDeleteClusterResources.length
    };
  }
}
