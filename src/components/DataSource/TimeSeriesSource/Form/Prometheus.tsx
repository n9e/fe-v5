import React from 'react';
import { Form } from 'antd';
import _ from 'lodash';
import Name from './items/Name';
import HTTP from './items/HTTP';
import BasicAuth from './items/BasicAuth';
import Footer from './items/Footer';
import './index.less';
import Description from './items/Description';

interface IProps {
  initialValues: any;
  onFinish: (values: any) => void;
  submitLoading: boolean;
}

export default function Prometheus(props: IProps) {
  const [form] = Form.useForm();
  const namePrefix = ['settings'];
  return (
    <Form form={form} layout='vertical' onFinish={props.onFinish} initialValues={_.merge(props.initialValues)} className='settings-source-form'>
      <Name />
      <HTTP namePrefix={namePrefix} type='prometheus' />
      <BasicAuth namePrefix={[...namePrefix, 'prometheus.basic']} type='prometheus' />
      <Description />
      <div className='mt16'>
        <Footer id={props.initialValues?.id} submitLoading={props.submitLoading} />
      </div>
    </Form>
  );
}
