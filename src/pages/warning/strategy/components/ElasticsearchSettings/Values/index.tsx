import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Input, Select, AutoComplete } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useDebounceFn } from 'ahooks';
import { getFields } from '@/services/warning';

const alphabet = 'ABCDEFGHIGKLMNOPQRSTUVWXYZ'.split('');
const functions = ['count', 'avg', 'sum', 'max', 'min', 'p90', 'p95', 'p99'];

export default function index({ cate, cluster, index }) {
  const [search, setSearch] = useState('');
  const [fieldsOptions, setFieldsOptions] = useState([]);
  const { run } = useDebounceFn(
    () => {
      getFields({ cate, cluster: _.join(cluster, ' '), index }).then((res) => {
        setFieldsOptions(
          _.map(res.dat, (item) => {
            return {
              value: item,
            };
          }),
        );
      });
    },
    {
      wait: 500,
    },
  );

  useEffect(() => {
    if (cate === 'elasticsearch' && !_.isEmpty(cluster) && index) {
      run();
    }
  }, [cate, _.join(cluster), index]);

  return (
    <Form.List name={['query', 'values']}>
      {(fields, { add, remove }) => (
        <div>
          <div style={{ marginBottom: 8 }}>
            数值提取{' '}
            <PlusCircleOutlined
              style={{ cursor: 'pointer' }}
              onClick={() => {
                add({
                  ref: alphabet[fields.length],
                  func: functions[0],
                  field: undefined,
                });
              }}
            />
          </div>
          {fields.map(({ key, name }, index) => {
            return (
              <div key={key} style={{ marginBottom: 16 }}>
                <Form.Item name={[name, 'ref']} hidden>
                  <div />
                </Form.Item>
                <Form.Item shouldUpdate noStyle>
                  {({ getFieldValue }) => {
                    const func = getFieldValue(['query', 'values', name, 'func']);
                    return (
                      <Row gutter={16}>
                        <Col flex='auto'>
                          <Row gutter={16}>
                            <Col span={func === 'count' ? 24 : 12}>
                              <Input.Group>
                                <span className='ant-input-group-addon'>{alphabet[index]}</span>
                                <Form.Item name={[name, 'func']} noStyle>
                                  <Select style={{ width: '100%' }}>
                                    {functions.map((func) => (
                                      <Select.Option key={func} value={func}>
                                        {func}
                                      </Select.Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                              </Input.Group>
                            </Col>
                            {func !== 'count' && (
                              <Col span={12}>
                                <Input.Group>
                                  <span className='ant-input-group-addon'>Field key</span>
                                  <Form.Item name={[name, 'field']} noStyle>
                                    <AutoComplete
                                      options={_.filter(fieldsOptions, (item) => {
                                        if (search) {
                                          return item.value.includes(search);
                                        }
                                        return true;
                                      })}
                                      style={{ width: '100%' }}
                                      onSearch={setSearch}
                                    />
                                  </Form.Item>
                                </Input.Group>
                              </Col>
                            )}
                          </Row>
                        </Col>
                        {fields.length > 1 && (
                          <Col flex='40px'>
                            <div
                              style={{
                                height: 30,
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                              }}
                              onClick={() => {
                                remove(name);
                              }}
                            >
                              <MinusCircleOutlined />
                            </div>
                          </Col>
                        )}
                      </Row>
                    );
                  }}
                </Form.Item>
              </div>
            );
          })}
        </div>
      )}
    </Form.List>
  );
}
