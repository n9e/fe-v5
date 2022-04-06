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
import BaseTable from '@/components/BaseTable';
import { useSelector } from 'react-redux';
import { getResourceList } from '@/services/resource';
import SearchInput from '@/components/BaseSearchInput';
import type {
  resourceStoreState,
  resourceItem,
} from '@/store/businessInterface';
import { ColumnsType } from 'antd/lib/table';
import { RootState } from '@/store/common';
import { useTranslation } from 'react-i18next';
interface IProps {
  onSelect?: (idents: Array<string>) => unknown;
}

function ResourceTable({ onSelect }: IProps) {
  const { t } = useTranslation();
  const [selectRowKeys, setSelectRowKeys] = useState<React.Key[]>([]);
  const { currentGroup } = useSelector<RootState, resourceStoreState>(
    (state) => state.resource,
  );
  const [query, setQuery] = useState<string>('');
  const columns: ColumnsType<resourceItem> = [
    {
      title: t('资源标识'),
      dataIndex: 'ident',
    },
    {
      title: t('资源名称'),
      dataIndex: 'alias',
    },
  ];

  const handleSearchResource = (keyword: string) => {
    setQuery(keyword);
  };

  const handleFetchList = (list: Array<resourceItem>) => {
    const idents = list.map((item) => item.ident);
    setSelectRowKeys(idents);
    onSelect && onSelect(idents);
  };

  return (
    <div>
      <div className='table-search-area'>
        <SearchInput
          placeholder={t('资源信息或标签')}
          onSearch={handleSearchResource}
        ></SearchInput>
      </div>
      <BaseTable
        columns={columns}
        rowKey={'ident'}
        fetchParams={{
          id: currentGroup?.id || '',
          query,
        }}
        fetchHandle={getResourceList}
        rowSelection={{
          selectedRowKeys: selectRowKeys,
          onChange: (selectedRowKeys: React.Key[]) => {
            setSelectRowKeys(selectedRowKeys);
            onSelect && onSelect(selectedRowKeys as Array<string>);
          },
        }}
        paginationProps={{
          simple: true,
        }}
        onFetchList={handleFetchList}
      ></BaseTable>
    </div>
  );
}

export default ResourceTable;
