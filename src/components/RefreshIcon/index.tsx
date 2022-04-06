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
