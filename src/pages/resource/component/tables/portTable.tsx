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
import { getCollectColumns, createPortModal } from '../constant';
import { useTranslation } from 'react-i18next';

const PortTable: React.FC<baseTableProps> = (props) => {
  const { t } = useTranslation();
  const resource = useSelector<RootState, resourceStoreState>(
    (state) => state.resource,
  );
  const ref = useRef(null);

  const refresh = () => {
    (ref.current as any).refreshList();
  };

  const tableProps: IBaseTabTableProps<collectItem> = {
    fetchHandle: getCollectSettings('port'),
    searchPlaceHolder: '',
    columns: getCollectColumns(
      {
        classpath_name: resource?.currentGroup?.path || '',
      },
      refresh,
      'port',
      t,
    ),
    createModalProps: createPortModal(
      t,
      {
        classpath_name: resource?.currentGroup?.path || '',
        classpath_id: resource?.currentGroup?.id || 0,
        type: 'port',
      },
      refresh,
    ),
    ...props,
  };
  return <BaseTabTable ref={ref} {...tableProps}></BaseTabTable>;
};

export default PortTable;
