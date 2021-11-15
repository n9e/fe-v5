export interface Dashboard {
  create_by: string;
  favorite: number;
  id: number;
  name: string;
  tags: string;
  update_at: number;
  update_by: string;
  configs?: string;
}

export interface Group {
  id: number;
  name: string;
  weight: number;
  updateTime: number;
}

interface Layout {
  x: number;
  y: number;
  w: number;
  h: number;
  i: string;
}

type QLItem = {
  PromQL: string;
  Legend: string;
};

export interface ChartConfig {
  layout?: Layout;
  tags: object;
  prome_ql?: string[];
  QL: QLItem[];
  classpath_id?: number;
  classpath_prefix?: Boolean;
  researces?: string[];
  filterMode: string;
  ident: string;
  metric: string[];
  mode: string;
  name: string;
  plotline?: number;
  link?: string;
}
