import React, { useEffect, useState } from 'react';
import { Form, Row, Col } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useDebounceFn } from 'ahooks';
import { getFields } from '@/services/warning';
import Filters from './Filters';
import Terms from './Terms';
import Histgram from './Histgram';
import { useTranslation } from "react-i18next";
interface IProps {
  prefixField?: any;
  prefixFields?: string[]; // 前缀字段名
  prefixNameField?: (string | number)[]; // 列表字段名
  cate: string;
  cluster: string[];
  index: string;
  backgroundVisible?: boolean;
}
export default function index({
  prefixField = {},
  prefixFields = [],
  prefixNameField = [],
  cate,
  cluster,
  index,
  backgroundVisible = true
}: IProps) {
  const {
    t
  } = useTranslation();
  const [fieldsOptions, setFieldsOptions] = useState([]);
  const {
    run
  } = useDebounceFn(() => {
    getFields({
      cate,
      cluster: _.join(cluster, ' '),
      index
    }).then(res => {
      setFieldsOptions(_.map(res.dat, item => {
        return {
          value: item
        };
      }));
    });
  }, {
    wait: 500
  });
  useEffect(() => {
    if (cate === 'elasticsearch' && !_.isEmpty(cluster) && index) {
      run();
    }
  }, [cate, _.join(cluster), index]);
  return <Form.List {...prefixField} name={[...prefixNameField, 'group_by']}>
      {(fields, {
      add,
      remove
    }) => <div>
          <div style={{
        marginBottom: 8
      }}>
            Group By{' '}
            <PlusCircleOutlined style={{
          cursor: 'pointer'
        }} onClick={() => {
          add({
            cate: 'terms',
            params: [{
              alias: '',
              query: ''
            }]
          });
        }} />
          </div>
          {fields.map(field => {
        return <div key={field.key} style={{
          marginBottom: backgroundVisible ? 16 : 0
        }}>
                <Form.Item shouldUpdate noStyle>
                  {({
              getFieldValue
            }) => {
              const cate = getFieldValue([...prefixFields, ...prefixNameField, 'group_by', field.name, 'cate']);
              return <Row gutter={10} align='top'>
                        <Col flex='auto'>
                          <div style={backgroundVisible ? {
                    backgroundColor: '#FAFAFA',
                    padding: 16
                  } : {}}>
                            {cate === 'filters' && <Filters prefixField={field} />}
                            {cate === 'terms' && <Terms prefixField={field} fieldsOptions={fieldsOptions} />}
                            {cate === 'histgram' && <Histgram prefixField={field} />}
                          </div>
                        </Col>
                        <Col flex='40px' style={{
                  display: 'flex',
                  alignItems: 'center'
                }}>
                          <div onClick={() => {
                    remove(field.name);
                  }} style={{
                    height: 32,
                    lineHeight: '32px'
                  }}>
                            <MinusCircleOutlined style={{
                      cursor: 'pointer'
                    }} />
                          </div>
                        </Col>
                      </Row>;
            }}
                </Form.Item>
              </div>;
      })}
        </div>}
    </Form.List>;
}