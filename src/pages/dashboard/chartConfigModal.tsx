import React, { useState, useEffect } from 'react';
import { Dashboard, Group, ChartConfig } from '@/store/dashboardInterface';
import { debounce } from 'lodash';
import { Radio, InputNumber, Input, Form, Modal, Select, Checkbox, Row, Col, Space } from 'antd';
import { createChart, updateCharts, checkPromql } from '@/services/dashboard';
import { Chart } from './chartGroup';
import { MinusCircleOutlined, PlusCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import PromqlEditor from '@/components/PromqlEditor';
import Resolution from '@/components/Resolution';
import DateRangePicker, { Range, formatPickerDate } from '@/components/DateRangePicker';
import Graph from '@/components/Graph';
const { Option } = Select;
const layout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 16,
  },
};
interface Props {
  busiId: string;
  groupId: number;
  show: boolean;
  onVisibleChange: (data: boolean) => void;
  initialValue?: Chart | null;
} // 新增图表和编辑图表均在此组件

export default function ChartConfigModal(props: Props) {
  const { t } = useTranslation();
  const { busiId, groupId, show, onVisibleChange, initialValue } = props;
  const layout = initialValue?.configs.layout;
  const [chartForm] = Form.useForm();
  const [initialQL, setInitialQL] = useState([{ PromQL: '' }]);
  const [chartPromQL, setChartPromQl] = useState<string[]>([]);
  const [step, setStep] = useState(15);
  const [chartVisible, setChartVisible] = useState<Boolean>(false);
  const [range, setRange] = useState<Range>({
    start: 0,
    end: 0,
  });
  useEffect(() => {
    if (initialValue) {
      chartForm.setFieldsValue(initialValue.configs);
      setInitialQL(initialValue.configs.QL);
    }
  }, [initialValue]);

  const handleAddChart = async (e) => {
    try {
      const values = await chartForm.validateFields();
      let formData: ChartConfig = Object.assign(chartForm.getFieldsValue(), {
        layout,
      });

      if (initialValue && initialValue.id) {
        await updateCharts(busiId, [
          {
            configs: formData,
            weight: 0,
            group_id: groupId,
            id: initialValue.id,
          },
        ]);
      } else {
        await createChart(busiId, {
          configs: JSON.stringify(formData),
          weight: 0,
          group_id: groupId,
        });
      }

      onVisibleChange(true);
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  useEffect(() => {
    console.log(`chartForm.getFieldValue('QL')`, chartForm.getFieldValue('QL'));
  }, [chartForm]);

  const PromqlEditorField = ({ onChange = (e: any) => {}, value = '', fields, remove, add, index, name }) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <PromqlEditor
          xCluster='Default'
          onChange={onChange}
          value={value}
          style={{
            // width: '340px',
            flex: 1,
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
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div>{initialValue ? t('编辑图表') : t('新建图表')}</div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: 12, lineHeight: '20px' }}>
            <DateRangePicker onChange={(e) => setRange(e)} />
            <Resolution onChange={(v) => setStep(v)} initialValue={step} />
            <CloseOutlined
              style={{ fontSize: 18 }}
              onClick={() => {
                onVisibleChange(false);
              }}
            />
          </div>
        </div>
      }
      width={900}
      visible={show}
      destroyOnClose={true}
      onOk={handleAddChart}
      closable={false}
      onCancel={() => {
        onVisibleChange(false);
      }}
    >
      <Form {...layout} form={chartForm} preserve={false}>
        <Row>
          <Col span={12}>
            <Form.Item
              label={t('标题')}
              name='name'
              labelCol={{
                span: 4,
              }}
              wrapperCol={{
                span: 20,
              }}
              rules={[
                {
                  required: true,
                  message: t('图表名称'),
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item label={t('下钻链接')} name='link' labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
              <Input />
            </Form.Item>

            <Form.Item
              wrapperCol={{
                span: 24,
              }}
              style={{
                marginBottom: '0px',
              }}
            >
              <Form.List name='QL' initialValue={initialQL}>
                {(fields, { add, remove }, { errors }) => {
                  return (
                    <>
                      {fields.length ? (
                        fields.map(({ key, name, fieldKey, ...restField }, index) => {
                          return (
                            <div key={name + fieldKey}>
                              <Form.Item
                                label='PromQL'
                                name={[name, 'PromQL']}
                                labelCol={{
                                  span: 4,
                                }}
                                wrapperCol={{
                                  span: 20,
                                }}
                                validateTrigger={['onBlur']}
                                rules={[
                                  {
                                    required: true,
                                    message: t('请输入PromQL'),
                                  },
                                ]}
                              >
                                <PromqlEditorField
                                  key={name + fieldKey}
                                  name={name}
                                  fields={fields}
                                  index={index}
                                  remove={remove}
                                  add={add}
                                  // onChange={(e) => {
                                  //   handleChartOptions(e);
                                  // }}
                                />
                              </Form.Item>
                              <Form.Item
                                label='Legend'
                                name={[name, 'Legend']}
                                labelCol={{
                                  span: 4,
                                }}
                                wrapperCol={{
                                  span: 20,
                                }}
                              >
                                <Input
                                // onChange={(e) => {
                                //   handleChartOptions(e);
                                // }}
                                />
                              </Form.Item>
                            </div>
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
                    </>
                  );
                }}
              </Form.List>
            </Form.Item>
            <Row>
              <Col span={11}>
                <Form.Item label={t('预警值')} name='yplotline1' labelCol={{ span: 9 }} wrapperCol={{ span: 16 }}>
                  <InputNumber />
                </Form.Item>
              </Col>
              <Col span={12} offset={1}>
                <Form.Item label={t('警告值')} name='yplotline2' labelCol={{ span: 7 }} wrapperCol={{ span: 20 }}>
                  <InputNumber />
                </Form.Item>
              </Col>

              <Col span={7}>
                <Form.Item label={t('Multi')} name='multi' valuePropName='checked' labelCol={{ span: 14 }} wrapperCol={{ span: 10 }} initialValue={true}>
                  <Checkbox></Checkbox>
                </Form.Item>
              </Col>
              <Col span={7} offset={1}>
                <Form.Item label={t('Legend')} valuePropName='checked' name='legend' labelCol={{ span: 20 }} wrapperCol={{ span: 10 }} initialValue={false}>
                  <Checkbox></Checkbox>
                </Form.Item>
              </Col>
              <Col span={7} offset={1}>
                <Form.Item label={t('Format')} valuePropName='checked' name='format' labelCol={{ span: 20 }} wrapperCol={{ span: 10 }} initialValue={true}>
                  <Checkbox></Checkbox>
                </Form.Item>
              </Col>
              {/* <Col span={5} offset={1}>
            <Form.Item label={t('排序')} name='order' labelCol={{ span: 7 }} wrapperCol={{ span: 20 }} initialValue={'desc'}>
              <Select>
                <Option value='desc'>desc</Option>
                <Option value='asc'>asc</Option>
              </Select>
            </Form.Item>
          </Col> */}
              {/* <Col span={5} offset={1}>
            <Form.Item label={t('Format Unit')} name='format' labelCol={{ span: 10 }} wrapperCol={{ span: 20 }} initialValue={1000}>
              <Select>
                <Option value='desc'>1000</Option>
                <Option value='asc'>1024</Option>
              </Select>
            </Form.Item>
          </Col> */}
            </Row>
          </Col>
          <Col span={12}>
            <Form.Item
              wrapperCol={{ span: 22, offset: 2 }}
              shouldUpdate={(prevValues, curValues) =>
                prevValues.QL !== curValues.QL || prevValues.multi === curValues.multi || prevValues.legend === curValues.legend || prevValues.format === curValues.format
              }
            >
              {({ getFieldsValue }) => {
                const { QL = [], multi, legend, format, yplotline1, yplotline2 } = getFieldsValue();
                // return QL.filter((item) => item && item.PromQL).map((item) => item.PromQL).length > 0 ? (
                return (
                  <Graph
                    showHeader={false}
                    graphConfigInnerVisible={false}
                    highLevelConfig={{ shared: multi, precision: format ? 'short' : 'origin' }}
                    data={{
                      yAxis: {
                        plotLines: [
                          {
                            value: yplotline1,
                            color: 'red',
                          },
                          {
                            value: yplotline2,
                            color: 'green',
                          },
                        ],
                      },
                      legend: legend,
                      step,
                      range,
                      promqls: QL.filter((item) => item && item.PromQL).map((item) => item.PromQL),
                    }}
                  />
                );
                // ) : null;
              }}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
