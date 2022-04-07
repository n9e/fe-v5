/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
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
  params?: { metric: string }[];
}
export interface ISearchTagValueParams extends IBaseSearchTag {
  tag_value?: string;
  tag_key?: string;
  tags?: TagType[];
  params?: { metric: string }[];
}
