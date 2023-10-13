import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    let responseObject = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      stackTrace: null,
    };

    if(process.env.DEBUG) {
      responseObject.stackTrace = exception.stack
      console.log(responseObject);
    }

    response
      .status(status)
      .json(responseObject);
  }
}