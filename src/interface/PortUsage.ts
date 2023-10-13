import {InstanceStatus} from '../enum/InstanceStatus';

export interface PortUsage{
  instanceType: string
  port: number,
  createdAt: number,
  instanceId: string,
}