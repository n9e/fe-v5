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
import { Select, Input } from 'antd';
import _ from 'lodash';
import { IVariable } from './definition';
import { getVaraiableSelected, setVaraiableSelected } from './constant';

interface IProps {
  id: string;
  expression: IVariable;
  onChange: () => void; // 目前只为了外层更新变量 options
}

export default function DisplayItem(props: IProps) {
  const { id, expression, onChange } = props;
  const { name, multi, allOption, options, type } = expression;
  const [selected, setSelected] = useState<string[]>(getVaraiableSelected(name, id));

  useEffect(() => {
    setSelected(getVaraiableSelected(name, id));
  }, [getVaraiableSelected(name, id)]);

  return (
    <div className='tag-content-close-item'>
      <div className='tag-content-close-item-tagName'>{name}</div>
      {type === 'query' ? (
        <Select
          mode={multi ? 'tags' : undefined}
          style={{
            width: '180px',
          }}
          onChange={(v) => {
            let val = v;
            if (multi && allOption && val.includes('all')) {
              val = ['all'];
            } else if (multi && !allOption) {
              let allIndex = val.indexOf('all');
              if (allIndex !== -1) {
                val.splice(allIndex, 1);
              }
            }
            setVaraiableSelected(name, val, id, true);
            setSelected(val);
            onChange();
          }}
          defaultActiveFirstOption={false}
          showSearch
          value={selected}
          dropdownClassName='overflow-586'
        >
          {allOption && (
            <Select.Option key={'all'} value={'all'}>
              all
            </Select.Option>
          )}
          {options &&
            options.map((value) => (
              <Select.Option key={value} value={value}>
                {value}
              </Select.Option>
            ))}
        </Select>
      ) : (
        <Input
          value={selected}
          onBlur={(e) => {
            let val = e.target.value;
            setVaraiableSelected(name, val, id, true);
            onChange();
          }}
          onKeyDown={(e: any) => {
            if (e.code === 'Enter') {
              let val = e.target.value;
              setVaraiableSelected(name, val, id, true);
              onChange();
            }
          }}
          onChange={(e) => {
            let val = e.target.value;
            setSelected(val as any);
          }}
        />
      )}
    </div>
  );
}
