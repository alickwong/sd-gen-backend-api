import {IsString, IsNotEmpty} from 'class-validator';
import {InstanceType} from '../enum/InstanceType'
import {InstanceCapacityType} from "../enum/InstanceCapacityType";


export class CreateInstancePost {
  // @IsString()
  // @IsNotEmpty()
  readonly webuiType: string;

  @IsString()
  @IsNotEmpty()
  readonly instanceType: InstanceType;

  @IsString()
  @IsNotEmpty()
  readonly instanceCapacityType: InstanceCapacityType;
}