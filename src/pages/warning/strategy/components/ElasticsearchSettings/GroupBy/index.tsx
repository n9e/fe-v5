import React, { useEffect, useState } from 'react';
import { Form, Row, Col } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useDebounceFn } from 'ahooks';
import { getFields } from '@/services/warning';
import Filters from './Filters';
import Terms from './Terms';
import Histgram from './Histgram';

interface IProps {
  prefixFields?: string[]; // 前缀字段名
  prefixNameField?: string[]; // 列表字段名
  cate: string;
  cluster: string[];
  index: string;
}

export default function index({ prefixFields = [], prefixNameField = [], cate, cluster, index }: IProps) {
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
    <Form.List name={[...prefixNameField, 'query', 'group_by']}>
      {(fields, { add, remove }) => (
        <div>
          <div style={{ marginBottom: 8 }}>
            Group By{' '}
            <PlusCircleOutlined
              style={{ cursor: 'pointer' }}
              onClick={() => {
                add({
                  cate: 'filters',
                  params: [
                    {
                      alias: '',
                      query: '',
                    },
                  ],
                });
              }}
            />
          </div>
          {fields.map(({ key, name, ...restField }) => {
            return (
              <div key={key} style={{ marginBottom: 16 }}>
                <Form.Item shouldUpdate noStyle>
                  {({ getFieldValue }) => {
                    const cate = getFieldValue([...prefixFields, ...prefixNameField, 'query', 'group_by', name, 'cate']);
                    return (
                      <Row gutter={16}>
                        <Col flex='auto'>
                          <div
                            style={{
                              backgroundColor: '#FAFAFA',
                              padding: 16,
                            }}
                          >
                            {cate === 'filters' && <Filters restField={restField} name={name} />}
                            {cate === 'terms' && <Terms restField={restField} name={name} fieldsOptions={fieldsOptions} />}
                            {cate === 'histgram' && <Histgram restField={restField} name={name} />}
                          </div>
                        </Col>
                        <Col flex='40px' style={{ display: 'flex', alignItems: 'center' }}>
                          <div
                            onClick={() => {
                              remove(name);
                            }}
                          >
                            <MinusCircleOutlined style={{ cursor: 'pointer' }} />
                          </div>
                        </Col>
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
