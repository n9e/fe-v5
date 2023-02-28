import React, { useState, useEffect } from 'react';
import { Form, InputNumber, Radio, Select, Checkbox, Space, Input } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { getBrainParams } from '@/services/warning';
import { useTranslation } from 'react-i18next';
interface IProps {
  form: any;
}
export default function index(props: IProps) {
  const { t } = useTranslation();
  const { form } = props;
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [defaultParams, setDefaultParams] = useState<any>({});
  useEffect(() => {
    getBrainParams().then((res) => {
      setDefaultParams(res);
    });
  }, []);
  return (
    <>
      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          return (
            <>
              <Form.Item label={t('告警方式')}>
                <Radio.Group
                  buttonStyle='solid'
                  value={getFieldValue('algorithm') === 'holtwinters' ? 'abnormalDetection' : 'threshold'}
                  onChange={(e) => {
                    if (e.target.value === 'abnormalDetection') {
                      form.setFieldsValue({
                        algorithm: 'holtwinters',
                        algo_params: defaultParams?.holtwinters,
                      });
                    } else {
                      form.setFieldsValue({
                        algorithm: '',
                        algo_params: undefined,
                      });
                    }
                  }}
                >
                  <Radio.Button value='threshold'>{t('阈值告警')}</Radio.Button>
                  <Radio.Button value='abnormalDetection'>{t('智能告警')}</Radio.Button>
                </Radio.Group>
              </Form.Item>
              {getFieldValue('algorithm') === 'holtwinters' && (
                <>
                  <Form.Item
                    label={t('使用算法')}
                    name='algorithm'
                    style={{
                      display: 'none',
                    }}
                  >
                    <Select>
                      <Select.Option value='holtwinters'>holtwinters</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label={t('高级配置')}>
                    <div
                      style={{
                        height: 32,
                        lineHeight: '32px',
                        userSelect: 'none',
                      }}
                    >
                      <a onClick={() => setSettingsVisible(!settingsVisible)}>{settingsVisible ? t('收起') : t('展开')}</a>
                    </div>
                    <div
                      style={{
                        display: settingsVisible ? 'block' : 'none',
                      }}
                    >
                      <div>
                        {t('季节性周期时间为：')}
                        <Form.Item noStyle name={['algo_params', 'seasonal_duration']}>
                          <Select
                            style={{
                              width: 100,
                            }}
                          >
                            <Select.Option value={3600}>{t('小时')}</Select.Option>
                            <Select.Option value={86400}>{t('天')}</Select.Option>
                            <Select.Option value={604800}>{t('周')}</Select.Option>
                            <Select.Option value={2592000}>{t('月')}</Select.Option>
                          </Select>
                        </Form.Item>{' '}
                        {/* , 根据{' '}
                    <Form.Item noStyle name={['algo_params', 'rollup_interval']}>
                     <InputNumber />
                    </Form.Item>{' '}
                    秒区间, 对数据进行平滑计算 */}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          marginTop: 16,
                        }}
                      >
                        <div
                          style={{
                            marginRight: 16,
                          }}
                        >
                          {t('偏离')}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            gap: 20,
                          }}
                        >
                          <div
                            style={{
                              marginBottom: 16,
                            }}
                          >
                            <Form.Item
                              noStyle
                              name={['algo_params', 'upper_bound']}
                              valuePropName='checked'
                              getValueFromEvent={(e) => {
                                return e.target.checked ? 1 : 0;
                              }}
                            >
                              <Checkbox>{t('上界')}</Checkbox>
                            </Form.Item>
                            <Form.Item noStyle name={['algo_params', 'upper_times_num']}>
                              <InputNumber />
                            </Form.Item>{' '}
                            {t('倍误差')}
                          </div>
                          <div>
                            <Form.Item
                              noStyle
                              name={['algo_params', 'lower_bound']}
                              valuePropName='checked'
                              getValueFromEvent={(e) => {
                                return e.target.checked ? 1 : 0;
                              }}
                            >
                              <Checkbox>{t('下界')}</Checkbox>
                            </Form.Item>
                            <Form.Item noStyle name={['algo_params', 'lower_times_num']}>
                              <InputNumber />
                            </Form.Item>{' '}
                            {t('倍误差')}
                          </div>
                        </div>
                      </div>
                      <div>
                        <Form.List name={['algo_params', 'compares']}>
                          {(fields, { add, remove }) => (
                            <>
                              <div
                                style={{
                                  marginBottom: 10,
                                }}
                              >
                                {t('同环比')}
                                {t('比')}{' '}
                                <PlusCircleOutlined
                                  onClick={() => {
                                    add({
                                      operator: 1,
                                      offset: 86400,
                                      bound_type: 0,
                                    });
                                  }}
                                />
                              </div>
                              {fields.map(({ key, name, ...restField }) => (
                                <Space
                                  key={key}
                                  style={{
                                    display: 'flex',
                                    marginBottom: 8,
                                  }}
                                  align='baseline'
                                >
                                  <Form.Item {...restField} name={[name, 'operator']}>
                                    <Select>
                                      <Select.Option value={1}>{t('且')}</Select.Option>
                                      <Select.Option value={0}>{t('或')}</Select.Option>
                                    </Select>
                                  </Form.Item>
                                  <span>{t('相比')}</span>
                                  <Form.Item {...restField} name={[name, 'offset']}>
                                    <Select>
                                      <Select.Option value={1 * 86400}>1</Select.Option>
                                      <Select.Option value={2 * 86400}>2</Select.Option>
                                      <Select.Option value={3 * 86400}>3</Select.Option>
                                      <Select.Option value={4 * 86400}>4</Select.Option>
                                      <Select.Option value={5 * 86400}>5</Select.Option>
                                      <Select.Option value={6 * 86400}>6</Select.Option>
                                      <Select.Option value={7 * 86400}>7</Select.Option>
                                    </Select>
                                  </Form.Item>
                                  <span>{t('天前同时期')}</span>
                                  <Form.Item {...restField} name={[name, 'bound_type']}>
                                    <Select>
                                      <Select.Option value={0}>{t('偏离')}</Select.Option>
                                      <Select.Option value={1}>{t('上升')}</Select.Option>
                                      <Select.Option value={2}>{t('下降')}</Select.Option>
                                    </Select>
                                  </Form.Item>
                                  <Form.Item {...restField} name={[name, 'value']}>
                                    <InputNumber />
                                  </Form.Item>
                                  {' %'}
                                  <MinusCircleOutlined onClick={() => remove(name)} />
                                </Space>
                              ))}
                            </>
                          )}
                        </Form.List>
                      </div>
                    </div>
                  </Form.Item>
                </>
              )}
            </>
          );
        }}
      </Form.Item>
    </>
  );
}
