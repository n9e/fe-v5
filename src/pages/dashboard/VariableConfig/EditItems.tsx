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
import { Modal, Table, Space, Button } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { arrayMoveImmutable } from 'array-move';
import _ from 'lodash';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import EditItem from './EditItem';
import { IVariable } from './definition';

interface IProps {
  id: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  value?: IVariable[];
  range: IRawTimeRange;
  onChange: (v?: IVariable[]) => void;
}

export default function EditItems(props: IProps) {
  const { visible, setVisible, onChange, value, range, id } = props;
  const [data, setData] = useState<IVariable[]>(value || []);

  return (
    <Modal
      title='大盘变量'
      width={1200}
      visible={visible}
      onOk={() => {
        setVisible(false);
      }}
      onCancel={() => {
        setVisible(false);
      }}
      wrapClassName='variable-modal'
    >
      <Table
        rowKey={(record) => {
          return `${record.type}${record.name}${record.definition}`;
        }}
        size='small'
        dataSource={data}
        columns={[
          {
            title: '变量名',
            dataIndex: 'name',
            render: (text, record, idx) => {
              return (
                <a
                  onClick={() => {
                    EditItem({
                      id,
                      range,
                      index: idx,
                      data: record,
                      onChange: (val) => {
                        const newData = _.map(data, (item, i) => {
                          if (i === idx) {
                            return val;
                          }
                          return item;
                        });
                        setData(newData);
                        onChange(newData);
                      },
                    });
                  }}
                >
                  {text}
                </a>
              );
            },
          },
          {
            title: '变量类型',
            dataIndex: 'type',
          },
          {
            title: '变量定义',
            dataIndex: 'definition',
          },
          {
            title: '操作',
            width: 200,
            render: (_text, record, idx) => {
              return (
                <Space>
                  <Button
                    type='link'
                    size='small'
                    onClick={() => {
                      const newData = arrayMoveImmutable(data, idx, idx + 1);
                      setData(newData);
                      onChange(newData);
                    }}
                    disabled={idx === data.length - 1}
                  >
                    <ArrowDownOutlined />
                  </Button>
                  <Button
                    type='link'
                    size='small'
                    onClick={() => {
                      const newData = arrayMoveImmutable(data, idx, idx - 1);
                      setData(newData);
                      onChange(newData);
                    }}
                    disabled={idx === 0}
                  >
                    <ArrowUpOutlined />
                  </Button>
                  <Button
                    type='link'
                    size='small'
                    onClick={() => {
                      const newData = [
                        ...data,
                        {
                          ...record,
                          name: 'copy_of_' + record.name,
                        },
                      ];
                      setData(newData);
                      onChange(newData);
                    }}
                  >
                    <CopyOutlined />
                  </Button>
                  <Button
                    type='link'
                    size='small'
                    onClick={() => {
                      const newData = _.cloneDeep(data);
                      newData.splice(idx, 1);
                      setData(newData);
                      onChange(newData);
                    }}
                  >
                    <DeleteOutlined />
                  </Button>
                </Space>
              );
            },
          },
        ]}
        pagination={false}
        footer={() => {
          return (
            <Button
              onClick={() => {
                EditItem({
                  id,
                  range,
                  index: data.length,
                  data: {
                    name: '',
                    type: 'query',
                    definition: '',
                  },
                  onChange: (val) => {
                    const newData = [...data, val];
                    setData(newData);
                    onChange(newData);
                  },
                });
              }}
            >
              新增变量
            </Button>
          );
        }}
      />
    </Modal>
  );
}
