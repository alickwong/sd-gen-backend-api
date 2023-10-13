import {Injectable} from '@nestjs/common';
import {Schema, model, connect} from 'mongoose';
import config from 'config';
import {Mongoose} from "mongoose";


@Injectable()
export class MongodbService {
  private connection: Mongoose;

  public async connect() {
    let connectionString = process.env.MONGODB_CONNECTION_STRING;
    this.connection = await connect(connectionString);
  }

  public getConnection() {
    return this.connection;
  }

  public async startSession() {
    return this.connection.startSession();
  }
}
