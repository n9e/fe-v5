import React, { useState } from 'react';
import { Row, Col, Form, Input } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import _ from 'lodash';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

interface IProps {
  prefixName?: string[];
}

function AdvancedSettings(props: IProps) {
  const { prefixName = [] } = props;
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <span
          onClick={() => {
            setOpen(!open);
          }}
          style={{ cursor: 'pointer' }}
        >
          {open ? <DownOutlined /> : <RightOutlined />} 辅助配置
        </span>
      </div>
      <div style={{ display: open ? 'block' : 'none' }}>
        <Row gutter={8}>
          <Col span={6}>
            <InputGroupWithFormItem label={<span>ValueKey</span>} labelWidth={80}>
              <Form.Item name={[...prefixName, 'query', 'keys', 'valueKey']} style={{ width: '100%' }}>
                <Input />
              </Form.Item>
            </InputGroupWithFormItem>
          </Col>
          <Col span={6}>
            <InputGroupWithFormItem label={<span>LabelKey</span>} labelWidth={80}>
              <Form.Item name={[...prefixName, 'query', 'keys', 'labelKey']} style={{ width: '100%' }}>
                <Input />
              </Form.Item>
            </InputGroupWithFormItem>
          </Col>
          <Col span={6}>
            <InputGroupWithFormItem label={<span>TimeKey</span>} labelWidth={80}>
              <Form.Item name={[...prefixName, 'query', 'keys', 'timeKey']} style={{ width: '100%' }} initialValue='Time'>
                <Input />
              </Form.Item>
            </InputGroupWithFormItem>
          </Col>
          <Col span={6}>
            <InputGroupWithFormItem label={<span>TimeFormat</span>} labelWidth={95}>
              <Form.Item name={[...prefixName, 'query', 'keys', 'timeFormat']} style={{ width: '100%' }} initialValue='%H:%i:%s'>
                <Input />
              </Form.Item>
            </InputGroupWithFormItem>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default AdvancedSettings;
