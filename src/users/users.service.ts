import {Injectable} from '@nestjs/common';
import {MongodbService} from "../service/mongodb.service";
import {ISdUser, SdUser, SdUserModel} from "./schemas/user.schema";
import * as assert from "assert";

@Injectable()
export class UsersService {

  constructor(
    private readonly mongodbService: MongodbService,
  ) {
  }

  public async createUser(userData: ISdUser): Promise<boolean> {
    let commitFunction = new Promise((resolve, reject) => {
      SdUser.createCollection()
        .then(() => this.mongodbService.getConnection().startSession())
        .then(async (session) => {
          session.startTransaction();

          let user = await SdUser.findOne().where('userId').equals(userData.userId).session(session);
          if (user) {
            throw new Error('user already exist');
          }

          let newUser = new SdUser(userData);
          await newUser.save({
            session
          });

          await session.commitTransaction();
          await session.endSession();
          resolve('');
        })
        .catch((error) =>{
          reject(error);
        })
    });

    let result = await commitFunction;

    return true;
  }

  public async findByUserId(userId: string): Promise<ISdUser | null> {
    return SdUser.findOne().where('userId').equals(userId);
  }

  getHello(): string {
    return 'Hello in user service!';
  }
}
