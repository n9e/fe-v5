import React, { useState, useEffect } from 'react';
import { GetMetrics } from '@/services/metric';
import { Metric } from '@/pages/metric/matric';
import { Dashboard, Group, ChartConfig } from '@/store/dashboardInterface';
import {
  resourceGroupItem,
  resourceItem,
  prefixType,
} from '@/store/businessInterface/resource';
import { debounce } from 'lodash';
import {
  Radio,
  InputNumber,
  Input,
  Form,
  Modal,
  Select,
  Checkbox,
  Row,
  Col,
  Space,
} from 'antd';
const { Option } = Select;
import {
  getResourceGroups,
  getResourceList,
  getResourceListAll,
} from '@/services/resource';
import { GetTagPairs } from '@/services/metric';
import { createChart, updateChart, checkPromql } from '@/services/dashboard';
import { formatTag, TagItem } from '@/components/TagFilterForChart';
import { Chart } from './chartGroup';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import PromqlEditor from '@/components/PromqlEditor';
const layout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 16,
  },
};
interface Props {
  groupId: number;
  show: boolean;
  onVisibleChange: (data: boolean) => void;
  initialValue?: Chart | null;
} // 新增图表和编辑图表均在此组件

export default function ChartConfigModal(props: Props) {
  const { t } = useTranslation();
  const { groupId, show, onVisibleChange, initialValue } = props;
  const layout = initialValue?.configs.layout;
  const [chartForm] = Form.useForm();
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [selMetrics, setSelMetrics] = useState<Metric[]>([]);
  const [classpaths, setClasspaths] = useState<resourceGroupItem[]>([]);
  const [selClasspath, setSelClasspath] = useState<string>();
  const [resources, setResources] = useState<resourceItem[]>([]);
  const [selResource, setSelResource] = useState<string[]>();
  const [tags, setTags] = useState<TagItem[]>([]);
  const [promeQl, setpromeQl] = useState<string[]>(['']);
  useEffect(() => {
    getMetrics();
    getClassPaths();
    fetchResources();

    if (initialValue) {
      chartForm.setFieldsValue(initialValue.configs);

      if (initialValue.configs.metric) {
        handleSelectChange(initialValue.configs.metric);
      }
    }
    setpromeQl(chartForm.getFieldValue('prome_ql'));
  }, [initialValue]);

  const getMetrics = (metric?) => {
    GetMetrics({
      limit: 150,
      metric,
    }).then((res) => {
      if (res.dat.metrics) {
        setMetrics(res.dat.metrics);
      }
    });
  };

  const handleSelectChange = (selects) => {
    setSelMetrics(selects);
    let params = selects.map((metric) => ({
      metric,
    }));
    GetTagPairs({
      limit: 200,
      params,
    }).then((res) => {
      if (res.dat.tags) {
        setTags(formatTag(res.dat.tags));
      }
    });
  };

  const fetchResources = () => {
    getResourceListAll().then((res) => {
      setResources(res.dat.list || []);
    });
  };

  const handleSearch = debounce((value) => {
    if (value.length > 0 && value.length < 4) return;
    getMetrics(value);
  }, 500);

  const handleClasspathSearch = debounce((value) => {
    getClassPaths(value);
  }, 500);

  const getClassPaths = (search?) => {
    getResourceGroups(search).then((res) => {
      if (res.dat.list) {
        setClasspaths(res.dat.list);
      }
    });
  };

  const handleAddChart = async (e) => {
    try {
      const values = await chartForm.validateFields();
      let formData: ChartConfig = Object.assign(chartForm.getFieldsValue(), {
        layout,
      });

      if (initialValue && initialValue.id) {
        await updateChart(initialValue.id, {
          configs: JSON.stringify(formData),
          weight: 0,
        });
      } else {
        await createChart(groupId, {
          configs: JSON.stringify(formData),
          weight: 0,
        });
      }

      onVisibleChange(true);
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  const validatorLine = async (_, value) => {
    let res = await checkPromql(value);

    if (res.dat.ql_correct) {
      return Promise.resolve();
    } else {
      return Promise.reject(new Error(`${res.dat.parse_error}`));
    }
  };

  return (
    <Modal
      title={initialValue ? t('编辑图表') : t('新建图表')}
      visible={show}
      destroyOnClose={true}
      onOk={handleAddChart}
      onCancel={() => {
        onVisibleChange(false);
      }}
    >
      <Form {...layout} form={chartForm} preserve={false}>
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

        <Form.Item
          label={t('配置方式')}
          name='mode'
          initialValue='nightingale'
          labelCol={{
            span: 4,
          }}
          wrapperCol={{
            span: 20,
          }}
        >
          <Radio.Group>
            <Radio value='nightingale'>nightingale</Radio>
            <Radio value='prometheus'>prometheus</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          shouldUpdate
          wrapperCol={{
            span: 24,
          }}
          style={{
            marginBottom: '0px',
          }}
        >
          {() => {
            return chartForm.getFieldValue('mode') === 'nightingale' ? (
              <>
                <Form.Item
                  label={t('指标')}
                  name='metric'
                  labelCol={{
                    span: 4,
                  }}
                  wrapperCol={{
                    span: 20,
                  }}
                  rules={[
                    {
                      required: true,
                      message: t('请选择指标'),
                    },
                  ]}
                >
                  <Select
                    mode='multiple'
                    style={{
                      width: '100%',
                    }}
                    placeholder={t('请输入监控指标(输入4个以上字符发起检索)')}
                    value={selMetrics}
                    onChange={handleSelectChange}
                    onSearch={handleSearch}
                    filterOption={false}
                  >
                    {metrics.map((item, i) => {
                      return (
                        <Option key={i} value={item.name}>
                          {item.name} {item.description}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>

                <Form.Item
                  label={t('资源分组')}
                  name='classpath_id'
                  labelCol={{
                    span: 4,
                  }}
                  wrapperCol={{
                    span: 20,
                  }} // rules={[{ required: true, message: '请选择资源分组' }]}
                >
                  <Select
                    style={{
                      width: '100%',
                    }}
                    placeholder={t('请选择资源分组')}
                    value={selClasspath}
                    onChange={(e) => setSelClasspath(e)}
                    onSearch={handleClasspathSearch}
                    filterOption={false}
                    showSearch
                    allowClear
                  >
                    {classpaths.map((item, i) => {
                      return (
                        <Option key={i} value={item.id}>
                          {item.path}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>

                <Form.Item
                  label={t('前缀匹配')}
                  name='classpath_prefix'
                  labelCol={{
                    span: 4,
                  }}
                  wrapperCol={{
                    span: 20,
                  }}
                  valuePropName='checked' // rules={[{ required: true, message: '请选择资源分组' }]}
                >
                  <Checkbox></Checkbox>
                </Form.Item>

                {tags.map((tagItem, index) => {
                  return (
                    <Form.Item
                      key={index}
                      label={tagItem.tagKey}
                      name={['tags', tagItem.tagKey]}
                      labelCol={{
                        span: 4,
                      }}
                      wrapperCol={{
                        span: 20,
                      }} // rules={[{ required: true }]}
                    >
                      <Select
                        style={{
                          width: '100%',
                        }}
                        allowClear
                        mode='multiple'
                      >
                        {tagItem.tagValue.map((item, i) => {
                          return (
                            <Option key={i} value={item}>
                              {item}
                            </Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  );
                })}
              </>
            ) : (
              <Form.Item
                label='Promql'
                labelCol={{
                  span: 4,
                }}
                style={{
                  marginBottom: 0,
                }}
              >
                <Form.List name='prome_ql' initialValue={promeQl}>
                  {(fields, { add, remove }, { errors }) => {
                    return (
                      <>
                        {fields.length ? (
                          fields.map(
                            ({ key, name, fieldKey, ...restField }, index) => {
                              return (
                                <Space
                                  key={name}
                                  style={{
                                    display: 'flex',
                                    marginBottom: 8,
                                  }}
                                  align='baseline'
                                >
                                  <Form.Item
                                    name={[name]}
                                    validateTrigger={['onChange', 'onBlur']}
                                    rules={[
                                      {
                                        required: true,
                                        message: t('请输入PromQL'),
                                      },
                                      // {
                                      //   validator: validatorLine,
                                      // },
                                    ]}
                                  >
                                    <PromqlEditor
                                      xCluster='Default'
                                      onChange={() => {
                                        setpromeQl(
                                          chartForm
                                            .getFieldValue('prome_ql')
                                            .filter((ele) => ele !== undefined),
                                        );
                                      }}
                                      style={{
                                        width: '340px',
                                      }}
                                    />
                                  </Form.Item>
                                  {fields.length > 1 ? (
                                    <MinusCircleOutlined
                                      onClick={() => {
                                        remove(name);
                                        setpromeQl(
                                          chartForm
                                            .getFieldValue('prome_ql')
                                            .filter((ele) => ele !== undefined),
                                        );
                                      }}
                                    />
                                  ) : null}
                                  {index === fields.length - 1 && (
                                    <PlusCircleOutlined
                                      onClick={() => {
                                        add();
                                      }}
                                    />
                                  )}
                                </Space>
                              );
                            },
                          )
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
            );
          }}
        </Form.Item>

        <Form.Item
          label={t('阈值')}
          name='yplotline'
          labelCol={{
            span: 4,
          }}
          wrapperCol={{
            span: 20,
          }}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          label={t('下钻链接')}
          name='link'
          labelCol={{
            span: 4,
          }}
          wrapperCol={{
            span: 20,
          }}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
