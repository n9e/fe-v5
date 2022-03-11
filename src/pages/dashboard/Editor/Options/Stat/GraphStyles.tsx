import React from 'react';
import { Form, Radio, Select, Row, Col, InputNumber } from 'antd';
import _ from 'lodash';
import { Panel } from '../../Components/Collapse';

export const calcsOptions = {
  lastNotNull: {
    name: '最后一个非空值',
  },
  last: {
    name: '最后一个值',
  },
  firstNotNull: {
    name: '第一个非空值',
  },
  first: {
    name: '第一个值',
  },
  min: {
    name: '最小值',
  },
  max: {
    name: '最大值',
  },
  avg: {
    name: '平均值',
  },
  sum: {
    name: '总和',
  },
  count: {
    name: '数量',
  },
};

const colSpans = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function GraphStyles() {
  const namePrefix = ['custom'];

  return (
    <Panel header='图表样式'>
      <>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item label='显示模式' name={[...namePrefix, 'textMode']}>
              <Radio.Group buttonStyle='solid'>
                <Radio.Button value='valueAndName'>名称和值</Radio.Button>
                <Radio.Button value='value'>值</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='颜色模式' name={[...namePrefix, 'colorMode']}>
              <Radio.Group buttonStyle='solid'>
                <Radio.Button value='value'>值</Radio.Button>
                <Radio.Button value='background'>背景</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item label='取值计算' name={[...namePrefix, 'calc']}>
              <Select>
                {_.map(calcsOptions, (item, key) => {
                  return (
                    <Select.Option key={key} value={key}>
                      {item.name}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='每行最多显示' name={[...namePrefix, 'colSpan']}>
              <Select>
                {_.map(colSpans, (item) => {
                  return (
                    <Select.Option key={item} value={item}>
                      {item}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item label='标题字体大小' name={[...namePrefix, 'textSize', 'title']}>
              <InputNumber placeholder='auto' style={{ width: '100%' }} min={12} max={100} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='值字体大小' name={[...namePrefix, 'textSize', 'value']}>
              <InputNumber placeholder='auto' style={{ width: '100%' }} min={12} max={100} />
            </Form.Item>
          </Col>
        </Row>
      </>
    </Panel>
  );
}
