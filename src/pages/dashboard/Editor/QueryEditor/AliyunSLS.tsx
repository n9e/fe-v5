import React from 'react';
import { Form, Row, Col, Input, Button } from 'antd';
import { DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import Collapse, { Panel } from '../Components/Collapse';
import getFirstUnusedLetter from '../../Renderer/utils/getFirstUnusedLetter';
import IndexSelect from '@/pages/warning/strategy/components/ElasticsearchSettings/IndexSelect';
import Values from '@/pages/warning/strategy/components/ElasticsearchSettings/Values';
import GroupBy from '@/pages/warning/strategy/components/ElasticsearchSettings/GroupBy';
import Time from '@/pages/warning/strategy/components/ElasticsearchSettings/Time';
import ProjectSelect from '@/pages/metric/explorer/AliyunSLS/ProjectSelect';
import LogstoreSelect from '@/pages/metric/explorer/AliyunSLS/LogstoreSelect';
import { alphabet } from './config';

export default function AliyunSLS({ chartForm }) {
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
                    <Form.Item shouldUpdate={(prevValues, curValues) => _.isEqual(prevValues.datasourceName, curValues.datasourceName)} noStyle>
                      {({ getFieldValue }) => {
                        const datasourceName = getFieldValue('datasourceName') ? [getFieldValue('datasourceName')] : [];
                        return (
                          <Row gutter={10}>
                            <Col span={12}></Col>
                          </Row>
                        );
                      }}
                    </Form.Item>
                    <Row gutter={10}>
                      <Col span={12}></Col>
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
                    <Form.Item
                      shouldUpdate={(prevValues, curValues) => {
                        return _.isEqual(prevValues.datasourceName, curValues.datasourceName);
                      }}
                      noStyle
                    >
                      {({ getFieldValue }) => {
                        const datasourceName = getFieldValue('datasourceName') ? [getFieldValue('datasourceName')] : [];
                        return (
                          <>
                            <Values
                              prefixField={field}
                              prefixFields={['targets']}
                              prefixNameField={[field.name]}
                              cate={getFieldValue('datasourceCate')}
                              cluster={datasourceName}
                              index={getFieldValue([...prefixName, 'query', 'index'])}
                              valueRefVisible={false}
                            />
                            <GroupBy
                              prefixField={field}
                              prefixFields={['targets']}
                              prefixNameField={[field.name]}
                              cate={getFieldValue('datasourceCate')}
                              cluster={datasourceName}
                              index={getFieldValue([...prefixName, 'query', 'index'])}
                            />
                          </>
                        );
                      }}
                    </Form.Item>
                    <Time prefixField={field} prefixNameField={[field.name]} />
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
                    values: [
                      {
                        func: 'count',
                      },
                    ],
                    date_field: '@timestamp',
                    interval: 1,
                    interval_unit: 'min',
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
