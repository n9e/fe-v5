import React, { useState, useEffect } from 'react';
import { Input, Row, Col, Button } from 'antd';
import { MenuOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { arrayMoveImmutable } from 'array-move';
import _ from 'lodash';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import Collapse, { Panel } from '../../Components/Collapse';
import { useGlobalState } from '../../../globalState';
import './style.less';

const SortableBody = SortableContainer(({ children }) => {
  return <div>{children}</div>;
});
const SortableItem = SortableElement(({ children }) => <div style={{ marginBottom: 8 }}>{children}</div>);
const DragHandle = SortableHandle(() => <Button icon={<MenuOutlined />} />);

export default function OrganizeFields() {
  const [displayedTableFields, setDisplayedTableFields] = useGlobalState('displayedTableFields');
  const [fields, setFields] = useState(displayedTableFields);

  useEffect(() => {
    setFields(displayedTableFields);
  }, [JSON.stringify(displayedTableFields)]);

  return (
    <Collapse>
      <Panel header='字段管理'>
        <SortableBody
          useDragHandle
          helperClass='row-dragging'
          onSortEnd={({ oldIndex, newIndex }) => {
            const newFields = arrayMoveImmutable(fields, oldIndex, newIndex);
            setFields(newFields);
          }}
        >
          {_.map(fields, (value, index) => (
            <SortableItem key={`item-${value}`} index={index}>
              <Row gutter={8}>
                <Col flex='32px'>
                  <DragHandle />
                </Col>
                <Col flex='32px'>
                  <Button icon={<EyeOutlined />} />
                </Col>
                <Col flex='auto'>
                  <InputGroupWithFormItem label={value}>
                    <Input />
                  </InputGroupWithFormItem>
                </Col>
              </Row>
            </SortableItem>
          ))}
        </SortableBody>
      </Panel>
    </Collapse>
  );
}
