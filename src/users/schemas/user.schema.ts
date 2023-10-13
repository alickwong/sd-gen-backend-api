import {Model, Schema, model} from 'mongoose';
import now = jest.now;

// 1. Create an interface representing a document in MongoDB.
export interface ISdUser {
  name: string;
  userId: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  workspaceId: number;
  freeCredit: number;
  paidCredit: number;
  avatar?: string;
}

export interface SdUserModel extends Model<ISdUser> {
  myStaticMethod(): number;
}

// 2. Create a Schema corresponding to the document interface.
export const userSchema = new Schema<ISdUser>({
  name: {type: String, required: true},
  email: {type: String, required: true},
  userId: {type: String, required: true},
  createdAt: {type: Date, required: true, default: now()},
  updatedAt: {type: Date, required: true, default: now()},
  workspaceId: {type: Number, required: true, default: 9},
  freeCredit: {type: Number, required: true, default: 10},
  paidCredit: {type: Number, required: true, default: 0},
  avatar: String
});

// 3. Create a Model.
export const SdUser = model<ISdUser>('User', userSchema);