import React, { useState } from 'react';
import { Popover, Input, Space, Button, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { submitRequest } from './services';

interface IProps {
  text: string;
  children: React.ReactNode;
  values: any;
  callback: () => void;
}

export default function Rename(props: IProps) {
  const { children, text, values, callback } = props;
  const [value, setValue] = useState(text);
  const [visible, setVisible] = useState(false);
  return (
    <div className='custom-dimension-settings-table-name'>
      {children}
      <Popover
        visible={visible}
        onVisibleChange={(visible) => {
          setVisible(visible);
        }}
        content={
          <div>
            <Input value={value} onChange={(e) => setValue(e.target.value)} />
            <Space style={{ marginTop: 16 }}>
              <Button
                type='primary'
                onClick={() => {
                  submitRequest({
                    ...values,
                    name: value,
                  })
                    .then(() => {
                      message.success('名称修改成功');
                      callback();
                    })
                    .finally(() => {
                      setVisible(false);
                    });
                }}
              >
                保存
              </Button>
              <Button onClick={() => setVisible(false)}>取消</Button>
            </Space>
          </div>
        }
        title='修改数据源名称'
        trigger='click'
      >
        <EditOutlined
          onClick={() => {
            setVisible(true);
          }}
        />
      </Popover>
    </div>
  );
}
