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
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Modal, Input, Tabs, Form, Table, Button, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { getBuiltinDashboards, getBuiltinDashboard, createDashboard } from '@/services/dashboardV2';
import { getValidImportData, convertDashboardGrafanaToN9E, JSONParse } from './utils';

type ModalType = 'BuiltIn' | 'Import' | 'ImportGrafana';
interface IProps {
  busiId: number;
  type: ModalType;
  refreshList: () => void;
}

const TabPane = Tabs.TabPane;

function Import(props: IProps & ModalWrapProps) {
  const { visible, destroy, busiId, type, refreshList } = props;
  const [modalType, setModalType] = useState(type);
  const [buildinList, setBuildinList] = useState([]);
  const [searchVal, setSearchVal] = useState('');
  const filteredBuildinList = _.filter(buildinList, (item) => {
    if (searchVal) {
      return _.includes(item.name, searchVal);
    }
    return true;
  });

  useEffect(() => {
    getBuiltinDashboards().then((res) => {
      setBuildinList(
        _.map(res, (item) => {
          return {
            name: item,
          };
        }),
      );
    });
  }, []);

  return (
    <Modal
      className='dashboard-import-modal'
      title={
        <Tabs activeKey={modalType} onChange={(e: ModalType) => setModalType(e)} className='custom-import-alert-title'>
          <TabPane tab='导入内置大盘模块' key='BuiltIn'></TabPane>
          <TabPane tab='导入大盘JSON' key='Import'></TabPane>
          <TabPane tab='导入Grafana大盘JSON' key='ImportGrafana'></TabPane>
        </Tabs>
      }
      visible={visible}
      onCancel={() => {
        refreshList();
        destroy();
      }}
      footer={null}
    >
      {modalType === 'BuiltIn' ? (
        <>
          <Input
            prefix={<SearchOutlined />}
            placeholder='请输入要查询的大盘名称'
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
            }}
          />
          <Table
            style={{ marginTop: 10 }}
            rowKey='name'
            size='small'
            dataSource={filteredBuildinList}
            columns={[
              {
                title: '大盘名称',
                dataIndex: 'name',
              },
              {
                title: '操作',
                render: (record) => {
                  return (
                    <a
                      onClick={() => {
                        getBuiltinDashboard(record.name).then((res) => {
                          createDashboard(busiId, getValidImportData(res)).then(() => {
                            message.success('导入成功');
                          });
                        });
                      }}
                    >
                      导入
                    </a>
                  );
                },
              },
            ]}
            pagination={filteredBuildinList.length < 5 ? false : { pageSize: 5 }}
          />
        </>
      ) : null}
      {modalType === 'Import' ? (
        <Form
          layout='vertical'
          onFinish={(vals) => {
            const data = getValidImportData(vals.import);
            createDashboard(busiId, {
              ...data,
              configs: data.configs,
            }).then(() => {
              message.success('导入成功');
              refreshList();
              destroy();
            });
          }}
        >
          <Form.Item
            label='大盘JSON'
            name='import'
            rules={[
              {
                required: true,
                message: '请输入大盘JSON',
              },
            ]}
          >
            <Input.TextArea className='code-area' placeholder='请输入大盘 JSON' rows={16} />
          </Form.Item>
          <Form.Item>
            <Button type='primary' htmlType='submit'>
              导入
            </Button>
          </Form.Item>
        </Form>
      ) : null}
      {modalType === 'ImportGrafana' ? (
        <Form
          layout='vertical'
          onFinish={(vals) => {
            const data = convertDashboardGrafanaToN9E(JSONParse(vals.import));
            createDashboard(busiId, {
              ...data,
              tags: '',
              configs: JSON.stringify(data.configs),
            }).then(() => {
              message.success('导入成功');
              refreshList();
              destroy();
            });
          }}
        >
          <Form.Item
            label='大盘JSON'
            name='import'
            rules={[
              {
                required: true,
                message: '请输入大盘JSON',
              },
            ]}
          >
            <Input.TextArea className='code-area' placeholder='请输入大盘 JSON' rows={16} />
          </Form.Item>
          <Form.Item>
            <Button type='primary' htmlType='submit'>
              导入
            </Button>
          </Form.Item>
        </Form>
      ) : null}
    </Modal>
  );
}

export default ModalHOC(Import);
