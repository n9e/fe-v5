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
import { Form, Select, InputNumber, Row, Col, Tooltip } from 'antd';
import { InfoCircleOutlined, CaretDownOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { Panel } from '../../Components/Collapse';

interface IProps {
  preNamePrefix?: (string | number)[];
  namePrefix?: (string | number)[];
}

const { Option, OptGroup } = Select;

export default function index(props: IProps) {
  const { preNamePrefix = [], namePrefix = ['options', 'standardOptions'] } = props;

  return (
    <Panel header='高级设置'>
      <>
        <Form.Item
          label={
            <div>
              单位{' '}
              <Tooltip
                overlayInnerStyle={{
                  width: 500,
                }}
                getTooltipContainer={() => document.body}
                title={
                  <div>
                    <div>默认会做 SI Prefixes 处理，如不想默认的处理可选择 none 关闭</div>
                    <div>Data(SI): 基数为 1000, 单位为 B、kB、MB、GB、TB、PB、EB、ZB、YB</div>
                    <div>Data(IEC): 基数为 1024, 单位为 B、KiB、MiB、GiB、TiB、PiB、EiB、ZiB、YiB</div>
                    <div>bits: b</div>
                    <div>bytes: B</div>
                  </div>
                }
              >
                <InfoCircleOutlined />
              </Tooltip>
            </div>
          }
          name={[...namePrefix, 'util']}
        >
          <Select suffixIcon={<CaretDownOutlined />} placeholder='auto' allowClear>
            <Option value='none'>none</Option>
            <OptGroup label='Data(SI)'>
              <Option value='bitsSI'>bits(SI)</Option>
              <Option value='bytesSI'>bytes(SI)</Option>
            </OptGroup>
            <OptGroup label='Data(IEC)'>
              <Option value='bitsIEC'>bits(IEC)</Option>
              <Option value='bytesIEC'>bytes(IEC)</Option>
            </OptGroup>
            <OptGroup label='百分比'>
              <Option value='percent'>百分比(0-100)</Option>
              <Option value='percentUnit'>百分比(0.0-1.0)</Option>
            </OptGroup>
            <OptGroup label='时间'>
              <Option value='seconds'>seconds</Option>
              <Option value='milliseconds'>milliseconds</Option>
              <Option value='humantimeSeconds'>humanize(seconds)</Option>
              <Option value='humantimeMilliseconds'>humanize(milliseconds)</Option>
            </OptGroup>
          </Select>
        </Form.Item>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item label='最小值' name={[...namePrefix, 'min']}>
              <InputNumber placeholder='auto' style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label='最大值' name={[...namePrefix, 'max']}>
              <InputNumber placeholder='auto' style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label='小数点' name={[...namePrefix, 'decimals']}>
              <InputNumber placeholder='auto' style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </>
    </Panel>
  );
}
