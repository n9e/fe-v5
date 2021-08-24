import React, { useState } from 'react';
import { Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './index.less';
interface Props {
  onClick: () => void;
  className?: string;
}
export default function RefreshIcon(props: Props) {
  const { t } = useTranslation();
  const { onClick, className } = props;
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const handleRefresh = (e) => {
    if (refreshing) return;
    setRefreshing(true);
    onClick();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <Button
      className={className ? className + ' reload-icon' : 'reload-icon'}
      loading={refreshing}
      onClick={handleRefresh}
      icon={<ReloadOutlined className='refresh' spin={refreshing} />}
    ></Button>
  );
}
