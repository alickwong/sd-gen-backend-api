import {FileService} from "../../src/service/file.service";
import {Auto11FileType} from "../../src/enum/Auto11FileType";

jest.setTimeout(90 * 1000);

describe('File Service Test', () => {
  beforeEach(async () => {
    // will skip the auth middleware check
    process.env.NODE_ENV = 'development';
    process.env.UNIT_TEST = '1';
  });

  it('wrong protocal', async () => {
    let appService = new FileService();
    let url = 'http://github.com/AlUlkesh/stable-diffusion-webui-images-browser';
    let result = await appService.downloadFile(Auto11FileType.extension, url);
    expect(result.isSuccess).toStrictEqual(false);
    expect(result.message).toMatch(/(https)/i);
  });


  it('wrong domain', async () => {
    let appService = new FileService();
    let url = 'https://github-xxx.com/AlUlkesh/stable-diffusion-webui-images-browser';
    let result = appService.downloadFile(Auto11FileType.extension, url);
    expect(result.isSuccess).toStrictEqual(false);
    expect(result.message).toMatch(/(github)/i);
  });

  it('remove extension', async () => {
    let appService = new FileService();
    let url = 'https://github.com/AlUlkesh/stable-diffusion-webui-images-browser';
    let {urlObj} = appService.isValidUrl(url);
    appService.removeExtension(Auto11FileType.extension, urlObj)

    let result = appService.downloadFile(Auto11FileType.extension, url);
    expect(result.isSuccess).toStrictEqual(true);

    // Duplicate download
    let result2 = appService.downloadFile(Auto11FileType.extension, url);
    expect(result2.isSuccess).toStrictEqual(false);
    expect(result2.message).toMatch(/(already exist)/i);
  });

  it('incorrect domain', async () => {
    let appService = new FileService();
    let url = 'https://civitai-xx.com/api/download/models/105215';

    let result = appService.downloadFile(Auto11FileType.model, url);
    expect(result.isSuccess).toStrictEqual(false);
    expect(result.message).toMatch(/(civitai)/i);
  });

  it('download model', async () => {
    let appService = new FileService();
    let url = 'https://civitai.com/api/download/models/105215';

    let result = appService.downloadFile(Auto11FileType.model, url);
    expect(result.isSuccess).toStrictEqual(true);
  });
});