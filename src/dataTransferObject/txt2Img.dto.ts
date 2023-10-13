export class Txt2ImgDto {
  readonly prompt: string;
  readonly negative_prompt: string | undefined;
  readonly steps: number;
  readonly alwayson_scripts: any;
  readonly batch_size: number | undefined;
  readonly width: number | undefined;
  readonly height: number | undefined;
  readonly denoising_strength: number | undefined;
  readonly cfg_scale: number | undefined;
}