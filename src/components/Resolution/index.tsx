import React, { useState } from 'react';
import './index.less';
import { AutoComplete } from 'antd';

interface Props {
  initialValue?: number | null;
  onChange: (num: number | null) => void;
}

const options = [15, 30, 60, 120, 300].map((num) => ({
  label: num,
  value: num,
}));

export default function Resolution(props: Props) {
  const { onChange, initialValue } = props;
  const [inputContent, setInputContent] = useState<string>(String(initialValue || ''));
  const [setp, setStep] = useState<number | null>(initialValue || null);

  const onInputChange = (val) => {
    setInputContent(typeof val === 'number' ? val : val.replace(/^(0+)|[^\d]+/g, ''));
  };

  const handleEnter = (e) => {
    if (e.keyCode === 13) handleResult();
  };

  const handleResult = () => {
    // 如果清空输入，则不设置 Step 值
    if (!inputContent && setp !== null) {
      setStep(null);
      onChange(null);
      return;
    }
    const newStep = Number(inputContent);
    if (Number.isInteger(newStep) && newStep > 0 && newStep <= Number.MAX_SAFE_INTEGER && newStep !== setp) {
      setStep(newStep);
      onChange(newStep);
    }
  };

  const handelSelect = (v) => {
    const newStep = Number(v);
    if (newStep !== setp) {
      setStep(newStep);
      onChange(newStep);
    }
  };

  return (
    <div className='resolution'>
      <AutoComplete
        options={options}
        value={inputContent}
        style={{ width: 72 }}
        onChange={onInputChange}
        onSelect={handelSelect}
        onKeyDown={handleEnter}
        onBlur={handleResult}
        placeholder='Res. (s)'
      ></AutoComplete>
    </div>
  );
}
