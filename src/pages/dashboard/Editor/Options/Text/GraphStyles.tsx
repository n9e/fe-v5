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
import { Form, Input, Row, Col, Select, InputNumber, Mentions } from 'antd';
import _ from 'lodash';
import { Panel } from '../../Components/Collapse';
import ColorPicker from '../../../Components/ColorPicker';
import { useTranslation } from 'react-i18next';
export default function GraphStyles({ variableConfigWithOptions }) {
  const { t } = useTranslation();
  const namePrefix = ['custom'];
  return (
    <Panel header={t('图表样式')}>
      <Row gutter={10}>
        <Col span={3}>
          <Form.Item label={t('文字颜色')} name={[...namePrefix, 'textColor']}>
            <ColorPicker />
          </Form.Item>
        </Col>
        <Col span={3}>
          <Form.Item label={t('背景色')} name={[...namePrefix, 'bgColor']}>
            <ColorPicker />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label={t('字体大小')} name={[...namePrefix, 'textSize']}>
            <InputNumber />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label={t('左右对齐')} name={[...namePrefix, 'justifyContent']}>
            <Select>
              <Select.Option value='unset'>{t('不设置')}</Select.Option>
              <Select.Option value='flexStart'>{t('左对齐')}</Select.Option>
              <Select.Option value='center'>{t('居中对齐')}</Select.Option>
              <Select.Option value='flexEnd'>{t('右对齐')}</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label={t('上下对齐')} name={[...namePrefix, 'alignItems']}>
            <Select>
              <Select.Option value='unset'>{t('不设置')}</Select.Option>
              <Select.Option value='flexStart'>{t('上对齐')}</Select.Option>
              <Select.Option value='center'>{t('居中对齐')}</Select.Option>
              <Select.Option value='flexEnd'>{t('下对齐')}</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        label={t('内容')}
        tooltip={
          <div>
            <div>{t('默认简单模式，可通过上方设置简单配置卡片样式')}</div>
            <div>
              {t('支持')} Markdown {t('和')} HTMLL
            </div>
            <div>
              {t('如输入')} Markdown {t('或')} HTML {t('建议关闭上方的对齐设置')}置
            </div>
          </div>
        }
        name={[...namePrefix, 'content']}
      >
        <Mentions prefix='$' rows={3} placeholder={t('支持 Markdown 和 HTML')}>
          {_.map(variableConfigWithOptions, (item) => {
            return (
              <Mentions.Option key={item.name} value={item.name}>
                {item.name}
              </Mentions.Option>
            );
          })}
        </Mentions>
      </Form.Item>
    </Panel>
  );
}
