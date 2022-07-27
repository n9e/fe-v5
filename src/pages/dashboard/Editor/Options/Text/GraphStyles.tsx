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
import { Form, Input, Row, Col, Select, InputNumber } from 'antd';
import _ from 'lodash';
import { Panel } from '../../Components/Collapse';
import ColorPicker from '../../../Components/ColorPicker';

export default function GraphStyles() {
  const namePrefix = ['custom'];

  return (
    <Panel header='图表样式'>
      <Row gutter={10}>
        <Col span={3}>
          <Form.Item label='文字颜色' name={[...namePrefix, 'textColor']}>
            <ColorPicker />
          </Form.Item>
        </Col>
        <Col span={3}>
          <Form.Item label='背景色' name={[...namePrefix, 'bgColor']}>
            <ColorPicker />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label='字体大小' name={[...namePrefix, 'textSize']}>
            <InputNumber />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label='左右对齐' name={[...namePrefix, 'justifyContent']}>
            <Select>
              <Select.Option value='flexStart'>左对齐</Select.Option>
              <Select.Option value='center'>居中对齐</Select.Option>
              <Select.Option value='flexEnd'>右对齐</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label='上下对齐' name={[...namePrefix, 'alignItems']}>
            <Select>
              <Select.Option value='flexStart'>上对齐</Select.Option>
              <Select.Option value='center'>居中对齐</Select.Option>
              <Select.Option value='flexEnd'>下对齐</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label='内容' tooltip='支持 Markdown 和 HTML' name={[...namePrefix, 'content']}>
        <Input.TextArea placeholder='支持 Markdown 和 HTML' />
      </Form.Item>
    </Panel>
  );
}
