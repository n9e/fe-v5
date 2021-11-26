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
  index: number;
  data: Variable[];
  onChange: (index: number, value: string | string[]) => void;
}

const DisplayItem: React.FC<Props> = ({ expression, index, data, onChange }) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<string[]>([]);
  const [exp, setExp] = useState<string>();

  useEffect(() => {
    if (expression) {
      var newExpression = replaceExpressionVars(expression.definition, { var: data }, index);
      if (exp !== newExpression) {
        setExp(newExpression);
        convertExpressionToQuery(newExpression).then((res) => {
          setOptions(res);
          if (exp && newExpression && exp !== newExpression) {
            onChange(index, expression.multi ? [] : '');
          }
        });
      }
    }
  }, [expression, data, index]);

  const handleChange = (v) => {
    if (expression.multi && expression.allOption && v.includes('all')) {
      onChange(index, ['all']);
    } else if (expression.multi && !expression.allOption) {
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
        <div className='tag-content-close-item-tagName'>{expression.name}</div>

        {expression.multi ? (
          <Select
            mode='tags'
            style={{
              width: '180px',
            }}
            onChange={handleChange}
            defaultActiveFirstOption={false}
            showSearch
            value={expression.selected}
            dropdownClassName='overflow-586'
          >
            {expression.allOption && (
              <Option key={'all'} value={'all'}>
                all
              </Option>
            )}
            {options.map((value) => (
              <Option key={value} value={value}>
                {value}
              </Option>
            ))}
          </Select>
        ) : (
          <AutoComplete style={{ width: 180 }} onChange={(v) => onChange(index, v)} placeholder='input here' value={expression.selected as string} dropdownClassName='overflow-586'>
            {options.map((value) => (
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
