import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Input, Select, AutoComplete } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useDebounceFn } from 'ahooks';
import { getFields } from '@/services/warning';

interface IProps {
  prefixField?: any;
  prefixFields?: string[]; // 前缀字段名
  prefixNameField?: string[]; // 列表字段名
  cate: string;
  cluster: string[];
  index: string;
  valueRefVisible?: boolean;
}

const alphabet = 'ABCDEFGHIGKLMNOPQRSTUVWXYZ'.split('');
const functions = ['count', 'avg', 'sum', 'max', 'min', 'p90', 'p95', 'p99', 'rawData'];
const functionsLabelMap = {
  count: 'count',
  avg: 'avg',
  sum: 'sum',
  max: 'max',
  min: 'min',
  p90: 'p90',
  p95: 'p95',
  p99: 'p99',
  rawData: 'raw data',
};

export default function index({ prefixField = {}, prefixFields = [], prefixNameField = [], cate, cluster, index, valueRefVisible = true }: IProps) {
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
    <Form.List {...prefixField} name={[...prefixNameField, 'query', 'values']}>
      {(fields, { add, remove }) => (
        <div>
          <Form.Item
            shouldUpdate={(prevValues, curValues) => {
              const preQueryValues = _.get(prevValues, [...prefixFields, ...prefixNameField, 'query', 'values']);
              const curQueryValues = _.get(curValues, [...prefixFields, ...prefixNameField, 'query', 'values']);
              return !_.isEqual(preQueryValues, curQueryValues);
            }}
            noStyle
          >
            {({ getFieldValue }) => {
              const targetQueryValues = getFieldValue([...prefixFields, ...prefixNameField, 'query', 'values']);
              // 当提取日志原文时不可再添加 func
              if (_.get(targetQueryValues, [0, 'func']) === 'rawData') {
                return <div style={{ marginBottom: 8 }}>数值提取</div>;
              }
              return (
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
              );
            }}
          </Form.Item>

          {fields.map((field, index) => {
            return (
              <div key={field.key} style={{ marginBottom: 16 }}>
                <Form.Item {...field} name={[field.name, 'ref']} hidden />
                <Form.Item shouldUpdate noStyle>
                  {({ getFieldValue, setFields }) => {
                    const func = getFieldValue([...prefixFields, ...prefixNameField, 'query', 'values', field.name, 'func']);
                    return (
                      <Row gutter={10}>
                        <Col flex='auto'>
                          <Row gutter={10}>
                            <Col span={func === 'count' ? 24 : 12}>
                              <Input.Group>
                                {valueRefVisible && <span className='ant-input-group-addon'>{alphabet[index]}</span>}
                                <Form.Item {...field} name={[field.name, 'func']} noStyle>
                                  <Select
                                    style={{ width: '100%' }}
                                    onChange={(val) => {
                                      if (val === 'rawData') {
                                        setFields([
                                          {
                                            name: [...prefixFields, ...prefixNameField, 'query', 'values'],
                                            value: [
                                              {
                                                func: 'rawData',
                                              },
                                            ],
                                          },
                                          {
                                            name: [...prefixFields, ...prefixNameField, 'query', 'limit'],
                                            value: 100,
                                          },
                                        ]);
                                      }
                                    }}
                                  >
                                    {functions.map((func) => (
                                      <Select.Option key={func} value={func}>
                                        {functionsLabelMap[func]}
                                      </Select.Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                              </Input.Group>
                            </Col>
                            {func !== 'count' && func !== 'rawData' && (
                              <Col span={12}>
                                <Input.Group>
                                  <span className='ant-input-group-addon'>Field key</span>
                                  <Form.Item {...field} name={[field.name, 'field']} noStyle>
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
                                remove(field.name);
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
