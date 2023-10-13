import {InstanceRecord} from "../interface/InstanceRecord";

export class BaseResponseDto{
  status: 'success'
  total: number;
  pageIndex: number;
  pageSize: number;
  data: InstanceRecord[];
  query: string;
  sort: {
    order: string;
    key: string
  };
}