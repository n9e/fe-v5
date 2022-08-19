import React from 'react';
import { Form, Row, Col, Input, AutoComplete } from 'antd';
import _ from 'lodash';
import Values from './Values';
import GroupBy from './GroupBy';
import Time from './Time';
import Rules from './Rules';
import GraphPreview from './GraphPreview';
import IndexSelect from './IndexSelect';

export default function index({ form }) {
  return (
    <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.cate !== curValues.cate} noStyle>
      {({ getFieldValue }) => {
        if (getFieldValue('cate') === 'elasticsearch') {
          return (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item shouldUpdate={(prevValues, curValues) => _.isEqual(prevValues.cluster, curValues.cluster)} noStyle>
                    {({ getFieldValue }) => {
                      return <IndexSelect cate={getFieldValue('cate')} cluster={getFieldValue('cluster')} />;
                    }}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label='过滤项' name={['query', 'filter']}>
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                shouldUpdate={(prevValues, curValues) => {
                  return _.isEqual(prevValues.cluster, curValues.cluster) || _.isEqual(prevValues?.query?.index, curValues?.query?.index);
                }}
                noStyle
              >
                {({ getFieldValue }) => {
                  return (
                    <>
                      <Values cate={getFieldValue('cate')} cluster={getFieldValue('cluster')} index={getFieldValue(['query', 'index'])} />
                      <GroupBy cate={getFieldValue('cate')} cluster={getFieldValue('cluster')} index={getFieldValue(['query', 'index'])} />
                    </>
                  );
                }}
              </Form.Item>
              <Time />
              <GraphPreview form={form} />
              <Rules form={form} />
            </>
          );
        }
      }}
    </Form.Item>
  );
}
