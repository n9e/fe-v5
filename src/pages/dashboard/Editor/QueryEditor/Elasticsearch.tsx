import React from 'react';
import { Form, Row, Col, Input, Button, InputNumber } from 'antd';
import { DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import Collapse, { Panel } from '../Components/Collapse';
import getFirstUnusedLetter from '../../Renderer/utils/getFirstUnusedLetter';
import IndexSelect from '@/pages/warning/strategy/components/ElasticsearchSettings/IndexSelect';
import Values from '@/pages/warning/strategy/components/ElasticsearchSettings/Values';
import GroupBy from '@/pages/warning/strategy/components/ElasticsearchSettings/GroupBy';
import Time from '@/pages/warning/strategy/components/ElasticsearchSettings/Time';
import { useTranslation } from 'react-i18next';
const alphabet = 'ABCDEFGHIGKLMNOPQRSTUVWXYZ'.split('');
export default function Prometheus({ chartForm }) {
  const { t } = useTranslation();
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
                            style={{
                              marginLeft: 10,
                            }}
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
                              {t('过滤条件')}件{' '}
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
                        return !_.isEqual(prevValues.datasourceName, curValues.datasourceName);
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
                            <Form.Item
                              shouldUpdate={(prevValues, curValues) => {
                                const preQueryValues = _.get(prevValues, [...prefixName, 'query', 'values']);

                                const curQueryValues = _.get(curValues, [...prefixName, 'query', 'values']);

                                return !_.isEqual(preQueryValues, curQueryValues);
                              }}
                              noStyle
                            >
                              {({ getFieldValue }) => {
                                const targetQueryValues = getFieldValue([...prefixName, 'query', 'values']); // 当提取日志原文时不显示 groupBy 设置

                                if (_.get(targetQueryValues, [0, 'func']) === 'rawData') {
                                  return null;
                                }

                                return (
                                  <GroupBy
                                    prefixField={field}
                                    prefixFields={['targets']}
                                    prefixNameField={[field.name, 'query']}
                                    cate={getFieldValue('datasourceCate')}
                                    cluster={datasourceName}
                                    index={getFieldValue([...prefixName, 'query', 'index'])}
                                  />
                                );
                              }}
                            </Form.Item>
                          </>
                        );
                      }}
                    </Form.Item>
                    <Form.Item
                      shouldUpdate={(prevValues, curValues) => {
                        const preQueryValues = _.get(prevValues, [...prefixName, 'query', 'values']);

                        const curQueryValues = _.get(curValues, [...prefixName, 'query', 'values']);

                        return !_.isEqual(preQueryValues, curQueryValues);
                      }}
                      noStyle
                    >
                      {({ getFieldValue }) => {
                        const targetQueryValues = getFieldValue([...prefixName, 'query', 'values']); // 当提取日志原文时不显示 groupBy 设置

                        if (_.get(targetQueryValues, [0, 'func']) === 'rawData') {
                          return (
                            <Row gutter={10}>
                              <Col span={12}>
                                <Form.Item label={t('日期字段')} {...field} name={[field.name, 'query', 'date_field']}>
                                  <Input placeholder={t('日期字段 key')} />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <Form.Item label={t('日志条数')} {...field} name={[field.name, 'query', 'limit']}>
                                  <InputNumber
                                    style={{
                                      width: '100%',
                                    }}
                                  />
                                </Form.Item>
                              </Col>
                            </Row>
                          );
                        }

                        return <Time prefixField={field} prefixNameField={[field.name]} />;
                      }}
                    </Form.Item>
                  </Panel>
                );
              })}

              <Form.ErrorList errors={errors} />
            </Collapse>
            <Button
              style={{
                width: '100%',
                marginTop: 10,
              }}
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
