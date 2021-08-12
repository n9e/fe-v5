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
