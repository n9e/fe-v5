/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React from 'react';
import { Form, Radio, Slider, Space, Select } from 'antd';
import _ from 'lodash';
import { Panel } from '../../Components/Collapse';

export default function GraphStyles() {
  const namePrefix = ['custom'];

  return (
    <Panel header='图表样式'>
      <>
        <Space>
          <Form.Item label='绘制模式' name={[...namePrefix, 'drawStyle']}>
            <Radio.Group buttonStyle='solid'>
              <Radio.Button value='lines'>lines</Radio.Button>
              <Radio.Button value='bars'>bars</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prevValues, curValues) => _.get(prevValues, [...namePrefix, 'drawStyle']) !== _.get(curValues, [...namePrefix, 'drawStyle'])}>
            {({ getFieldValue }) => {
              const drawStyle = getFieldValue([...namePrefix, 'drawStyle']);
              if (drawStyle === 'lines' || drawStyle === 'bars') {
                return (
                  <>
                    {drawStyle === 'lines' ? (
                      <Form.Item label='线插值' name={[...namePrefix, 'lineInterpolation']}>
                        <Radio.Group buttonStyle='solid'>
                          <Radio.Button value='linear'>linear</Radio.Button>
                          <Radio.Button value='smooth'>smooth</Radio.Button>
                        </Radio.Group>
                      </Form.Item>
                    ) : null}
                  </>
                );
              }
              return null;
            }}
          </Form.Item>
          <Form.Item label='连接空值' name={[...namePrefix, 'spanNulls']} initialValue={false}>
            <Radio.Group buttonStyle='solid'>
              <Radio.Button value={true}>开启</Radio.Button>
              <Radio.Button value={false}>关闭</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Space>
        <Form.Item label='曲线宽度' name={[...namePrefix, 'lineWidth']}>
          <Slider min={0} max={10} step={1} />
        </Form.Item>
        <Form.Item label='透明度' name={[...namePrefix, 'fillOpacity']}>
          <Slider min={0} max={1} step={0.01} />
        </Form.Item>
        <Space>
          <Form.Item label='渐变' name={[...namePrefix, 'gradientMode']}>
            <Radio.Group buttonStyle='solid'>
              <Radio.Button value='opacity'>开启</Radio.Button>
              <Radio.Button value='none'>关闭</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label='堆叠' name={[...namePrefix, 'stack']}>
            <Radio.Group buttonStyle='solid'>
              <Radio.Button value='noraml'>开启</Radio.Button>
              <Radio.Button value='off'>关闭</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, curValues) => _.get(prevValues, [...namePrefix, 'scaleDistribution']) !== _.get(curValues, [...namePrefix, 'scaleDistribution'])}
          >
            {({ getFieldValue, setFields }) => {
              const scaleDistributionType = getFieldValue([...namePrefix, 'scaleDistribution', 'type']);
              return (
                <Space>
                  <Form.Item label='YAxis Scale' name={[...namePrefix, 'scaleDistribution', 'type']}>
                    <Radio.Group
                      buttonStyle='solid'
                      onChange={(e) => {
                        if (e.target.value === 'log') {
                          setFields([
                            {
                              name: [...namePrefix, 'scaleDistribution', 'log'],
                              value: 10,
                            },
                          ]);
                        }
                      }}
                    >
                      <Radio.Button value='linear'>Linear</Radio.Button>
                      <Radio.Button value='log'>Logarithmic</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                  {scaleDistributionType === 'log' && (
                    <Form.Item label=' ' name={[...namePrefix, 'scaleDistribution', 'log']}>
                      <Select style={{ width: 80 }}>
                        <Select.Option value={2}>2</Select.Option>
                        <Select.Option value={10}>10</Select.Option>
                      </Select>
                    </Form.Item>
                  )}
                </Space>
              );
            }}
          </Form.Item>
        </Space>
      </>
    </Panel>
  );
}
