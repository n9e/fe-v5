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

  const handleClick = () => {
    setIsDesc(!isDesc);
    onChange(!isDesc);
  };

  return (
    <div className='desc-sort'>
      {showLabel && (isDesc ? t('降序') : t('升序'))}

      <div className='desc-sort-icon' onClick={handleClick}>
        <CaretUpOutlined
          style={{
            color: isDesc === false ? 'blue' : '',
          }}
        />
        <CaretDownOutlined
          style={{
            color: isDesc === true ? 'blue' : '',
            marginTop: '-0.3em',
          }}
        />
      </div>
    </div>
  );
}
