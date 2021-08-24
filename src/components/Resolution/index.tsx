import React, { useState } from 'react';
import './index.less';
import { AutoComplete, InputNumber, Input } from 'antd';

interface Props {
  initialValue: number;
  onChange: (num: number) => void;
}

const options = [15, 30, 60, 120, 300].map((num) => ({
  label: num,
  value: num,
}));

export default function Resolution(props: Props) {
  const { onChange, initialValue } = props;
  const [v, setV] = useState<string>(String(initialValue));
  const [realV, setRealV] = useState<number>(Number(initialValue));

  const handleChange = (value) => {
    setV(value);
    const numV = Number(value);
    if (Number.isInteger(numV) && numV > 0) {
      setRealV(numV);
      onChange(numV);
    }
  };
  const handleBlur = (event) => {
    const numV = Number(event.target.value);
    if (Number.isInteger(numV) && numV > 0) {
      setRealV(numV);
      onChange(numV);
    } else {
      setV('' + realV);
    }
  };
  return (
    <div className='resolution'>
      <span className='label'>Step</span>
      <AutoComplete
        options={options}
        value={v}
        style={{ width: 60 }}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder='Step'
      ></AutoComplete>
    </div>
  );
}
