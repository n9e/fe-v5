import React, { useState } from 'react';
import { Row, Col, Form, Input, Tooltip, Select } from 'antd';
import { DownOutlined, RightOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

interface IProps {
  span?: number;
  prefixName?: string[];
}

function AdvancedSettings(props: IProps) {
  const { span = 6, prefixName = [] } = props;
  const [open, setOpen] = useState(true);

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
          <Col span={span}>
            <InputGroupWithFormItem
              label={
                <span>
                  ValueKey{' '}
                  <Tooltip
                    title={
                      '通过此字段从返回结果中提取数值。例如 查询条件为 `select count() AS cnt, event_time from system.query_log ` 返回结果为 cnt:11，ValueKey 写了 cnt，则会根据 cnt 提取到 11，作为查询结果的值'
                    }
                  >
                    <QuestionCircleOutlined />
                  </Tooltip>
                </span>
              }
              labelWidth={100}
            >
              <Form.Item name={[...prefixName, 'query', 'keys', 'valueKey']} style={{ width: '100%' }} rules={[{ required: true, message: '请输入 valueKey' }]}>
                <Input />
              </Form.Item>
            </InputGroupWithFormItem>
          </Col>
          <Col span={span}>
            <InputGroupWithFormItem
              label={
                <span>
                  LabelKey{' '}
                  <Tooltip
                    title={
                      '将此字段对应的 value，作为tag，追加到监控数据的标签中，例如 查询条件为 `select count() cnt, event_time, type from system.query_log GROUP BY type, event_time` 返回结果为 `[{cnt:11 type:QueryFinish},{cnt:10 type:QueryStart}]`, LabelKey 写了 type, 则返回的数据中type会作为时序数据的labels'
                    }
                  >
                    <QuestionCircleOutlined />
                  </Tooltip>
                </span>
              }
              labelWidth={100}
            >
              <Form.Item name={[...prefixName, 'query', 'keys', 'labelKey']} style={{ width: '100%' }}>
                <Select mode='tags' placeholder='回车输入多个' />
              </Form.Item>
            </InputGroupWithFormItem>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default AdvancedSettings;
