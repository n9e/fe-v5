import React, { useState } from 'react';
import { Button, Space, message } from 'antd';
import { useHistory } from 'react-router-dom';

interface IProps {
  id?: number | string;
  submitLoading: boolean;
}

export default function Footer(props: IProps) {
  const history = useHistory();
  return (
    <div className='settings-source-form-footer'>
      <Space>
        {props.id !== undefined ? (
          <Button
            onClick={() => {
              history.go(-1);
            }}
          >
            返回
          </Button>
        ) : null}
        <Button type='primary' htmlType='submit' loading={props.submitLoading}>
          测试并保存
        </Button>
      </Space>
    </div>
  );
}
