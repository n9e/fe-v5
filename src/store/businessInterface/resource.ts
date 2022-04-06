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
import { baseFavoriteItem, favoriteGroup } from '../common';
export interface resourceItem {
  id: number;
  ident: string;
  alias: string;
  tags: string;
  note: string;
  mute_btime: number;
  mute_etime: number;
  classpath_ids: Array<number>;
}

export type resourceGroupItem = baseFavoriteItem & {
  path: string;
  note: string;
  preset: number;
};

export enum prefixType {
  Need = 1,
  UnNeed = 0,
}

export interface resourceStoreState {
  tableData: Array<resourceItem>;
  group: favoriteGroup;
  pageNumber: number;
  currentGroup: resourceGroupItem | null;
  prefix: number;
  resourceData: {
    resourceDetail: resourceItem | null;
    resourceDetailLoading: boolean;
  };
}

export interface baseTableProps {
  currentKey: string;
  activeKey: string;
}

export type collect_type = 'port' | 'process' | 'log' | 'script';

export enum procMethod {
  CmdLine = 'cmdline',
  Name = 'name',
}

export enum protocolType {
  TCP = 'tcp',
  UDP = 'udp',
}

export interface portData {
  port: number;
  protocol: protocolType;
  timeout: number;
}

export interface porcData {
  method: procMethod;
  param: number;
}

export interface pluginData {
  path: string;
  params: string;
  stdin: string;
  env: string;
  timeout: number;
}

export interface logData {
  file_path: string;
  func: string;
  pattern: string;
  tags_pattern: object;
  valiate?: string;
}

export interface collectItem {
  id: number;
  classpath_id: number;
  classpath_name: string;
  type: collect_type;
  prefix_match: prefixType;
  name: string;
  note: string;
  step: number;
  append_tags: string | Array<string>;
  data: string;
  create_at: number;
  create_by: string;
  update_at: number;
  update_by: string;
}
export interface ICollectParmas {
  classPath_id?: number;
  type: collect_type;
}
