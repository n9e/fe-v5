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

  const handleEnter = (e) => {
    if (e.keyCode === 13) {
      const numV = Number(v);
      if (Number.isInteger(numV) && numV > 0) {
        setRealV(numV);
        onChange(numV);
      }
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

  const handelSelect = (v) => {
    const numV = Number(v);
    setRealV(numV);
    onChange(numV);
  };
  return (
    <div className='resolution'>
      <span className='label'>Step</span>
      <AutoComplete
        options={options}
        value={v}
        style={{ width: 60 }}
        onChange={(value) => setV(value)}
        onSelect={handelSelect}
        onKeyDown={handleEnter}
        onBlur={handleBlur}
        placeholder='Step'
      ></AutoComplete>
    </div>
  );
}
