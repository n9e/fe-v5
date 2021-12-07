import React, { useState, useEffect } from 'react';
import { HighLevelConfigType, Group, ChartConfig } from '@/store/dashboardInterface';
import { debounce } from 'lodash';
import { Radio, InputNumber, Input, Form, Modal, Select, Checkbox, Row, Col, Popover, Menu, Dropdown, Button } from 'antd';
import { createChart, updateCharts, checkPromql } from '@/services/dashboard';
import { Chart } from './chartGroup';
import { MinusCircleOutlined, PlusCircleOutlined, CloseOutlined, DownOutlined, SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import PromqlEditor from '@/components/PromqlEditor';
import Resolution from '@/components/Resolution';
import DateRangePicker, { Range, formatPickerDate } from '@/components/DateRangePicker';
import Graph from '@/components/Graph';
import VariableConfig, { VariableType } from './VariableConfig';
import { replaceExpressionVars } from './VariableConfig/constant';

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
  variableConfig: VariableType | undefined;
} // 新增图表和编辑图表均在此组件

export default function ChartConfigModal(props: Props) {
  const { t } = useTranslation();
  const { busiId, groupId, show, onVisibleChange, initialValue, variableConfig } = props;
  const layout = initialValue?.configs.layout;
  const [innerVariableConfig, setInnerVariableConfig] = useState<VariableType | undefined>(variableConfig);
  const [chartForm] = Form.useForm();
  const [initialQL, setInitialQL] = useState([{ PromQL: '' }]);
  const [legend, setLegend] = useState<boolean>(initialValue?.configs.legend || false);
  const [step, setStep] = useState<number | null>(null);
  const [highLevelConfig, setHighLevelConfig] = useState<HighLevelConfigType>(
    initialValue?.configs.highLevelConfig || {
      shared: true,
      sharedSortDirection: 'desc',
      precision: 'short',
      formatUnit: 1000,
    },
  );
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
      await chartForm.validateFields();
      let formData: ChartConfig = Object.assign(
        chartForm.getFieldsValue(),
        { legend, highLevelConfig },
        {
          version: 1, // Temporarily, hardcode 1
          layout,
        },
      );
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

  const handleVariableChange = (value) => {
    setInnerVariableConfig(value);
  };

  const aggrFuncMenu = (
    <Menu
      onClick={(sort) => {
        setHighLevelConfig({ ...highLevelConfig, sharedSortDirection: (sort as { key: 'desc' | 'asc' }).key });
      }}
      selectedKeys={[highLevelConfig.sharedSortDirection]}
    >
      <Menu.Item key='desc'>desc</Menu.Item>
      <Menu.Item key='asc'>asc</Menu.Item>
    </Menu>
  );

  const precisionMenu = (
    <Menu
      onClick={(precision) => {
        const precisionKey = isNaN(Number(precision.key)) ? precision.key : Number(precision.key);
        setHighLevelConfig({ ...highLevelConfig, formatUnit: precisionKey as 1024 | 1000 | 'humantime' });
      }}
      selectedKeys={[String(highLevelConfig.formatUnit)]}
    >
      <Menu.Item key={'1000'}>Ki, Mi, Gi by 1000</Menu.Item>
      <Menu.Item key={'1024'}>Ki, Mi, Gi by 1024</Menu.Item>
      <Menu.Item key={'humantime'}>Human time duration</Menu.Item>
    </Menu>
  );

  const formatUnitInfoMap = {
    1024: 'Ki, Mi, Gi by 1024',
    1000: 'Ki, Mi, Gi by 1000',
    humantime: 'Human time duration',
  };

  const getContent = () => {
    const aggrFuncMenu = (
      <Menu
        onClick={(sort) => {
          setHighLevelConfig({ ...highLevelConfig, sharedSortDirection: (sort as { key: 'desc' | 'asc' }).key });
        }}
        selectedKeys={[highLevelConfig.sharedSortDirection]}
      >
        <Menu.Item key='desc'>desc</Menu.Item>
        <Menu.Item key='asc'>asc</Menu.Item>
      </Menu>
    );
    const precisionMenu = (
      <Menu
        onClick={(precision) => {
          const precisionKey = isNaN(Number(precision.key)) ? precision.key : Number(precision.key);
          setHighLevelConfig({ ...highLevelConfig, formatUnit: precisionKey as 1024 | 1000 | 'humantime' });
        }}
        selectedKeys={[String(highLevelConfig.formatUnit)]}
      >
        <Menu.Item key={'1000'}>Ki, Mi, Gi by 1000</Menu.Item>
        <Menu.Item key={'1024'}>Ki, Mi, Gi by 1024</Menu.Item>
        <Menu.Item key={'humantime'}>Human time duration</Menu.Item>
      </Menu>
    );
    return (
      <div>
        <Checkbox
          checked={highLevelConfig.shared}
          onChange={(e) => {
            setHighLevelConfig({ ...highLevelConfig, shared: e.target.checked });
          }}
        >
          Multi Series in Tooltip, order value
        </Checkbox>
        <Dropdown overlay={aggrFuncMenu}>
          <a className='ant-dropdown-link' onClick={(e) => e.preventDefault()}>
            {highLevelConfig.sharedSortDirection} <DownOutlined />
          </a>
        </Dropdown>
        <br />
        <Checkbox
          checked={legend}
          onChange={(e) => {
            setLegend(e.target.checked);
          }}
        >
          Show Legend
        </Checkbox>
        <br />
        <Checkbox
          checked={highLevelConfig.precision === 'short'}
          onChange={(e) => {
            setHighLevelConfig({ ...highLevelConfig, precision: e.target.checked ? 'short' : 'origin' });
          }}
        >
          Value format with:{' '}
        </Checkbox>
        <Dropdown overlay={precisionMenu}>
          <a className='ant-dropdown-link' onClick={(e) => e.preventDefault()}>
            {formatUnitInfoMap[highLevelConfig.formatUnit]} <DownOutlined />
          </a>
        </Dropdown>
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
            <VariableConfig onChange={handleVariableChange} value={innerVariableConfig} editable={false} />
            <br />
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
                                labelCol={{
                                  span: 4,
                                }}
                                wrapperCol={{
                                  span: 20,
                                }}
                              >
                                <Input />
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
                <Form.Item label={t('危险值')} name='yplotline2' labelCol={{ span: 7 }} wrapperCol={{ span: 20 }}>
                  <InputNumber />
                </Form.Item>
              </Col>

              {/* <Col span={23} offset={1}>
                <Form.Item>
                  <Checkbox
                    checked={highLevelConfig.shared}
                    onChange={(e) => {
                      setHighLevelConfig({ ...highLevelConfig, shared: e.target.checked });
                    }}
                  >
                    Multi Series in Tooltip, order value
                  </Checkbox>
                  <Dropdown overlay={aggrFuncMenu}>
                    <a className='ant-dropdown-link' onClick={(e) => e.preventDefault()}>
                      {highLevelConfig.sharedSortDirection} <DownOutlined />
                    </a>
                  </Dropdown>
                </Form.Item>
              </Col>
              <Col span={23} offset={1}>
                <Form.Item>
                  <Checkbox
                    checked={legend}
                    onChange={(e) => {
                      setLegend(e.target.checked);
                    }}
                  >
                    Show Legend
                  </Checkbox>
                </Form.Item>
              </Col>
              <Col span={23} offset={1}>
                <Form.Item>
                  <Checkbox
                    checked={highLevelConfig.precision === 'short'}
                    onChange={(e) => {
                      setHighLevelConfig({ ...highLevelConfig, precision: e.target.checked ? 'short' : 'origin' });
                    }}
                  >
                    Value format with:{' '}
                  </Checkbox>
                  <Dropdown overlay={precisionMenu}>
                    <a className='ant-dropdown-link' onClick={(e) => e.preventDefault()}>
                      {formatUnitInfoMap[highLevelConfig.formatUnit]} <DownOutlined />
                    </a>
                  </Dropdown>
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
                const { QL = [], yplotline1, yplotline2 } = getFieldsValue();
                const promqls = QL.filter((item) => item && item.PromQL).map((item) =>
                  innerVariableConfig ? replaceExpressionVars(item.PromQL, innerVariableConfig, innerVariableConfig.var.length) : item.PromQL,
                );
                const legendTitleFormats = QL.map((item) => item && item.Legend);
                return (
                  <div className={legend ? 'graph-container graph-container-hasLegend' : 'graph-container'}>
                    <div className='graph-header' style={{ height: '35px', lineHeight: '35px', display: 'flex', justifyContent: 'space-between' }}>
                      <div>预览图表</div>
                      <div className='graph-extra'>
                        <span className='graph-operationbar-item' key='info'>
                          <Popover placement='left' content={getContent()} trigger='click' autoAdjustOverflow={false} getPopupContainer={() => document.body}>
                            <Button className='' type='link' size='small' onClick={(e) => e.preventDefault()}>
                              <SettingOutlined />
                            </Button>
                          </Popover>
                        </span>
                      </div>
                    </div>
                    <Graph
                      showHeader={false}
                      graphConfigInnerVisible={false}
                      highLevelConfig={highLevelConfig}
                      data={{
                        yAxis: {
                          plotLines: [
                            {
                              value: yplotline1 ? yplotline1 : undefined,
                              color: 'orange',
                            },
                            {
                              value: yplotline2 ? yplotline2 : undefined,
                              color: 'red',
                            },
                          ],
                        },
                        legend: legend,
                        step,
                        range,
                        promqls,
                        legendTitleFormats,
                      }}
                    />
                  </div>
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
