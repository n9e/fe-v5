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

/**
 * 大盘列表页面
 */
import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { Table, Tag, Modal, Switch, message } from 'antd';
import { FundViewOutlined } from '@ant-design/icons';
import moment from 'moment';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import queryString from 'query-string';
import { Dashboard as DashboardType } from '@/store/dashboardInterface';
import { getDashboards, cloneDashboard, removeDashboards, getDashboard, updateDashboardPublic } from '@/services/dashboardV2';
import PageLayout from '@/components/pageLayout';
import LeftTree from '@/components/LeftTree';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';
import { RootState as CommonRootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import Header from './Header';
import FormCpt from './Form';
import Export from './Export';
import { exportDataStringify } from './utils';
import './style.less';
import { useTranslation } from 'react-i18next';
const DASHBOARD_PAGESIZE_KEY = 'dashboard-pagesize';
export default function index() {
  const { t } = useTranslation();
  const { clusters } = useSelector<CommonRootState, CommonStoreState>((state) => state.common);
  const history = useHistory();
  const [busiId, setBusiId] = useState<number>();
  const [list, setList] = useState([]);
  const [selectRowKeys, setSelectRowKeys] = useState<number[]>([]);
  const [refreshKey, setRefreshKey] = useState(_.uniqueId('refreshKey_'));
  const [searchVal, setsearchVal] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(_.toNumber(localStorage.getItem(DASHBOARD_PAGESIZE_KEY)) || 10);
  useEffect(() => {
    if (busiId) {
      getDashboards(busiId).then((res) => {
        setList(res);
      });
    }
  }, [busiId, refreshKey]);

  const data = _.filter(list, (item) => {
    if (searchVal) {
      return _.includes(item.name.toLowerCase(), searchVal.toLowerCase()) || item.tags.toLowerCase().includes(searchVal.toLowerCase());
    }

    return true;
  });

  return (
    <PageLayout title={t('监控大盘')} icon={<FundViewOutlined />} hideCluster={true}>
      <div
        style={{
          display: 'flex',
        }}
      >
        <LeftTree
          busiGroup={{
            onChange: (id) => setBusiId(id),
          }}
        ></LeftTree>
        {busiId ? (
          <div className='dashboards-v2'>
            <Header
              busiId={busiId}
              selectRowKeys={selectRowKeys}
              refreshList={() => {
                setRefreshKey(_.uniqueId('refreshKey_'));
              }}
              searchVal={searchVal}
              onSearchChange={setsearchVal}
            />
            <Table
              dataSource={data}
              columns={[
                {
                  title: t('大盘名称'),
                  dataIndex: 'name',
                  className: 'name-column',
                  render: (text: string, record: DashboardType) => {
                    return (
                      <div className='table-active-text' onClick={() => history.push(`/dashboards/${record.ident || record.id}`)}>
                        {text}
                      </div>
                    );
                  },
                },
                {
                  title: t('分类标签'),
                  dataIndex: 'tags',
                  className: 'tags-column',
                  render: (text: string[]) => (
                    <>
                      {_.map(_.split(text, ' '), (tag, index) => {
                        return tag ? (
                          <Tag
                            color='purple'
                            key={index}
                            style={{
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              const queryItem = searchVal.length > 0 ? searchVal.split(' ') : [];
                              if (queryItem.includes(tag)) return;
                              setsearchVal((searchVal) => {
                                if (searchVal) {
                                  return searchVal + ' ' + tag;
                                }

                                return tag;
                              });
                            }}
                          >
                            {tag}
                          </Tag>
                        ) : null;
                      })}
                    </>
                  ),
                },
                {
                  title: t('更新时间'),
                  width: 120,
                  dataIndex: 'update_at',
                  render: (text: number) => <div style={{ width: 120 }}>{moment.unix(text).format('YYYY-MM-DD HH:mm:ss')}</div>,
                },
                {
                  title: t('发布人'),
                  width: 70,
                  dataIndex: 'create_by',
                },
                {
                  title: t('公开'),
                  width: 120,
                  dataIndex: 'public',
                  render: (text: number, record: DashboardType) => {
                    return (
                      <div>
                        <Switch
                          checked={text === 1}
                          onChange={() => {
                            Modal.confirm({
                              title: `${t('确定')}${record.public ? t('取消分享') : t('分享')}${t('大盘：')}${record.name}${t('吗?')}`,
                              onOk: async () => {
                                await updateDashboardPublic(record.id, {
                                  public: record.public ? 0 : 1,
                                });
                                message.success(`${record.public ? t('取消分享') : t('分享')}${t('大盘成功')}`);
                                setRefreshKey(_.uniqueId('refreshKey_'));
                              },
                            });
                          }}
                        />
                        {text === 1 && (
                          <Link
                            target='_blank'
                            to={{
                              pathname: `/dashboards/share/${record.id}`,
                              search: queryString.stringify({
                                __cluster: localStorage.getItem('curCluster'),
                                viewMode: 'fullscreen',
                              }),
                            }}
                            style={{
                              marginLeft: 10,
                            }}
                          >
                            {t('查看')}
                          </Link>
                        )}
                      </div>
                    );
                  },
                },
                {
                  title: t('操作'),
                  width: '180px',
                  render: (text: string, record: DashboardType) => (
                    <div className='table-operator-area' style={{ width: 180 }}>
                      <div
                        className='table-operator-area-normal'
                        onClick={() => {
                          FormCpt({
                            mode: 'edit',
                            initialValues: { ...record, tags: record.tags ? _.split(record.tags, ' ') : undefined },
                            busiId,
                            refreshList: () => {
                              setRefreshKey(_.uniqueId('refreshKey_'));
                            },
                            clusters,
                          });
                        }}
                      >
                        {t('编辑')}
                      </div>
                      <div
                        className='table-operator-area-normal'
                        onClick={async () => {
                          Modal.confirm({
                            title: `${t('是否克隆大盘')}${record.name}?`,
                            onOk: async () => {
                              await cloneDashboard(busiId as number, record.id);
                              message.success(t('克隆大盘成功'));
                              setRefreshKey(_.uniqueId('refreshKey_'));
                            },

                            onCancel() {},
                          });
                        }}
                      >
                        {t('克隆')}
                      </div>
                      <div
                        className='table-operator-area-normal'
                        onClick={async () => {
                          const exportData = await getDashboard(record.id);
                          Export({
                            data: exportDataStringify(exportData),
                          });
                        }}
                      >
                        {t('导出')}
                      </div>
                      <div
                        className='table-operator-area-warning'
                        onClick={async () => {
                          Modal.confirm({
                            title: `${t('是否删除大盘：')}${record.name}?`,
                            onOk: async () => {
                              await removeDashboards([record.id]);
                              message.success(t('删除大盘成功'));
                              setRefreshKey(_.uniqueId('refreshKey_'));
                            },

                            onCancel() {},
                          });
                        }}
                      >
                        {t('删除')}
                      </div>
                    </div>
                  ),
                },
              ]}
              rowKey='id'
              rowSelection={{
                selectedRowKeys: selectRowKeys,
                onChange: (selectedRowKeys: number[]) => {
                  setSelectRowKeys(selectedRowKeys);
                },
              }}
              pagination={{
                showSizeChanger: true,
                pageSize,
                pageSizeOptions: ['10', '20', '50', '100'],
                onShowSizeChange: (_current, size) => {
                  setPageSize(size);
                  localStorage.setItem(DASHBOARD_PAGESIZE_KEY, size.toString());
                },
              }}
            />
          </div>
        ) : (
          <BlankBusinessPlaceholder text={t('监控大盘')} />
        )}
      </div>
    </PageLayout>
  );
}
