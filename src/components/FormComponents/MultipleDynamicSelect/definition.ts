import { useTranslation } from 'react-i18next';
export interface MultipleDynamicSelectProps {
  value?: Array<KV>;
  handler?: () => Promise<unknown>;
  onChange?: (data: Array<KV>) => void;
}
export enum SelectEditType {
  SearchTag,
  SearchValue,
}
export type KV = {
  [key: string]: string;
};
export type K = keyof KV;
export interface TagType {
  key: string;
  value: string;
}
export interface IBaseSearchTag {
  limit: number;
}
export interface ISearchTagKeyParams extends IBaseSearchTag {
  tag_key?: string;
}
export interface ISearchTagValueParams extends IBaseSearchTag {
  tag_value?: string;
  tag_key?: string;
  tags?: TagType[];
}
