import React, { useRef } from 'react';
import BaseTabTable, { IBaseTabTableProps } from './baseTabTable';
import { useSelector } from 'react-redux';
import type {
  baseTableProps,
  collectItem,
  resourceStoreState,
} from '@/store/businessInterface';
import { RootState } from '@/store/common';
import { getCollectSettings } from '@/services/resource';
import { getCollectColumns, createLogModal } from '../constant';
import { useTranslation } from 'react-i18next';

const LogTable: React.FC<baseTableProps> = (props) => {
  const { t } = useTranslation();
  const resource = useSelector<RootState, resourceStoreState>(
    (state) => state.resource,
  );
  const ref = useRef(null);

  const refresh = () => {
    (ref.current as any).refreshList();
  };

  const tableProps: IBaseTabTableProps<collectItem> = {
    fetchHandle: getCollectSettings('log'),
    columns: getCollectColumns(
      {
        classpath_name: resource?.currentGroup?.path || '',
      },
      refresh,
      'log',
      t,
    ),
    createModalProps: createLogModal(
      t,
      {
        classpath_name: resource?.currentGroup?.path || '',
        classpath_id: resource?.currentGroup?.id || 0,
        type: 'log',
      },
      refresh,
    ),
    ...props,
  };
  return <BaseTabTable ref={ref} {...tableProps}></BaseTabTable>;
};

export default LogTable;
