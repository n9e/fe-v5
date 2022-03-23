import React from 'react';
import { Form, Select, InputNumber, Row, Col, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
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
                title={
                  <div>
                    <div>SI: 基数为 1000, 单位为 B、kB、MB、GB、TB、PB、EB、ZB、YB</div>
                    <div>IEC: 基数为 1024, 单位为 B、KiB、MiB、GiB、TiB、PiB、EiB、ZiB、YiB</div>
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
          <Select placeholder='none' allowClear>
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
            <OptGroup label='Human time duration'>
              <Option value='humantimeSeconds'>Humanize(seconds)</Option>
              <Option value='humantimeMilliseconds'>Humanize(milliseconds)</Option>
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
