import React from 'react';
import { Form, Row, Col, Input } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import Values from './Values';
import GroupBy from './GroupBy';
import Time from './Time';
import Rules from './Rules';
import GraphPreview from './GraphPreview';
import IndexSelect from './IndexSelect';
import { useTranslation } from "react-i18next";
export default function index({
  form
}) {
  const {
    t
  } = useTranslation();
  return <>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item shouldUpdate={(prevValues, curValues) => _.isEqual(prevValues.cluster, curValues.cluster)} noStyle>
            {({
            getFieldValue
          }) => {
            const {
              t
            } = useTranslation();
            return <IndexSelect cate={getFieldValue('cate')} cluster={getFieldValue('cluster')} />;
          }}
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={<span>
                {t("过滤条件")}件{' '}
                <a href='https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax ' target='_blank'>
                  <QuestionCircleOutlined />
                </a>
              </span>} name={['query', 'filter']}>
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item shouldUpdate={(prevValues, curValues) => {
      return _.isEqual(prevValues.cluster, curValues.cluster) || _.isEqual(prevValues?.query?.index, curValues?.query?.index);
    }} noStyle>
        {({
        getFieldValue
      }) => {
        const {
          t
        } = useTranslation();
        return <>
              <Values cate={getFieldValue('cate')} cluster={getFieldValue('cluster')} index={getFieldValue(['query', 'index'])} />
              <GroupBy cate={getFieldValue('cate')} cluster={getFieldValue('cluster')} index={getFieldValue(['query', 'index'])} prefixNameField={['query']} />
            </>;
      }}
      </Form.Item>
      <Time />
      <GraphPreview form={form} />
      <Rules form={form} />
    </>;
}