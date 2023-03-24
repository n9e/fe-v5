import React, { useState } from 'react';
import { Row, Col, Form, Input, Tooltip, Select } from 'antd';
import { DownOutlined, RightOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { useTranslation } from 'react-i18next';
interface IProps {
  span?: number;
  prefixName?: string[];
}

function AdvancedSettings(props: IProps) {
  const { t } = useTranslation();
  const { span = 6, prefixName = [] } = props;
  const [open, setOpen] = useState(true);
  return (
    <div>
      <div
        style={{
          marginBottom: 8,
        }}
      >
        <span
          onClick={() => {
            setOpen(!open);
          }}
          style={{
            cursor: 'pointer',
          }}
        >
          {open ? <DownOutlined /> : <RightOutlined />} {t('辅助配置')}
        </span>
      </div>
      <div
        style={{
          display: open ? 'block' : 'none',
        }}
      >
        <Row gutter={8}>
          <Col span={span}>
            <InputGroupWithFormItem
              label={
                <span>
                  ValueKey{' '}
                  <Tooltip title={t('plugin.ck.valuekey.tip')}>
                    <QuestionCircleOutlined />
                  </Tooltip>
                </span>
              }
              labelWidth={100}
            >
              <Form.Item
                name={[...prefixName, 'query', 'keys', 'valueKey']}
                style={{
                  width: '100%',
                }}
                rules={[
                  {
                    required: true,
                    message: t('请输入 valueKey'),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </InputGroupWithFormItem>
          </Col>
          <Col span={span}>
            <InputGroupWithFormItem
              label={
                <span>
                  LabelKey{' '}
                  <Tooltip title={t('plugin.ck.labelkey.tip')}>
                    <QuestionCircleOutlined />
                  </Tooltip>
                </span>
              }
              labelWidth={100}
            >
              <Form.Item
                name={[...prefixName, 'query', 'keys', 'labelKey']}
                style={{
                  width: '100%',
                }}
              >
                <Select mode='tags' placeholder={t('回车输入多个')} />
              </Form.Item>
            </InputGroupWithFormItem>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default AdvancedSettings;
