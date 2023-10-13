import {Schema, model} from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
export interface ISDVolume {
  userIdList: string[];
  size: number; // in GB
  storageClass: string
}

// 2. Create a Schema corresponding to the document interface.
export const volumeSchema = new Schema<ISDVolume>({
  userIdList: {type: [String], required: true},
  size: {type: Number, required: true},
  storageClass: {type: String, required: true},
});

// 3. Create a Model.
export const SDVolume = model<ISDVolume>('SDVolme', volumeSchema);