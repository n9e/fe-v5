import React, { useRef, useEffect } from 'react';
import { Form, Input, Button, Radio, Collapse, Row } from 'antd';
import PromqlEditor from '@/components/PromqlEditor';
const { Panel } = Collapse;

export default function Demo() {
  return (
    <div>
      <Collapse defaultActiveKey='1'>
        <Panel header='PromqlEditor' key='1'>
          <Row style={{ marginBottom: 20 }}>
            <PromqlEditor style={{ width: '100%' }} xCluster='Default' />
          </Row>
        </Panel>
      </Collapse>
    </div>
  );
}
