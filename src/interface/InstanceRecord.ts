import {InstanceStatus} from '../enum/InstanceStatus';

export interface InstanceRecord {
  port: number,
  password: string,
  userId: string,
  createdAt: number,
  heartbeatAt: number
  instanceId: string,
  username: string,
  instanceStatus: InstanceStatus
}