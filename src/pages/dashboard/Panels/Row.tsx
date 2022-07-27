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
import { Space, Modal, Button, Input } from 'antd';
import { CaretRightOutlined, CaretDownOutlined, HolderOutlined, SettingOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { AddPanelIcon } from '../config';

interface IProps {
  name: string;
  row: any;
  onToggle: () => void;
  onAddClick: () => void;
  onEditClick: (row: any) => void;
  onDeleteClick: (mode: 'self' | 'withPanels') => void;
}

export default function Row(props: IProps) {
  const { name, row, onToggle, onAddClick, onEditClick, onDeleteClick } = props;
  const [editVisble, setEditVisble] = useState(false);
  const [newName, setNewName] = useState<string>();
  const [deleteVisible, setDeleteVisible] = useState(false);

  return (
    <div className='dashboards-panels-row'>
      <div
        className='dashboards-panels-row-name'
        onClick={() => {
          onToggle();
        }}
      >
        <span style={{ paddingRight: 6 }}>{name}</span>
        {row.collapsed ? <CaretDownOutlined /> : <CaretRightOutlined />}
      </div>
      <Space>
        <AddPanelIcon
          onClick={() => {
            onAddClick();
          }}
        />
        <SettingOutlined
          onClick={() => {
            setEditVisble(true);
            setNewName(name);
          }}
        />
        <DeleteOutlined
          onClick={() => {
            setDeleteVisible(true);
          }}
        />
        {row.collapsed === false && <HolderOutlined className='dashboards-panels-item-drag-handle' />}
      </Space>
      <Modal
        title='编辑分组'
        visible={editVisble}
        onCancel={() => {
          setEditVisble(false);
        }}
        onOk={() => {
          onEditClick({
            ...row,
            name: newName,
          });
          setEditVisble(false);
        }}
      >
        <div>
          分组名称
          <Input
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
            }}
            onPressEnter={() => {
              onEditClick({
                ...row,
                name: newName,
              });
              setEditVisble(false);
            }}
          />
        </div>
      </Modal>
      <Modal
        closable={false}
        visible={deleteVisible}
        onCancel={() => {
          setDeleteVisible(false);
        }}
        footer={[
          <Button
            key='cancel'
            onClick={() => {
              setDeleteVisible(false);
            }}
          >
            取消
          </Button>,
          <Button
            key='ok'
            type='primary'
            onClick={() => {
              onDeleteClick('self');
              setDeleteVisible(false);
            }}
          >
            仅删除分组
          </Button>,
          <Button
            key='all'
            type='primary'
            danger
            onClick={() => {
              onDeleteClick('withPanels');
              setDeleteVisible(false);
            }}
          >
            删除分组和图表
          </Button>,
        ]}
      >
        <div>
          <h3 style={{ fontSize: 16 }}>
            <InfoCircleOutlined style={{ color: '#faad14', marginRight: 10, fontSize: 22, position: 'relative', top: 4 }} /> 删除分组
          </h3>
          <div style={{ marginLeft: 38, fontSize: 14 }}>确定删除该分组吗？</div>
        </div>
      </Modal>
    </div>
  );
}
