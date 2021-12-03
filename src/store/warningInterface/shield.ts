export interface shieldItem {
  tags: any[];
  cause: string;
  create_at?: number;
  create_by?: string;
  etime: number;
  btime: number;
  id: number;
  group_id?: number;
  cluster: string;
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

export interface IshieldState {
  curShieldData: shieldItem
}