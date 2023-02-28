import React from 'react';
import _ from 'lodash';
import { Form } from 'antd';
import Queries from './Queries';
import GraphPreview from './GraphPreview';
import Triggers from '../AliyunSLSSettings/Triggers';
import { useTranslation } from "react-i18next";
export default function index({
  form
}) {
  const {
    t
  } = useTranslation();
  return <Form.Item shouldUpdate={(prevValues, curValues) => _.isEqual(prevValues.cluster, curValues.cluster)} noStyle>
      {({
      getFieldValue
    }) => {
      const {
        t
      } = useTranslation();
      const cate = getFieldValue('cate');
      const cluster = getFieldValue('cluster');
      return <>
            <Queries form={form} cate={cate} cluster={cluster} />
            <GraphPreview form={form} />
            <Triggers />
          </>;
    }}
    </Form.Item>;
}