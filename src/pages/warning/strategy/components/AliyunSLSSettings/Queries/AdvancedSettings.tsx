import React, { useState } from 'react';
import { Row, Col, Form, Input } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

interface IProps {
  prefixField?: any;
}

export default function AdvancedSettings(props: IProps) {
  const { prefixField = {} } = props;
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  return (
    <div style={{ marginBottom: advancedSettingsOpen ? 0 : 16 }}>
      <div style={{ marginBottom: 8 }}>
        <span
          onClick={() => {
            setAdvancedSettingsOpen(!advancedSettingsOpen);
          }}
          style={{ cursor: 'pointer' }}
        >
          {advancedSettingsOpen ? <DownOutlined /> : <RightOutlined />} 辅助配置
        </span>
      </div>
      <div style={{ display: advancedSettingsOpen ? 'block' : 'none' }}>
        <Row gutter={8}>
          <Col span={6}>
            <InputGroupWithFormItem label={<span>ValueKey</span>} labelWidth={80}>
              <Form.Item {...prefixField} name={[prefixField.name, 'keys', 'valueKey']} style={{ width: '100%' }}>
                <Input />
              </Form.Item>
            </InputGroupWithFormItem>
          </Col>
          <Col span={6}>
            <InputGroupWithFormItem label={<span>LabelKey</span>} labelWidth={80}>
              <Form.Item {...prefixField} name={[prefixField.name, 'keys', 'labelKey']} style={{ width: '100%' }}>
                <Input />
              </Form.Item>
            </InputGroupWithFormItem>
          </Col>
        </Row>
      </div>
    </div>
  );
}
