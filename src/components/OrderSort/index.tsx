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
import React, { useState } from 'react';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import './index.less';
import { useTranslation } from 'react-i18next';
interface Props {
  onChange: (data: boolean) => void;
  showLabel?: boolean;
}
export default function OrderSort(props: Props) {
  const { t } = useTranslation();
  const { onChange, showLabel } = props;
  const [isDesc, setIsDesc] = useState<Boolean>(true);

  const handleClick = (e) => {
    setIsDesc(!isDesc);
    onChange(!isDesc);
    e.preventDefault();
  };

  return (
    <div className='desc-sort'>
      {showLabel && (isDesc ? t('降序') : t('升序'))}

      <div className='desc-sort-icon' onClick={handleClick}>
        <CaretUpOutlined
          style={{
            color: isDesc === false ? 'purple' : '',
          }}
        />
        <CaretDownOutlined
          style={{
            color: isDesc === true ? 'purple' : '',
            marginTop: '-0.3em',
          }}
        />
      </div>
    </div>
  );
}
