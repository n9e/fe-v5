export interface subscribeItem {
  tags: any[];
  user_groups: IuserItem[];
  rule_name: string;
  rule_id: number;
  create_at?: number;
  create_by?: string;
  update_by: string;
  etime: number;
  btime: number;
  id: number;
  group_id?: number;
  cluster: string;
  redefine_severity?: number;
  redefine_channels?: number;
  user_group_ids?: string;
  new_channels: string;
}

interface IuserItem {
  id: number;
  name: string;
  note?: string;
  create_at?: number;
  create_by?: string;
  update_at?: number;
  update_by?: string;
}

// export interface shieldDetail {
//   cause: string;
//   create_at?: number;
//   create_by?: string;
//   etime: number;
//   id: number;
//   btime: number;
//   tags: any[];
// }

export interface IState {
  curShieldData: subscribeItem
}