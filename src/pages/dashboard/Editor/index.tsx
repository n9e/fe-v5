import React, { useState } from 'react';
import { Modal, Radio, Form, Input, Collapse, Row, Col, Select, Space } from 'antd';
import { MinusCircleOutlined, PlusCircleOutlined, CloseOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import DateRangePicker, { Range } from '@/components/DateRangePicker';
import PromqlEditor from '@/components/PromqlEditor';
import Resolution from '@/components/Resolution';
import ModalHOC, { ModalWrapProps } from './ModalHOC';
import { visualizations } from './config';
import Renderer from '../Renderer';
import { Chart } from '../chartGroup';

interface IProps {
  initialValue: Chart | null;
}

const WIDTH = '90%';
const { Panel } = Collapse;

function index(props: ModalWrapProps & IProps) {
  const { t } = useTranslation();
  const { visible, initialValue } = props;
  const [chartForm] = Form.useForm();
  const [initialQL, setInitialQL] = useState([{ PromQL: '' }]);
  const [range, setRange] = useState<Range>({
    start: 0,
    end: 0,
  });
  const [visualizationType, setVisualizationType] = useState('timeSeries');
  const [step, setStep] = useState<number | null>(null);
  const PromqlEditorField = ({ onChange = (e: any) => {}, value = '', fields, remove, add, index, name }) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <PromqlEditor
          xCluster='Default'
          onChange={onChange}
          value={value}
          style={{
            width: '310px',
            // flex: 1,
          }}
        />
        {fields.length > 1 ? (
          <MinusCircleOutlined
            style={{ marginLeft: 10 }}
            onClick={() => {
              remove(name);
            }}
          />
        ) : null}
        {index === fields.length - 1 && (
          <PlusCircleOutlined
            style={{ marginLeft: 10 }}
            onClick={() => {
              add();
            }}
          />
        )}
      </div>
    );
  };
  return (
    <Modal
      width={WIDTH}
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div>{initialValue ? t('编辑图表') : t('新建图表')}</div>
          <Space style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: 12, lineHeight: '20px' }}>
            <Select
              value={visualizationType}
              onChange={(val: string) => {
                setVisualizationType(val);
              }}
            >
              {_.map(visualizations, (item) => {
                return (
                  <Select.Option value={item.type} key={item.type}>
                    {item.name}
                  </Select.Option>
                );
              })}
            </Select>
            <DateRangePicker onChange={(e) => setRange(e)} />
            <Resolution onChange={(v) => setStep(v)} initialValue={step} />
            <CloseOutlined
              style={{ fontSize: 18 }}
              onClick={() => {
                props.destroy();
              }}
            />
          </Space>
        </div>
      }
      visible={visible}
      closable={false}
      footer={null}
      onCancel={() => {
        props.destroy();
      }}
      bodyStyle={{
        padding: '10px 24px 24px 24px',
      }}
    >
      <Form layout='vertical' form={chartForm} preserve={false}>
        <Row gutter={20}>
          <Col flex={1}>
            <Form.Item noStyle shouldUpdate={(prevValues, curValues) => prevValues.QL !== curValues.QL}>
              {({ getFieldValue }) => {
                const QL = getFieldValue('QL');
                return <Renderer time={range} step={step} query={QL} />;
              }}
            </Form.Item>
            <div style={{ marginTop: 20 }}>
              <Form.List name='QL' initialValue={initialQL}>
                {(fields, { add, remove }, { errors }) => {
                  return (
                    <>
                      <Collapse>
                        {fields.length ? (
                          fields.map(({ key, name, fieldKey, ...restField }, index) => {
                            return (
                              <Panel header={`Query ${index}`} key={index}>
                                <Form.Item
                                  label='PromQL'
                                  name={[name, 'PromQL']}
                                  validateTrigger={['onBlur']}
                                  rules={[
                                    {
                                      required: true,
                                      message: '请输入PromQL',
                                    },
                                  ]}
                                >
                                  <PromqlEditorField key={name + fieldKey} name={name} fields={fields} index={index} remove={remove} add={add} />
                                </Form.Item>
                                <Form.Item
                                  label='Legend'
                                  name={[name, 'Legend']}
                                  tooltip={{
                                    getPopupContainer: () => document.body,
                                    title:
                                      'Controls the name of the time series, using name or pattern. For example {{hostname}} will be replaced with label value for the label hostname.',
                                  }}
                                >
                                  <Input />
                                </Form.Item>
                              </Panel>
                            );
                          })
                        ) : (
                          <PlusCircleOutlined
                            onClick={() => {
                              add();
                            }}
                          />
                        )}
                        <Form.ErrorList errors={errors} />
                      </Collapse>
                    </>
                  );
                }}
              </Form.List>
            </div>
          </Col>
          <Col flex='600px'>
            <Collapse defaultActiveKey={['base', 'config']}>
              <Panel header='面板配置' key='base'>
                <div>
                  <Form.Item
                    label={'标题'}
                    name='name'
                    rules={[
                      {
                        required: true,
                        message: '图表名称',
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item label={'下钻链接'} name='link'>
                    <Input />
                  </Form.Item>
                </div>
              </Panel>
              <Panel header='图表配置' key='config'>
                <div></div>
              </Panel>
            </Collapse>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}

export default ModalHOC(index);
