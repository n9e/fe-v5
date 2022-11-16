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
  prefixField?: any;
  prefixFields?: string[]; // 前缀字段名
  prefixNameField?: string[]; // 列表字段名
  cate: string;
  cluster: string[];
  index: string;
}

export default function index({ prefixField = {}, prefixFields = [], prefixNameField = [], cate, cluster, index }: IProps) {
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
    <Form.List {...prefixField} name={[...prefixNameField, 'query', 'group_by']}>
      {(fields, { add, remove }) => (
        <div>
          <div style={{ marginBottom: 8 }}>
            Group By{' '}
            <PlusCircleOutlined
              style={{ cursor: 'pointer' }}
              onClick={() => {
                add({
                  cate: 'terms',
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
          {fields.map((field) => {
            return (
              <div key={field.key} style={{ marginBottom: 16 }}>
                <Form.Item shouldUpdate noStyle>
                  {({ getFieldValue }) => {
                    const cate = getFieldValue([...prefixFields, ...prefixNameField, 'query', 'group_by', field.name, 'cate']);
                    return (
                      <Row gutter={10}>
                        <Col flex='auto'>
                          <div
                            style={{
                              backgroundColor: '#FAFAFA',
                              padding: 16,
                            }}
                          >
                            {cate === 'filters' && <Filters prefixField={field} />}
                            {cate === 'terms' && <Terms prefixField={field} fieldsOptions={fieldsOptions} />}
                            {cate === 'histgram' && <Histgram prefixField={field} />}
                          </div>
                        </Col>
                        <Col flex='40px' style={{ display: 'flex', alignItems: 'center' }}>
                          <div
                            onClick={() => {
                              remove(field.name);
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
