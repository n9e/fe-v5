export interface OverListItem {
  name: string;
  num: number;
  icon: string;
  id: string;
  url: string;
}
export interface OverInterface {
  list?: OverListItem[];
  spanNum?: number;
}
interface IndicatorParamsItem {
  prome_ql: string;
}
export interface IndicatorParams {
  params: IndicatorParamsItem[];
  start?: number;
  end?: number;
}
export interface Identifier {
  promql: string;
  value: number;
  metric: string;
}

export interface IndicatorTag {
  name: string;
  description?: string;
}
export interface eventProps {
  event_total_day: number;
  event_total_month: number;
  event_total_week: number;
}
export interface Identifier {
  key: number;
  idents: string;
  value: number;
  metric: string;
}
export interface IndicatorProps {
  tableList: Identifier[];
  updateData: Function;
}

export interface IndicatorTag {
  name: string;
  description?: string;
}
export interface IndicatorEditItem {
  name: string;
  promql: string;
  warning: number;
}

export interface IModalData {
  editData?: IndicatorEditItem;
  index?: number;
}
export interface EditProps {
  modalVisible: boolean;
  modalData?: IModalData;
  editClose: () => void;
  editOk: Function;
}
export interface eventProps {
  event_total_day: number;
  event_total_month: number;
  event_total_week: number;
}
