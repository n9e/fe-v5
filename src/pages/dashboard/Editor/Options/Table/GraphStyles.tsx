import React from 'react';
import { Form, Select, Row, Col, Switch, Input, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { Panel } from '../../Components/Collapse';
import { calcsOptions } from '../../config';

const aggrOperators = ['sum', 'min', 'max', 'avg'];

export default function GraphStyles() {
  const namePrefix = ['custom'];

  return (
    <Panel header='图表样式'>
      <>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item label='显示表头' name={[...namePrefix, 'showHeader']} valuePropName='checked'>
              <Switch size='small' />
            </Form.Item>
          </Col>
          {/* <Col span={12}>
            <Form.Item label='颜色模式' name={[...namePrefix, 'colorMode']}>
              <Radio.Group buttonStyle='solid'>
                <Radio.Button value='value'>值</Radio.Button>
                <Radio.Button value='background'>背景</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col> */}
        </Row>
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
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item label='显示模式' name={[...namePrefix, 'displayMode']}>
              <Select>
                <Select.Option value='seriesToRows'>每行展示 serie 的值</Select.Option>
                <Select.Option value='labelValuesToRows'>每行展示指定聚合维度的值</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Form.Item noStyle shouldUpdate={(prevValues, curValues) => _.get(prevValues, [...namePrefix, 'displayMode']) !== _.get(curValues, [...namePrefix, 'displayMode'])}>
            {({ getFieldValue }) => {
              if (getFieldValue([...namePrefix, 'displayMode']) === 'labelValuesToRows') {
                return (
                  <>
                    {/* <Col span={6}>
                      <Form.Item
                        label={
                          <span>
                            聚合函数&nbsp;
                            <Tooltip title='建议优先通过 promql 的 aggregation operators and by clause 来聚合指定的维度，否则才会生效这里配置的聚合函数和维度'>
                              <InfoCircleOutlined />
                            </Tooltip>
                          </span>
                        }
                        name={[...namePrefix, 'aggrOperator']}
                      >
                        <Select>
                          {_.map(aggrOperators, (item) => {
                            return (
                              <Select.Option key={item} value={item}>
                                {item}
                              </Select.Option>
                            );
                          })}
                        </Select>
                      </Form.Item>
                    </Col> */}
                    <Col span={12}>
                      <Form.Item label='显示维度' name={[...namePrefix, 'aggrDimension']}>
                        <Input />
                      </Form.Item>
                    </Col>
                  </>
                );
              }
              return null;
            }}
          </Form.Item>
        </Row>
      </>
    </Panel>
  );
}
