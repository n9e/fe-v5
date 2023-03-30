import React, { useState } from 'react';
import { Space, Form, Switch } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

export default function Options() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div>
        <span
          onClick={() => {
            setOpen(!open);
          }}
          style={{
            cursor: 'pointer',
          }}
        >
          {open ? <DownOutlined /> : <RightOutlined />} {t('选项')}
        </span>
      </div>
      <div
        style={{
          display: open ? 'block' : 'none',
        }}
      >
        <Space>
          <InputGroupWithFormItem label={t('Show disabled items')} labelWidth={160}>
            <div style={{ borderLeft: '1px solid #d9d9d9', marginLeft: 1, paddingLeft: 8 }}>
              <Form.Item name={['query', 'options', 'showDisabledItems']} valuePropName='checked'>
                <Switch />
              </Form.Item>
            </div>
          </InputGroupWithFormItem>
          <InputGroupWithFormItem label={t('Use Zabbix value mapping')} labelWidth={180}>
            <div style={{ borderLeft: '1px solid #d9d9d9', marginLeft: 1, paddingLeft: 8 }}>
              <Form.Item name={['query', 'options', 'useZabbixValueMapping']} valuePropName='checked'>
                <Switch />
              </Form.Item>
            </div>
          </InputGroupWithFormItem>
          <InputGroupWithFormItem label={t('Disable data alignment')} labelWidth={160}>
            <div style={{ borderLeft: '1px solid #d9d9d9', marginLeft: 1, paddingLeft: 8 }}>
              <Form.Item name={['query', 'options', 'disableDataAlignment']} valuePropName='checked'>
                <Switch />
              </Form.Item>
            </div>
          </InputGroupWithFormItem>
        </Space>
      </div>
    </div>
  );
}
