import { Tag } from '@/store/chart';
import { useTranslation } from 'react-i18next';
export type TagDataItem = Tag & {
  tagName: string;
  prefix: boolean;
};
export interface TagFilterData {
  tagList: Array<TagDataItem>;
  duplicateList?: Array<number>;
  invalidList?: Array<number>;
  nonNameList?: Array<number>;
  hasClassPath?: boolean;
  hasInit?: boolean;
}
export type TagFilterResponse = {
  tags: Array<TagDataItem>;
  classpath_tagName?: string;
  classpath_id?: number | '*';
  classpath_prefix?: number;
};
