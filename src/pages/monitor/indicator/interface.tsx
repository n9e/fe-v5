import { useTranslation } from 'react-i18next';
export interface MoreOptions {
  [index: string]: string;
}
export interface InterfaceDat {
  dat: InterfaceList;
  err: string;
}
export interface InterfaceList {
  list: InterfaceItem[];
  total: number;
}
export interface InterfaceItem {
  id: number;
  description: string;
  metric: string;
}
export interface Refresh {
  limit: number;
  p: number;
  query?: string;
}
