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
import React, { useEffect, useState } from 'react';
import { GetTagPairs } from '@/services/metric';
import { ChartFilterProps } from '@/store/chart';
import Filter, { FilterType } from './filter';
import { Tag as TagType } from '@/store/chart';
import { useTranslation } from 'react-i18next';
export interface TagItem {
  tagKey: string;
  tagValue: string[];
  selectValue: string[];
  filter: string;
}
interface Props {
  options: ChartFilterProps;
  onChange: (data: TagType[]) => void;
} // 将Tag以数组形式返回

export function formatTag(tagList: string[]): TagItem[] {
  let result = {};
  tagList
    .map((t) => t.split('='))
    .forEach(([tagKey, tagValue]) => {
      if (result[tagKey]) {
        result[tagKey].tagValue.push(tagValue);
      } else {
        result[tagKey] = {
          tagKey,
          tagValue: [tagValue],
          selectValue: [],
          filter: '',
        };
      }
    });
  return Object.keys(result).map((key) => result[key]);
}
export default function TagFilterForChart(props: Props) {
  const { t } = useTranslation();
  const { options, onChange } = props;
  const { metric, tags, start, end, limit, idents } = options;
  const [tagList, setTagList] = useState<TagItem[]>([]);
  const [privateTags, setPrivateTags] = useState<TagType[]>([]);
  useEffect(() => {
    GetTagPairs({
      params: Array.isArray(metric)
        ? metric.map((item) => ({
            metric: item,
            idents,
          }))
        : [
            {
              metric,
              idents,
            },
          ],
      tags,
      limit,
      start,
      end,
    }).then((res) => {
      if (res.dat && res.dat.tags) {
        setTagList(formatTag(res.dat.tags));
      }
    });
  }, [limit, metric, tags]);

  const handleFilterApply = (e: FilterType) => {
    // 将对应Filter tagKey的所有项清空后再添加
    let newTags = privateTags
      .filter((tag) => tag.key !== e.tagKey)
      .concat(e.data);
    setPrivateTags(newTags);
    onChange(newTags);
  };

  return (
    <>
      {Object.keys(tagList).map((_, i) => {
        return <Filter key={i} tagInfo={tagList[i]} onOk={handleFilterApply} />;
      })}
    </>
  );
}
