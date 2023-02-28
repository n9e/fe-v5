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
import { Form, Radio, Row, Col } from 'antd';
import _ from 'lodash';
import { Panel } from '../../Components/Collapse';
import { useTranslation } from "react-i18next";
export default function index() {
  const {
    t
  } = useTranslation();
  const namePrefix = ['options', 'legend'];
  return <Panel header='Legend'>
      <Row>
        <Col span={12}>
          <Form.Item label={t("显示模式")} name={[...namePrefix, 'displayMode']}>
            <Radio.Group buttonStyle='solid'>
              <Radio.Button value='table'>{t("表格")}</Radio.Button>
              <Radio.Button value='list'>{t("列表")}</Radio.Button>
              <Radio.Button value='hidden'>{t("关闭")}</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item noStyle shouldUpdate={(prevValues, curValues) => _.get(prevValues, [...namePrefix, 'displayMode']) !== _.get(curValues, [...namePrefix, 'displayMode'])}>
            {({
            getFieldValue
          }) => {
            if (getFieldValue([...namePrefix, 'displayMode']) === 'list') {
              return <Form.Item label={t("位置")} name={[...namePrefix, 'placement']}>
                    <Radio.Group buttonStyle='solid'>
                      <Radio.Button value='bottom'>bottom</Radio.Button>
                      <Radio.Button value='right'>right</Radio.Button>
                    </Radio.Group>
                  </Form.Item>;
            }

            return null;
          }}
          </Form.Item>
        </Col>
      </Row>
    </Panel>;
}