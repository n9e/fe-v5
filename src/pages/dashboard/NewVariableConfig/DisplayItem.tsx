import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import { IVariable } from './definition';
import { getVaraiableSelected, setVaraiableSelected } from './constant';

interface IProps {
  id: string;
  expression: IVariable;
}

export default function DisplayItem(props: IProps) {
  const { id, expression } = props;
  const { name, multi, allOption, options } = expression;
  const [selected, setSelected] = useState<string[]>(getVaraiableSelected(name, id));

  return (
    <div className='tag-content-close-item'>
      <div className='tag-content-close-item-tagName'>{name}</div>
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
    </div>
  );
}
