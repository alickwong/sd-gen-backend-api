import {Body, Controller, Get, Post, Req, Delete, Param, HttpException, HttpStatus} from '@nestjs/common';
import {UsersService} from './users.service';
import {SdAuthRequest} from "../interface/SdAuthRequest";

@Controller('user')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
  ) {
  }

  @Get('login')
  login(@Req() request: SdAuthRequest): string {
    return this.userService.getHello();
  }
}
