export interface BusiGroupItem {
  id: number;
  name: string;
  user_groups: object | null;
  create_at: number;
  create_by: string;
  update_at: number;
  update_by: string;
}

export interface CommonStoreState {
  clusters: string[];
  busiGroups: BusiGroupItem[];
  curBusiItem: BusiGroupItem;
}
