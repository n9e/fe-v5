import React from 'react';
import _ from 'lodash';
import { Button, Space, Dropdown, Menu } from 'antd';
import { DownOutlined, EditOutlined } from '@ant-design/icons';
import Edit from './Edit';
import { ILink } from '../types';

interface IProps {
  editable?: boolean;
  value?: ILink[];
  onChange: (newValue: ILink[]) => void;
}

export default function index(props: IProps) {
  const { editable = true, value } = props;
  return (
    <Space style={{ marginBottom: 10 }}>
      <Dropdown
        overlay={
          <Menu>
            {_.isEmpty(value) ? (
              <div style={{ textAlign: 'center' }}>暂无数据</div>
            ) : (
              _.map(value, (item, idx) => {
                return (
                  <Menu.Item key={idx}>
                    <a href={item.url} target={item.targetBlank ? '_blank' : '_self'}>
                      {item.title}
                    </a>
                  </Menu.Item>
                );
              })
            )}
          </Menu>
        }
      >
        <Button>
          大盘链接 <DownOutlined />
        </Button>
      </Dropdown>
      {editable && (
        <EditOutlined
          style={{ fontSize: 18 }}
          className='icon'
          onClick={() => {
            Edit({
              initialValues: value,
              onOk: (newValue) => {
                props.onChange(newValue);
              },
            });
          }}
        />
      )}
    </Space>
  );
}
