import React, { useState } from 'react';
import { Modal, Form, Input, Row, Col, Select, Space, Collapse } from 'antd';
import { MinusCircleOutlined, PlusCircleOutlined, CloseOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useSize } from 'ahooks';
import DateRangePicker, { Range } from '@/components/DateRangePicker';
import PromqlEditor from '@/components/PromqlEditor';
import Resolution from '@/components/Resolution';
import ModalHOC, { ModalWrapProps } from './ModalHOC';
import { visualizations } from './config';
import Renderer from '../Renderer';
import { Chart } from '../chartGroup';
import Options from './Options';
import N9eCollapse, { Panel as N9ePanel } from './Components/Collapse';

interface IProps {
  initialValues: Chart | null;
}

const { Panel } = Collapse;

function index(props: ModalWrapProps & IProps) {
  const { t } = useTranslation();
  const { visible, initialValues } = props;
  const size = useSize(document.querySelector('body'));
  const [chartForm] = Form.useForm();
  const [range, setRange] = useState<Range>({
    description: '小时',
    num: 1,
    unit: 'hour',
  });
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
              add({ PromQL: '', expaned: true });
            }}
          />
        )}
      </div>
    );
  };
  return (
    <Form
      layout='vertical'
      form={chartForm}
      preserve={false}
      initialValues={_.merge(
        {},
        {
          type: 'timeseries',
          targets: [{ expr: '', expaned: true }],
        },
        initialValues,
      )}
    >
      <Modal
        width='100%'
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div>{initialValues ? t('编辑图表') : t('新建图表')}</div>
            <Space style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: 12, lineHeight: '20px' }}>
              <Form.Item name='type' noStyle>
                <Select>
                  {_.map(visualizations, (item) => {
                    return (
                      <Select.Option value={item.type} key={item.type}>
                        {item.name}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
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
        style={{ top: 10, padding: 0 }}
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
        <div
          style={{
            height: size.height ? size.height - 120 : 500,
          }}
        >
          <Row
            gutter={20}
            style={{
              flexWrap: 'nowrap',
              height: '100%',
            }}
          >
            <Col flex={1}>
              <Form.Item noStyle shouldUpdate={(prevValues, curValues) => !_.isEqual(prevValues.targets, curValues.targets)}>
                {({ getFieldValue }) => {
                  const targets = getFieldValue('targets');
                  return <Renderer time={range} step={step} targets={targets} />;
                }}
              </Form.Item>
              <div style={{ marginTop: 20, height: 'calc(100% - 220px)', overflowY: 'auto' }}>
                <Form.List name='targets'>
                  {(fields, { add, remove }, { errors }) => {
                    const currentTargets = chartForm.getFieldValue('targets');
                    const activeKey: string[] = [];
                    _.forEach(currentTargets, (item, idx) => {
                      if (item.expaned) {
                        activeKey.push(_.toString(idx));
                      }
                    });
                    return (
                      <>
                        <Collapse
                          activeKey={activeKey}
                          onChange={(keys) => {
                            chartForm.setFieldsValue({
                              targets: _.map(chartForm.getFieldValue('targets'), (item, idx) => {
                                return {
                                  ...item,
                                  expaned: _.includes(keys, _.toString(idx)),
                                };
                              }),
                            });
                          }}
                        >
                          {fields.length ? (
                            fields.map(({ key, name, fieldKey, ...restField }, index) => {
                              return (
                                <Panel header={`Query ${index}`} key={index}>
                                  <Form.Item
                                    label='PromQL'
                                    name={[name, 'expr']}
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
                                add({
                                  PromQL: '',
                                  expaned: true,
                                });
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
            <Col flex='600px' style={{ overflowY: 'auto' }}>
              <N9eCollapse>
                <N9ePanel header='面板配置'>
                  <>
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
                  </>
                </N9ePanel>
                <Options />
              </N9eCollapse>
            </Col>
          </Row>
        </div>
      </Modal>
    </Form>
  );
}

export default ModalHOC(index);
