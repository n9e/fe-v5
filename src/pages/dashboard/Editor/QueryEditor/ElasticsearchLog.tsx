import React from 'react';
import { Form, Row, Col, Input, InputNumber, Button } from 'antd';
import { DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import Collapse, { Panel } from '../Components/Collapse';
import getFirstUnusedLetter from '../../Renderer/utils/getFirstUnusedLetter';
import IndexSelect from '@/pages/warning/strategy/components/ElasticsearchSettings/IndexSelect';

const alphabet = 'ABCDEFGHIGKLMNOPQRSTUVWXYZ'.split('');

export default function Prometheus({ chartForm }) {
  return (
    <Form.List name='targets'>
      {(fields, { add, remove }, { errors }) => {
        return (
          <>
            <Collapse>
              {_.map(fields, (field, index) => {
                const prefixName = ['targets', field.name];
                return (
                  <Panel
                    header={
                      <Form.Item noStyle shouldUpdate>
                        {({ getFieldValue }) => {
                          return getFieldValue([...prefixName, 'refId']) || alphabet[index];
                        }}
                      </Form.Item>
                    }
                    key={field.key}
                    extra={
                      <div>
                        {fields.length > 1 ? (
                          <DeleteOutlined
                            style={{ marginLeft: 10 }}
                            onClick={() => {
                              remove(field.name);
                            }}
                          />
                        ) : null}
                      </div>
                    }
                  >
                    <Form.Item noStyle {...field} name={[field.name, 'refId']} hidden />
                    <Row gutter={10}>
                      <Col span={12}>
                        <Form.Item shouldUpdate={(prevValues, curValues) => _.isEqual(prevValues.datasourceName, curValues.datasourceName)} noStyle>
                          {({ getFieldValue }) => {
                            const datasourceName = getFieldValue('datasourceName') ? [getFieldValue('datasourceName')] : [];
                            return <IndexSelect prefixField={field} prefixName={[field.name]} cate={getFieldValue('datasourceCate')} cluster={datasourceName} />;
                          }}
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label={
                            <span>
                              过滤条件{' '}
                              <a href='https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax ' target='_blank'>
                                <QuestionCircleOutlined />
                              </a>
                            </span>
                          }
                          {...field}
                          name={[field.name, 'query', 'filter']}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={10}>
                      <Col span={12}>
                        <Form.Item label='日期字段' {...field} name={[field.name, 'query', 'date_field']}>
                          <Input placeholder='日期字段 key' />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label='日志条数' {...field} name={[field.name, 'query', 'limit']}>
                          <InputNumber style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Panel>
                );
              })}

              <Form.ErrorList errors={errors} />
            </Collapse>
            <Button
              style={{ width: '100%', marginTop: 10 }}
              onClick={() => {
                add({
                  query: {
                    date_field: '@timestamp',
                    limit: 100,
                  },
                  refId: getFirstUnusedLetter(_.map(chartForm.getFieldValue('targets'), 'refId')),
                });
              }}
            >
              + add query
            </Button>
          </>
        );
      }}
    </Form.List>
  );
}
