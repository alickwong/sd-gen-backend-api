import {IsString, IsNotEmpty} from 'class-validator';

export class DeleteInstanceRecordDto {
  @IsString()
  @IsNotEmpty()
  readonly instanceId: string;
}