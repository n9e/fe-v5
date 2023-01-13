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
import { Modal, Input, Tabs, Form, Table, Button, Alert, message } from 'antd';
import Icon, { SearchOutlined } from '@ant-design/icons';
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
const BetaSvg = () => (
  <svg viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='1912' width='1em' height='1em' fill='currentColor'>
    <path
      d='M511.107677 501.222539c-24.585955 1.376347-37.904285 13.669324-39.952944 36.879955l78.881558 0C548.670178 514.892887 535.693632 502.599909 511.107677 501.222539z'
      p-id='1913'
    ></path>
    <path
      d='M771.311931 586.250074c-0.682545 10.926864 7.853875 16.391319 25.610284 16.391319 30.05041-2.048659 46.440705-16.391319 49.172933-43.025932l0-11.268648c-8.878205 5.474688-22.537296 10.244318-40.977273 14.341636C782.581602 566.786791 771.311931 574.640666 771.311931 586.250074z'
      p-id='1914'
    ></path>
    <path
      d='M327.734276 505.32088c-22.537296 1.376347-34.147728 14.693654-34.830273 39.952944l0 14.341636c0.682545 25.269523 11.951193 38.58683 33.805944 39.952944 23.903409 0.682545 35.854603-16.038278 35.854603-50.197262C361.882004 521.370415 350.271572 506.697227 327.734276 505.32088z'
      p-id='1915'
    ></path>
    <path
      d='M896.519584 304.875662 225.495754 304.875662c-35.270295 0-63.86454 28.593222-63.86454 63.865563l0 227.13509-84.044138 76.517721 0.213871 0.703011c-7.286963 4.436032-12.410658 12.094456-12.410658 21.249977 0 13.96199 11.317767 25.279756 25.279756 25.279756 0.444115 0 0.814552-0.230244 1.25355-0.25378l0.075725 0.25378 133.496433 0 103.557564 0 567.466266 0c35.270295 0 63.86454-28.593222 63.86454-63.86454L960.384124 368.740202C960.3831 333.468884 931.789878 304.875662 896.519584 304.875662zM341.052606 631.325689c-21.171182 0-36.879955-8.195659-47.12325-24.585955l0 20.488637-44.050262 0L249.879094 401.853367l44.050262 0 0 96.296183c10.244318-17.756409 27.318182-26.635637 51.221592-26.635637 40.293705 2.048659 61.124126 27.659967 62.49024 76.831876C407.640164 603.665723 385.443629 631.325689 341.052606 631.325689zM513.156336 631.325689c-54.636365-2.048659-82.978876-27.659967-85.027535-76.831876 2.048659-53.270251 29.025057-80.930217 80.930217-82.978876 55.31891 0 82.978876 27.659967 82.978876 82.978876l0 10.244318L472.179063 564.738132c1.366114 23.220864 15.025205 35.513842 40.977273 36.878932 18.439978 0 30.391171-6.819313 35.854603-20.488637l46.098921 5.121648C582.817905 616.300484 555.499723 631.325689 513.156336 631.325689zM679.114089 631.325689c-31.4155 0.672312-46.782489-14.693654-46.098921-46.098921l0-77.856205-25.610284 0 0-32.781614 25.610284 0 0-51.221592 42.001603-9.219989 0 60.441581 36.879955 0 0 32.781614-36.879955 0 0 68.63724c0 15.719007 6.487761 23.561625 19.464307 23.561625 4.780887 0 9.219989-1.366114 13.317307-4.097318l9.219989 27.659967C708.822714 628.593462 696.187953 631.325689 679.114089 631.325689zM852.242148 627.227348c-4.097318-6.147-6.487761-13.659091-7.17133-22.537296-14.341636 17.062608-36.538171 25.952068-66.587558 26.635637-30.732955-2.048659-47.124274-16.391319-49.172933-43.025932 0-28.000728 19.122523-44.392046 57.367569-49.172933 30.05041-6.147 48.831148-11.268648 56.343239-15.365966 1.366114-15.70775-9.219989-23.209608-31.757285-22.537296-19.122523 0-31.074739 7.17133-35.854603 21.512966l-40.977273-6.147c8.195659-30.05041 33.465183-45.074591 75.807546-45.074591 52.587706-1.366114 77.856205 20.146852 75.807546 64.538899 0 15.025205 0 35.18229 0 60.441581 0 12.292977 2.732228 22.537296 8.195659 30.732955L852.242148 627.228371z'
      p-id='1916'
    ></path>
  </svg>
);
export const BetaIcon = (props) => <Icon component={BetaSvg} {...props} />;

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
          <TabPane
            tab={
              <div
                style={{
                  position: 'relative',
                }}
              >
                导入Grafana大盘JSON
                <BetaIcon
                  style={{
                    fontSize: 24,
                    position: 'absolute',
                    top: -12,
                    color: '#1890ff',
                  }}
                />
              </div>
            }
            key='ImportGrafana'
          ></TabPane>
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
          <div style={{ marginBottom: 10 }}>
            <Alert message='目前只支持导入 v8+ 版本的大盘配置，导入完的图表只支持夜莺目前支持的图表类型和功能' type='info' />
          </div>
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
