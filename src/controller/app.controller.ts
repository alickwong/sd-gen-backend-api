import {Body, Controller, Get, Post, Req, Delete, Param, HttpException, HttpStatus} from '@nestjs/common';
import {AppService} from '../service/app.service';
import {DeleteInstanceRecordDto} from "../dataTransferObject/DeleteInstanceRecordDto.dto";
import {InstanceService} from "../service/instance.service";
import {DynamodbService} from "../service/app.dynamodb";
import {SdAuthRequest} from "../interface/SdAuthRequest";
import {InstanceRecordListResponseDto} from "../dataTransferObject/instanceRecord.list.response.dto";
import {InstanceRecordCreateResponseDto} from "../dataTransferObject/instanceRecord.create.response.dto";
import {FileService} from "../service/file.service";
import {DownloadFileDto} from "../dataTransferObject/DownloadFileDto.dto";
import {CreateInstancePost} from "../dataTransferObject/CreateInstancePost.dto";
import {InstanceCapacityType} from "../enum/InstanceCapacityType";
import {InstanceType} from "../enum/InstanceType";

@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly instanceService: InstanceService,
    private readonly dynamodbService: DynamodbService,
    private readonly fileService: FileService
  ) {
  }

  @Get()
  getHello(@Req() request: SdAuthRequest): string {
    return this.appService.getHello();
  }

  // request new instance
  @Post('instance')
  async createNewInstance(@Req() request: SdAuthRequest, @Body() createInstancePostDto: CreateInstancePost): Promise<InstanceRecordCreateResponseDto> {
    if(!Object.values(InstanceCapacityType).includes(createInstancePostDto.instanceCapacityType)) {
      throw new HttpException('input capacityType incorrect', HttpStatus.BAD_REQUEST);
    }

    if(!Object.values(InstanceType).includes(createInstancePostDto.instanceType)) {
      throw new HttpException('input instanceType incorrect', HttpStatus.BAD_REQUEST);
    }

    let instanceId = this.instanceService.getRandomInstanceId();
    let unusedPort = await this.dynamodbService.getUnusedPort();
    await this.dynamodbService.reservePort(unusedPort, instanceId);
    let userName = 'webui';
    let password = this.instanceService.getRandomInstanceId();

    // let result = this.instanceService.deployNewInstance(request.userId, instanceId, unusedPort, userName, password);
    let result = this.instanceService.helmInstall({
      instanceId,
      userId: request.userId,
      webuiLoginName: userName,
      webuiLoginPassword: password,
      ingressListenPort: unusedPort,
      instanceType: createInstancePostDto.instanceType.split('.')[1],
      capacityType: createInstancePostDto.instanceCapacityType,
      ociPath: 'oci://331102492406.dkr.ecr.ap-northeast-1.amazonaws.com/webui-automatic1111-chart',
      chartVersion: '0.1.3',
      // TODO: change this to dynamic setting
      pvcName: 'madhead-data-pvc',
      // pvcName: 'alick-pvc',
      imageUrl: '331102492406.dkr.ecr.ap-northeast-1.amazonaws.com/sd-gen-webui-automatic1111:b0fc1972',
      // imageUrl: 'nginx'
    });
    let recordResult = await this.dynamodbService.addInstanceRecord(request.userId, instanceId, unusedPort, userName, password);

    console.log('create instance', request.userId, instanceId);
    return {
      instanceId
    };
  }

  // remove a instance
  @Delete('instance')
  async deleteInstance(@Req() request: SdAuthRequest, @Body() deleteInstanceDto: DeleteInstanceRecordDto): Promise<string> {
    console.log('delete instance', deleteInstanceDto);
    if (!deleteInstanceDto.instanceId) {
      throw new HttpException('input incorrect', HttpStatus.NOT_FOUND);
    }

    let instanceRecord = await this.dynamodbService.getInstanceByInstanceId(deleteInstanceDto.instanceId);
    if (!instanceRecord) {
      throw new HttpException('instance not found', HttpStatus.NOT_FOUND);
    }
    console.log('instance found', instanceRecord.instanceId);

    // let result = await this.instanceService.deleteInstance(deleteInstanceDto.instanceId);
    let result = await this.instanceService.helmUnInstall(deleteInstanceDto.instanceId);
    let deleteResult = await this.dynamodbService.deleteInstanceRecord(instanceRecord);

    // TODO: remove port information

    return 'done';
  }

  // list all my sd instance
  @Get('instance/list')
  async listInstance(@Req() request: SdAuthRequest): Promise<InstanceRecordListResponseDto> {
    console.log(request.userId, request.url);
    let result = await this.dynamodbService.getInstanceRecordList(request.userId);

    return {
      total: result.length,
      pageIndex: 1,
      pageSize: 10,
      data: result,
      query: '',
      sort: {
        order: '',
        key: '',
      },
    };
  }

  @Post('file/automatic1111')
  async manageFiles(@Req() request: SdAuthRequest, @Body() downloadFileDto: DownloadFileDto) {
    console.log(request.body, request.url);
    let result = this.fileService.downloadFile(downloadFileDto.fileType, downloadFileDto.url);
    // if(!result.isSuccess) {
    //   throw new HttpException(result.message, HttpStatus.NOT_ACCEPTABLE);
    // }

    // return result;
    return 'done';
  }
}
