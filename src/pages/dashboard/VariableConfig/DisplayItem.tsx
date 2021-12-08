import React, { useContext, useEffect, useState, memo } from 'react';
import { Row, Col, Input, Select, Checkbox, AutoComplete } from 'antd';
import { resourceGroupItem } from '@/store/businessInterface';
import { useTranslation } from 'react-i18next';
import { FormType } from './EditItem';
import { Variable } from './definition';
import { convertExpressionToQuery, replaceExpressionVars } from './constant';
const { Option } = Select;
interface Props {
  expression: Variable;
  cluster: string;
  index: number;
  data: Variable[];
  onChange: (index: number, value: string | string[]) => void;
}

const stringToRegex = (str) => {
  // Main regex
  const main = str.match(/\/(.+)\/.*/)[1];

  // Regex options
  const options = str.match(/\/.+\/(.*)/)[1];

  // Compiled regex
  return new RegExp(main, options);
};

const DisplayItem: React.FC<Props> = ({ expression, index, data, onChange, cluster }) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<string[]>([]);
  const [exp, setExp] = useState<string>();
  const { definition, multi, allOption, name, reg, selected } = expression;
  useEffect(() => {
    if (expression) {
      var newExpression = replaceExpressionVars(definition, { var: data }, index);
      if (exp !== newExpression) {
        setExp(newExpression);
        convertExpressionToQuery(newExpression).then((res) => {
          setOptions(res);
          // 逻辑上只有导入大盘后初始化那一次 selected会为空
          if (res.length > 0 && !selected) {
            onChange(index, multi ? [res[0]] : res[0]);
          }
          if (exp && newExpression && exp !== newExpression) {
            onChange(index, multi ? [] : '');
          }
        });
      }
    }
  }, [expression, data, index]);

  useEffect(() => {
    if (expression) {
      var newExpression = replaceExpressionVars(definition, { var: data }, index);
      setExp(newExpression);
      convertExpressionToQuery(newExpression).then((res) => {
        setOptions(res);
        if (exp && newExpression && exp !== newExpression) {
          onChange(index, multi ? [] : '');
        }
      });
    }
  }, [cluster]);

  const handleChange = (v) => {
    if (multi && allOption && v.includes('all')) {
      onChange(index, ['all']);
    } else if (multi && !allOption) {
      let allIndex = v.indexOf('all');
      if (allIndex !== -1) {
        v.splice(allIndex, 1);
      }
      onChange(index, v);
    } else {
      onChange(index, v);
    }
  };

  return (
    <div>
      <div className='tag-content-close-item'>
        <div className='tag-content-close-item-tagName'>{name}</div>

        {multi ? (
          <Select
            mode='tags'
            style={{
              width: '180px',
            }}
            onChange={handleChange}
            defaultActiveFirstOption={false}
            showSearch
            value={selected}
            dropdownClassName='overflow-586'
          >
            {allOption && (
              <Option key={'all'} value={'all'}>
                all
              </Option>
            )}
            {options &&
              options
                .filter((i) => !reg || stringToRegex(reg).test(i))
                .map((value) => (
                  <Option key={value} value={value}>
                    {value}
                  </Option>
                ))}
          </Select>
        ) : (
          <AutoComplete style={{ width: 180 }} onChange={(v) => onChange(index, v)} placeholder='input here' value={selected as string} dropdownClassName='overflow-586'>
            {options &&
              options
                .filter((i) => !reg || stringToRegex(reg).test(i))
                .map((value) => (
                  <Option key={value} value={value}>
                    {value}
                  </Option>
                ))}
          </AutoComplete>
        )}
      </div>
    </div>
  );
};

export default DisplayItem;
