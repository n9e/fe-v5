import React, { useRef, useEffect, useState } from 'react';
import { Form, Input, Button, Radio, Collapse, Row } from 'antd';
import PromqlEditor from '@/components/PromqlEditor';
const { Panel } = Collapse;

export default function Demo() {
  const [xCluster, setXCluster] = useState('Default');
  return (
    <div>
      <Collapse defaultActiveKey='1'>
        <Panel header='PromqlEditor' key='1'>
          <Row style={{ marginBottom: 20 }}>
            <p>
              PromqlEditor
              的自动闭合及联想功能不支持动态切换集群，xCluster变化后自己销毁并重新初始化组件
            </p>
            <PromqlEditor style={{ width: '100%' }} xCluster={xCluster} />
          </Row>
        </Panel>
      </Collapse>
    </div>
  );
}
