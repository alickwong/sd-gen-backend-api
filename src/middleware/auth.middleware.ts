import {HttpException, HttpStatus, Injectable, NestMiddleware} from '@nestjs/common';
import {Request, Response, NextFunction} from 'express';
import {SdAuthRequest} from "../interface/SdAuthRequest";
import {AuthService} from "../service/auth.service";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: SdAuthRequest, res: Response, next: NextFunction) {
    let authService = new AuthService();

    if (process.env.NODE_ENV === 'development' && process.env.UNIT_TEST === '1') {
      let body = req.body as any;
      if (!body.userId) {
        throw new HttpException(
          'on development and unit test mode, you need to attach userId in api request',
          HttpStatus.FORBIDDEN);
      }
      // req.userId = req.text();
    } else {
      console.log('jwt is exist:', !req.headers['authorization']);
      if (!req.headers['authorization']) {
        console.log('headers', req.headers);
        throw new HttpException('jwt not exist',
          HttpStatus.FORBIDDEN);
      }

      let jwt = req.headers['authorization'].split(' ')[1];
      if (!jwt) {
        throw new HttpException('jwt not exist',
          HttpStatus.FORBIDDEN);
      }
      let result = await authService.verifyJwt(jwt);
      if (!result) {
        throw new HttpException('invalid jwt',
          HttpStatus.FORBIDDEN);
      }

      req.userId = result.username;
    }

    next();
  }
}
