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

const alphabet = 'ABCDEFGHIGKLMNOPQRSTUVWXYZ'.split('');

export default function Prometheus({ chartForm }) {
  return (
    <Form.List name='targets'>
      {(fields, { add, remove }, { errors }) => {
        return (
          <>
            <Collapse>
              {_.map(fields, ({ name }, index) => {
                const prefixName = ['targets', name];
                return (
                  <Panel
                    header={
                      <Form.Item noStyle shouldUpdate>
                        {({ getFieldValue }) => {
                          return getFieldValue([...prefixName, 'refId']) || alphabet[index];
                        }}
                      </Form.Item>
                    }
                    key={index}
                    extra={
                      <div>
                        {fields.length > 1 ? (
                          <DeleteOutlined
                            style={{ marginLeft: 10 }}
                            onClick={() => {
                              remove(name);
                            }}
                          />
                        ) : null}
                      </div>
                    }
                  >
                    <Form.Item noStyle name={[name, 'refId']} hidden>
                      <div />
                    </Form.Item>
                    <Row gutter={10}>
                      <Col span={12}>
                        <Form.Item shouldUpdate={(prevValues, curValues) => _.isEqual(prevValues.datasourceName, curValues.datasourceName)} noStyle>
                          {({ getFieldValue }) => {
                            const datasourceName = getFieldValue('datasourceName') ? [getFieldValue('datasourceName')] : [];
                            return <IndexSelect prefixName={[name]} cate={getFieldValue('datasourceCate')} cluster={datasourceName} />;
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
                          name={[name, 'query', 'filter']}
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
                              prefixFields={['targets']}
                              prefixNameField={[name]}
                              cate={getFieldValue('datasourceCate')}
                              cluster={datasourceName}
                              index={getFieldValue([...prefixName, 'query', 'index'])}
                              valueRefVisible={false}
                            />
                            <GroupBy
                              prefixFields={['targets']}
                              prefixNameField={[name]}
                              cate={getFieldValue('datasourceCate')}
                              cluster={datasourceName}
                              index={getFieldValue([...prefixName, 'query', 'index'])}
                            />
                          </>
                        );
                      }}
                    </Form.Item>
                    <Time prefixNameField={[name]} />
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
