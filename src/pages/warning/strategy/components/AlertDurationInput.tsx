import React from 'react';
import { InputNumber } from 'antd';
import { useTranslation } from 'react-i18next';

interface AlertDurationInputProps {
  value?: number;
  onChange?: (value: number) => void;
}

export const AlertDurationInput: React.FC<AlertDurationInputProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <InputNumber value={value} onChange={onChange} /> {t('秒')}
    </>
  );
};
