export interface shieldItem {
  metric?: string;
  res_filters?: string;
  tags_filters?: string;
  cause: string;
  create_at: number;
  create_by: string;
  etime: number;
  btime: number;
  id: number;
}

export enum FormType {
  'add' = 'add',
  'edit' = 'edit',
}

export interface shieldDetail {
  metric?: string;
  res_filters?: string[];
  tags_filters?: string[];
  cause: string;
  create_at: number;
  create_by: string;
  etime: number;
  id: number;
  btime: number;
}
