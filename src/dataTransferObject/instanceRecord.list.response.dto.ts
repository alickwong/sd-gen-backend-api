import {InstanceRecord} from "../interface/InstanceRecord";

export class InstanceRecordListResponseDto{
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