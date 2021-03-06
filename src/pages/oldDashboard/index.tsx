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
import React, { useState, useEffect, useRef } from 'react';
import { useHistory, Link } from 'react-router-dom';
import PageLayout from '@/components/pageLayout';
import { ColumnsType } from 'antd/lib/table';
import {
  getDashboard,
  createDashboard,
  cloneDashboard,
  removeDashboard,
  exportDashboard,
  importDashboard,
  updateSingleDashboard,
  getBuiltinDashboards,
  createBuiltinDashboards,
} from '@/services/dashboard';
import { SearchOutlined, DownOutlined, FundOutlined, FundViewOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Modal, Form, Input, Tag, message, Dropdown, notification, Select, Tabs, Table } from 'antd';
import dayjs from 'dayjs';
import { Dashboard as DashboardType } from '@/store/dashboardInterface';
import ImportAndDownloadModal, { ModalStatus } from '@/components/ImportAndDownloadModal';
import LeftTree from '@/components/LeftTree';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';
import './index.less';
import { useTranslation } from 'react-i18next';
const { confirm } = Modal;
const { TabPane } = Tabs;
const type = 'dashboard';
export default function Dashboard() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const ref = useRef(null);
  const history = useHistory();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalStatus>(ModalStatus.None);
  const [selectRowKeys, setSelectRowKeys] = useState<number[]>([]);
  const [exportData, setExportData] = useState<string>('');
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState<string>('');
  const [searchVal, setsearchVal] = useState<string>('');
  const [dashboardList, setDashboardList] = useState<DashboardType[]>();
  const [busiId, setBusiId] = useState<number>();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    await form.validateFields();

    if (editing) {
      await edit();
      message.success(t('??????????????????'));
    } else {
      await create();
      message.success(t('??????????????????'));
    }

    (ref?.current as any)?.refreshList();
    setIsModalVisible(false);
    setEditing(false);
  };

  useEffect(() => {
    if (busiId) {
      getDashboard().then((res) => {
        if (searchVal && res.dat) {
          const filters = searchVal.split(' ');
          for (var i = 0; i < filters.length; i++) {
            res.dat = res.dat.filter((item) => item.name.includes(filters[i]) || item.tags.includes(filters[i]));
          }
        }
        setDashboardList(res.dat);
      });
    }
  }, [busiId, searchVal]);

  const create = async () => {
    let { name, tags } = form.getFieldsValue();
    return (
      busiId &&
      createDashboard(busiId, {
        name,
        tags,
      })
    );
  };

  const edit = async () => {
    let { name, tags, id } = form.getFieldsValue();
    return (
      busiId &&
      updateSingleDashboard(busiId, id, {
        name,
        tags,
        pure: true,
      })
    );
  };

  const handleEdit = (record: DashboardType) => {
    const { id, name, tags } = record;
    form.setFieldsValue({
      name,
      tags,
      id,
    });
    setIsModalVisible(true);
    setEditing(true);
  };

  const handleTagClick = (tag) => {
    const queryItem = query.length > 0 ? query.split(' ') : [];
    if (queryItem.includes(tag)) return;
    setQuery((query) => query + ' ' + tag);
    setsearchVal((searchVal) => searchVal + ' ' + tag);
  };

  const layout = {
    labelCol: {
      span: 4,
    },
    wrapperCol: {
      span: 16,
    },
  };
  const dashboardColumn: ColumnsType = [
    {
      title: t('????????????'),
      dataIndex: 'name',
      render: (text: string, record: DashboardType) => {
        const { t } = useTranslation();
        return (
          <div className='table-active-text' onClick={() => history.push(`/dashboard/${busiId}/${record.id}`)}>
            {text}
          </div>
        );
      },
    },
    {
      title: t('????????????'),
      dataIndex: 'tags',
      render: (text: string[]) => (
        <>
          {text.map((tag, index) => {
            return tag ? (
              <Tag
                color='purple'
                key={index}
                style={{
                  cursor: 'pointer',
                }}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </Tag>
            ) : null;
          })}
        </>
      ),
    },
    {
      title: t('????????????'),
      dataIndex: 'update_at',
      render: (text: number) => dayjs(text * 1000).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: t('?????????'),
      dataIndex: 'create_by',
    },
    {
      title: t('??????'),
      width: '240px',
      render: (text: string, record: DashboardType) => (
        <div className='table-operator-area'>
          <div className='table-operator-area-normal' onClick={() => handleEdit(record)}>
            {t('??????')}
          </div>
          <div
            className='table-operator-area-normal'
            onClick={async () => {
              confirm({
                title: `${t('??????????????????')}${record.name}?`,
                onOk: async () => {
                  await cloneDashboard(busiId as number, record.id);
                  message.success(t('??????????????????'));
                  (ref?.current as any)?.refreshList();
                },

                onCancel() {},
              });
            }}
          >
            {t('??????')}
          </div>
          <div
            className='table-operator-area-warning'
            onClick={async () => {
              confirm({
                title: `${t('??????????????????')}???${record.name}?`,
                onOk: async () => {
                  await removeDashboard(busiId as number, record.id);
                  message.success(t('??????????????????'));
                  (ref?.current as any)?.refreshList();
                },

                onCancel() {},
              });
            }}
          >
            {t('??????')}
          </div>
        </div>
      ),
    },
  ];

  const onSearchQuery = (e) => {
    let val = e.target.value;
    setsearchVal(val);
  };

  const handleImportDashboard = async (data) => {
    const { dat } = await importDashboard(busiId as number, data);
    return dat || {};
  };

  return (
    <PageLayout title={t('????????????')} icon={<FundViewOutlined />} hideCluster={true}>
      <div style={{ display: 'flex' }}>
        <LeftTree busiGroup={{ onChange: (id) => setBusiId(id) }}></LeftTree>
        {busiId ? (
          <div className='dashboard' style={{ flex: 1, overflow: 'auto' }}>
            <div className='table-handle'>
              <div className='table-handle-search'>
                <Input
                  onPressEnter={onSearchQuery}
                  className={'searchInput'}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  prefix={<SearchOutlined />}
                  placeholder={t('???????????????????????????')}
                />
              </div>
              <div className='table-handle-buttons'>
                <Button type='primary' onClick={showModal} ghost>
                  {t('????????????')}
                </Button>
                <div className={'table-more-options'}>
                  <Dropdown
                    overlay={
                      <ul className='ant-dropdown-menu'>
                        <li className='ant-dropdown-menu-item' onClick={() => setModalType(ModalStatus.BuiltIn)}>
                          <span>{t('??????????????????')}</span>
                        </li>
                        <li
                          className='ant-dropdown-menu-item'
                          onClick={async () => {
                            if (selectRowKeys.length) {
                              let exportData = await exportDashboard(busiId as number, selectRowKeys);
                              setExportData(JSON.stringify(exportData.dat, null, 2));
                              setModalType(ModalStatus.Export);
                            } else {
                              message.warning(t('?????????????????????'));
                            }
                          }}
                        >
                          <span>{t('??????????????????')}</span>
                        </li>
                        <li
                          className='ant-dropdown-menu-item'
                          onClick={() => {
                            if (selectRowKeys.length) {
                              confirm({
                                title: '?????????????????????????',
                                onOk: async () => {
                                  const reuqests = selectRowKeys.map((id) => {
                                    console.log(id);
                                    return removeDashboard(busiId as number, id);
                                  });
                                  Promise.all(reuqests).then(() => {
                                    message.success(t('????????????????????????'));
                                  });
                                  // TODO: ???????????????????????????????????????????????????????????????????????????0.5s??????????????????
                                  setTimeout(() => {
                                    (ref?.current as any)?.refreshList();
                                  }, 500);
                                },
                                onCancel() {},
                              });
                            } else {
                              message.warning(t('?????????????????????'));
                            }
                          }}
                        >
                          <span>{t('??????????????????')}</span>
                        </li>
                      </ul>
                    }
                    trigger={['click']}
                  >
                    <Button onClick={(e) => e.stopPropagation()}>
                      {t('????????????')}
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
            <Table
              dataSource={dashboardList}
              className='dashboard-table'
              columns={dashboardColumn}
              pagination={{
                total: dashboardList?.length,
                showTotal(total: number) {
                  return `??? ${total} ?????????`;
                },
                pageSizeOptions: [30, 50, 100, 300],
                defaultPageSize: 30,
                showSizeChanger: true,
              }}
              rowKey='id'
              rowSelection={{
                selectedRowKeys: selectRowKeys,
                onChange: (selectedRowKeys: number[]) => {
                  setSelectRowKeys(selectedRowKeys);
                },
              }}
            ></Table>
          </div>
        ) : (
          <BlankBusinessPlaceholder text='????????????' />
        )}
      </div>
      <Modal
        title={editing ? t('??????????????????') : t('?????????????????????')}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => {
          setIsModalVisible(false);
        }}
        destroyOnClose
      >
        <Form {...layout} form={form} preserve={false}>
          <Form.Item
            label={t('????????????')}
            name='name'
            wrapperCol={{
              span: 24,
            }}
            rules={[
              {
                required: true,
                message: t('?????????????????????'),
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            wrapperCol={{
              span: 24,
            }}
            label={t('????????????')}
            name='tags'
          >
            <Select
              mode='tags'
              dropdownStyle={{
                display: 'none',
              }}
              placeholder={t('?????????????????????(??????????????????)')}
            ></Select>
          </Form.Item>
          <Form.Item name='id' hidden>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <ImportAndDownloadModal
        bgid={busiId}
        status={modalType}
        crossCluster={false}
        fetchBuiltinFunc={getBuiltinDashboards}
        submitBuiltinFunc={createBuiltinDashboards}
        onClose={() => {
          setModalType(ModalStatus.None);
        }}
        onSuccess={() => {
          (ref?.current as any)?.refreshList();
        }}
        onSubmit={handleImportDashboard}
        label='??????'
        title={
          ModalStatus.Export === modalType ? (
            '??????'
          ) : (
            <Tabs defaultActiveKey={ModalStatus.BuiltIn} onChange={(e: ModalStatus) => setModalType(e)} className='custom-import-alert-title'>
              <TabPane tab=' ????????????????????????' key={ModalStatus.BuiltIn}></TabPane>
              <TabPane tab='????????????JSON' key={ModalStatus.Import}></TabPane>
            </Tabs>
          )
        }
        exportData={exportData}
      />
    </PageLayout>
  );
}
