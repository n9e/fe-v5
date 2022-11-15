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
export interface IVariable {
  name: string;
  definition: string;
  fullDefinition?: string; // 转换变量后的完整表达式
  reg?: string;
  multi?: boolean;
  allOption?: boolean;
  allValue?: string;
  options?: string[];
  type?: 'query' | 'textbox' | 'custom' | 'constant';
  defaultValue?: string; // textbox 的默认值
  datasource: {
    // v5.14.3 新增 datasource 储存数据源类型和名称
    cate: 'prometheus' | 'elasticsearch';
    name: string;
  };
  config?: {
    // v5.14.3 新增 config 字段，用于存储一些非常规的配置
    index: string; // elasticsearch 源的索引配置
  };
}
