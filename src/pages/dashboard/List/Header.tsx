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
import React from 'react';
import { Input, Button, Dropdown, Modal, Space, message } from 'antd';
import { SearchOutlined, DownOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { removeDashboards } from '@/services/dashboardV2';
import { RootState as CommonRootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import RefreshIcon from '@/components/RefreshIcon';
import FormCpt from './Form';
import Import from './Import';
import { useTranslation } from 'react-i18next';
interface IProps {
  busiId: number;
  selectRowKeys: any[];
  refreshList: () => void;
  searchVal: string;
  onSearchChange: (val) => void;
}
export default function Header(props: IProps) {
  const { t } = useTranslation();
  const { clusters } = useSelector<CommonRootState, CommonStoreState>((state) => state.common);
  const { busiId, selectRowKeys, refreshList, searchVal, onSearchChange } = props;
  return (
    <>
      <div
        className='table-handle'
        style={{
          padding: 0,
        }}
      >
        <Space>
          <RefreshIcon
            onClick={() => {
              refreshList();
            }}
          />
          <div className='table-handle-search'>
            <Input
              className={'searchInput'}
              value={searchVal}
              onChange={(e) => {
                onSearchChange(e.target.value);
              }}
              prefix={<SearchOutlined />}
              placeholder={t('仪表盘名称、分类标签')}
            />
          </div>
        </Space>
        <div className='table-handle-buttons'>
          <Button
            type='primary'
            onClick={() => {
              FormCpt({
                mode: 'crate',
                busiId,
                refreshList,
                clusters,
              });
            }}
            ghost
          >
            {t('新建仪表盘')}
          </Button>
          <div className={'table-more-options'}>
            <Dropdown
              overlay={
                <ul className='ant-dropdown-menu'>
                  <li
                    className='ant-dropdown-menu-item'
                    onClick={() => {
                      Import({
                        busiId,
                        type: 'BuiltIn',
                        refreshList,
                      });
                    }}
                  >
                    <span>{t('导入仪表盘')}</span>
                  </li>
                  <li
                    className='ant-dropdown-menu-item'
                    onClick={() => {
                      if (selectRowKeys.length) {
                        Modal.confirm({
                          title: t('是否批量删除仪表盘?'),
                          onOk: async () => {
                            removeDashboards(selectRowKeys).then(() => {
                              message.success(t('批量删除仪表盘成功'));
                            }); // TODO: 删除完后立马刷新数据有时候不是实时的，这里暂时间隔0.5s后再刷新列表

                            setTimeout(() => {
                              refreshList();
                            }, 500);
                          },
                        });
                      } else {
                        message.warning(t('未选择任何仪表盘'));
                      }
                    }}
                  >
                    <span>{t('批量删除仪表盘')}</span>
                  </li>
                </ul>
              }
              trigger={['click']}
            >
              <Button onClick={(e) => e.stopPropagation()}>
                {t('更多操作')}
                <DownOutlined
                  style={{
                    marginLeft: 2,
                  }}
                />
              </Button>
            </Dropdown>
          </div>
        </div>
      </div>
    </>
  );
}
