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
import React, { useRef, useEffect, useState } from 'react';
import { Form, Input, Button, Radio, Collapse, Row, Col } from 'antd';
import PromqlEditor from '@/components/PromqlEditor';
const { Panel } = Collapse;
import G2PieChart from '@/components/G2PieChart';
import ColumnSelect from '@/components/ColumnSelect';

let honeyCombData: any = [];
for (let i = 0; i < 1000; i++) {
  honeyCombData.push({
    name: 'cluster=cloudcollector deployment=nite metric=avg node=nite-cloudcollector-',
    value: Math.random() * 100,
  });
}

export default function Demo() {
  const [xCluster, setXCluster] = useState('Default');
  return (
    <div>
      <Collapse defaultActiveKey='3'>
        <Panel header='PromqlEditor' key='1'>
          <Row style={{ marginBottom: 20 }}>
            <p>PromqlEditor 的自动闭合及联想功能不支持动态切换集群，xCluster变化后自己销毁并重新初始化组件</p>
            <PromqlEditor style={{ width: '100%' }} xCluster={xCluster} />
          </Row>
        </Panel>
        <Panel header='G2PieChart' key='2'>
          <Row>
            <ColumnSelect />
          </Row>
        </Panel>
        <Panel header='Honeycomb' key='3'>
          <Row>
            <div style={{ height: 500, width: '100%' }}>{/* <Honeycomb data={honeyCombData} /> */}</div>
          </Row>
        </Panel>
      </Collapse>
    </div>
  );
}
