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
import React, { useState, useEffect } from 'react';
import './index.less';
import { AutoComplete } from 'antd';

interface Props {
  initialValue?: number | null;
  value?: number | null;
  onChange?: (num: number | null) => void;
}

const options = [15, 30, 60, 120, 300].map((num) => ({
  label: num,
  value: num,
}));

export default function Resolution(props: Props) {
  const { onChange, value, initialValue } = props;
  const [inputContent, setInputContent] = useState<string>(String(initialValue || ''));
  const [step, setStep] = useState<number | null>(initialValue || null);

  useEffect(() => {
    setInputContent(String(value || ''));
  }, [value]);

  const onInputChange = (val) => {
    setInputContent(typeof val === 'number' ? val : val.replace(/^(0+)|[^\d]+/g, ''));
  };

  const handleEnter = (e) => {
    if (e.keyCode === 13) handleResult();
  };

  const handleResult = () => {
    // 如果清空输入，则不设置 Step 值
    if (!inputContent) {
      setStep(null);
      onChange && onChange(null);
      return;
    }
    const newStep = Number(inputContent);
    if (Number.isInteger(newStep) && newStep > 0 && newStep <= Number.MAX_SAFE_INTEGER && newStep !== step) {
      setStep(newStep);
      onChange && onChange(newStep);
    }
  };

  const handelSelect = (v) => {
    const newStep = Number(v);
    if (newStep !== step) {
      setStep(newStep);
      onChange && onChange(newStep);
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
