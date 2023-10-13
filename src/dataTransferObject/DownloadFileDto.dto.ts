import {IsString, IsNotEmpty, IsUrl} from 'class-validator';
import {Auto11FileType} from "../enum/Auto11FileType";

export class DownloadFileDto{
  @IsUrl()
  @IsNotEmpty()
  readonly fileType: Auto11FileType;

  @IsString()
  @IsNotEmpty()
  readonly url: string;
}