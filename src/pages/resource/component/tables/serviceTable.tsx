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
import React, { useRef } from 'react';
import BaseTabTable, { IBaseTabTableProps } from './baseTabTable';
import type {
  baseTableProps,
  collectItem,
  resourceStoreState,
} from '@/store/businessInterface';
import { getCollectSettings } from '@/services/resource';
import { getCollectColumns, createProcModal } from '../constant';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { useTranslation } from 'react-i18next';

const ServiceTable: React.FC<baseTableProps> = (props) => {
  const { t } = useTranslation();
  const resource = useSelector<RootState, resourceStoreState>(
    (state) => state.resource,
  );
  const ref = useRef(null);

  const refresh = () => {
    (ref.current as any).refreshList();
  };

  const tableProps: IBaseTabTableProps<collectItem> = {
    fetchHandle: getCollectSettings('process'),
    columns: getCollectColumns(
      {
        classpath_name: resource?.currentGroup?.path || '',
      },
      refresh,
      'process',
      t,
    ),
    createModalProps: createProcModal(
      t,
      {
        classpath_name: resource?.currentGroup?.path || '',
        classpath_id: resource?.currentGroup?.id || 0,
        type: 'process',
      },
      refresh,
    ),
    ...props,
  };
  return <BaseTabTable ref={ref} {...tableProps}></BaseTabTable>;
};

export default ServiceTable;
