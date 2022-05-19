import React, { useState, useEffect } from 'react';
import { Form, InputNumber, Radio, Select, Checkbox } from 'antd';
import AdvancedWrap from '@/components/AdvancedWrap';
import { getBrainParams } from '@/services/warning';

interface IProps {
  form: any;
}

export default function index(props: IProps) {
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
      <AdvancedWrap>
        <Form.Item shouldUpdate noStyle>
          {({ getFieldValue }) => {
            return (
              <>
                <Form.Item label='告警方式'>
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
                    <Radio.Button value='threshold'>阈值告警</Radio.Button>
                    <Radio.Button value='abnormalDetection'>异常检测</Radio.Button>
                  </Radio.Group>
                </Form.Item>
                {getFieldValue('algorithm') === 'holtwinters' && (
                  <>
                    <Form.Item label='使用算法' name='algorithm'>
                      <Select>
                        <Select.Option value='holtwinters'>holtwinters</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item label='高级配置'>
                      <div style={{ height: 32, lineHeight: '32px', userSelect: 'none' }}>
                        <a onClick={() => setSettingsVisible(!settingsVisible)}>{settingsVisible ? '收起' : '展开'}</a>
                      </div>
                      <div
                        style={{
                          display: settingsVisible ? 'block' : 'none',
                        }}
                      >
                        <div>
                          季节性周期时间为：
                          <Form.Item noStyle name={['algo_params', 'seasonal_duration']}>
                            <Select style={{ width: 100 }}>
                              <Select.Option value={3600}>小时</Select.Option>
                              <Select.Option value={86400}>天</Select.Option>
                              <Select.Option value={604800}>周</Select.Option>
                              <Select.Option value={2592000}>月</Select.Option>
                            </Select>
                          </Form.Item>{' '}
                          , 根据{' '}
                          <Form.Item noStyle name={['algo_params', 'rollup_interval']}>
                            <InputNumber />
                          </Form.Item>{' '}
                          秒区间, 对数据进行平滑计算
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 16 }}>
                          <div style={{ marginRight: 16 }}>偏离</div>
                          <div>
                            <div style={{ marginBottom: 16 }}>
                              <Form.Item
                                noStyle
                                name={['algo_params', 'upper_bound']}
                                valuePropName='checked'
                                getValueFromEvent={(e) => {
                                  return e.target.checked ? 1 : 0;
                                }}
                              >
                                <Checkbox>上界</Checkbox>
                              </Form.Item>
                              <Form.Item noStyle name={['algo_params', 'upper_times_num']}>
                                <InputNumber />
                              </Form.Item>{' '}
                              倍误差
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
                                <Checkbox>下界</Checkbox>
                              </Form.Item>
                              <Form.Item noStyle name={['algo_params', 'lower_times_num']}>
                                <InputNumber />
                              </Form.Item>{' '}
                              倍误差
                            </div>
                          </div>
                        </div>
                      </div>
                    </Form.Item>
                  </>
                )}
              </>
            );
          }}
        </Form.Item>
      </AdvancedWrap>
    </>
  );
}
