import {Injectable, Scope} from '@nestjs/common';
import * as shell from "shelljs"
import * as fs from "fs"
import {Auto11FileType} from "../enum/Auto11FileType";

let filePath = {
  // [Auto11FileType.model]: './data/StableDiffusion',
  [Auto11FileType.model]: '/data/StableDiffusion',
  [Auto11FileType.lora]: '/data/Lora',
  [Auto11FileType.extension]: '/data/config/auto/extensions',
  // [Auto11FileType.extension]: './data/extensions',
};

@Injectable({scope: Scope.REQUEST})
export class FileService {
  getFilePath(fileType: Auto11FileType) {
    return filePath[fileType];
  }

  public isValidUrl(string) {
    try {
      let urlObj = new URL(string);
      return {
        isValid: true,
        urlObj
      };
    } catch (err) {
      return {
        isValid: true,
        urlObj: null
      };
    }
  }

  private isHttps(url: URL) {
    if (url.protocol === 'https:') {
      return true;
    }
    return false;
  }

  private isGithub(url: URL) {
    if (url.host === 'github.com') {
      return true;
    }
    return false;
  }

  private isCivitai(url: URL) {
    if (url.host === 'civitai.com') {
      return true;
    }
    return false;
  }


  private isFolderExist(folderName: string, targetLocation: string) {
    if (fs.existsSync(`${targetLocation}/${folderName}`)) {
      return true;
    }

    return false;
  }

  public getFolderName(urlObj: URL) {
    return urlObj.pathname.split('/').pop();
  }

  public removeExtension(fileType: Auto11FileType, urlObj: URL) {
    let folderName = this.getFolderName(urlObj);
    let targetLocation = this.getFilePath(fileType);
    let result = shell.exec(`cd ${targetLocation} && rm -rf ${folderName}`, {});
  }

  public downloadFile(fileType: Auto11FileType, url: string) {
    let location = this.getFilePath(fileType);
    let {isValid, urlObj} = this.isValidUrl(url);
    if (!isValid) {
      return {
        isSuccess: false,
        message: 'invalid url'
      }
    }

    let isHttps = this.isHttps(urlObj)
    if (!isHttps) {
      return {
        isSuccess: false,
        message: 'must use https'
      }
    }

    let result;
    switch (fileType) {
      case Auto11FileType.extension:
        let isGithub = this.isGithub(urlObj)
        if (!isGithub) {
          return {
            isSuccess: false,
            message: 'Extension must use github for download'
          }
        }
        let folderName = this.getFolderName(urlObj)
        let isFolderExist = this.isFolderExist(folderName, location);
        if (isFolderExist) {
          return {
            isSuccess: false,
            message: 'Extension extension already exist'
          }
        }

        result = shell.exec(`cd ${location} && git clone ${url}`, {});
        break;
      default:
        let isCivitai = this.isCivitai(urlObj)
        if (!isCivitai) {
          return {
            isSuccess: false,
            message: 'Extension must use civitai for download'
          }
        }

        result = shell.exec(`cd ${location} && wget --content-disposition ${url}`, {});
        break;
    }

    return {
      isSuccess: true,
      message: ''
    };
  }
}
