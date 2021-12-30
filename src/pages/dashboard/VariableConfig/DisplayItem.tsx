import React, { useContext, useEffect, useState, memo } from 'react';
import { Row, Col, Input, Select, Checkbox, AutoComplete } from 'antd';
import { resourceGroupItem } from '@/store/businessInterface';
import { useTranslation } from 'react-i18next';
import { FormType } from './EditItem';
import { Variable } from './definition';
import { convertExpressionToQuery, replaceExpressionVars } from './constant';
const { Option } = Select;
import { Range } from '@/components/DateRangePicker';
interface Props {
  expression: Variable;
  cluster: string;
  index: number;
  data: Variable[];
  range: Range;
  onChange: (index: number, value: string | string[], options?) => void;
}

// const stringToRegex = (str) => {
//   // Main regex
//   const main = str.match(/\/(.+)\/.*/)[1];

//   // Regex options
//   const options = str.match(/\/.+\/(.*)/)[1];

//   // Compiled regex
//   return new RegExp(main, options);
// };

export function stringStartsAsRegEx(str: string): boolean {
  if (!str) {
    return false;
  }

  return str[0] === '/';
}

export function stringToRegex(str: string): RegExp | false {
  if (!stringStartsAsRegEx(str)) {
    return new RegExp(`^${str}$`);
  }

  const match = str.match(new RegExp('^/(.*?)/(g?i?m?y?)$'));

  // if (!match) {
  //   throw new Error(`'${str}' is not a valid regular expression.`);
  // }

  if (match) {
    return new RegExp(match[1], match[2]);
  } else {
    return false;
  }
}

const DisplayItem: React.FC<Props> = ({ expression, index, data, onChange, cluster, range }) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<string[]>([]);
  const [exp, setExp] = useState<string>();
  const [_range, setRange] = useState<Range>(range);
  const [curCluster, setCurCluster] = useState(cluster);
  const { definition, multi, allOption, name, reg, selected } = expression;
  useEffect(() => {
    if (expression) {
      var newExpression = replaceExpressionVars(definition, { var: data }, index);
      if (exp !== newExpression || curCluster !== cluster || _range !== range) {
        setExp(newExpression);
        setRange(range);
        setCurCluster(cluster);
        convertExpressionToQuery(newExpression, range).then((res) => {
          setOptions(res);
          // 逻辑上只有导入大盘后初始化那一次 selected会为空
          if (res.length > 0 && !selected) {
            onChange(index, multi ? [res[0]] : res[0], res);
          }
          if (exp && newExpression && exp !== newExpression) {
            onChange(index, multi ? [] : '', res);
          }
        });
      }
    }
  }, [expression, data, index, cluster, range]);

  const handleChange = (v) => {
    if (multi && allOption && v.includes('all')) {
      onChange(index, ['all'], options);
    } else if (multi && !allOption) {
      let allIndex = v.indexOf('all');
      if (allIndex !== -1) {
        v.splice(allIndex, 1);
      }
      onChange(index, v, options);
    } else {
      onChange(index, v, options);
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
                .filter((i) => !reg || !stringToRegex(reg) || (stringToRegex(reg) as RegExp).test(i))
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
                .filter((i) => !reg || !stringToRegex(reg) || (stringToRegex(reg) as RegExp).test(i))
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
