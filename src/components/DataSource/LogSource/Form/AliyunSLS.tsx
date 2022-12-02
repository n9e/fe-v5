import React, { useEffect } from 'react';
import { Form } from 'antd';
import _ from 'lodash';
import Name from '@/components/DataSource/TimeSeriesSource/Form/items/Name';
import Auth from '@/components/DataSource/TimeSeriesSource/Form/items/Auth';
import Footer from '@/components/DataSource/TimeSeriesSource/Form/items/Footer';
import Description from '@/components/DataSource/TimeSeriesSource/Form/items/Description';
import ServiceEntry from '@/components/DataSource/TimeSeriesSource/Form/items/ServiceEntry';
import './index.less';

interface IProps {
  initialValues: any;
  onFinish: (values: any) => void;
  submitLoading: boolean;
}

export default function AliyunSLS(props: IProps) {
  const { initialValues, onFinish, submitLoading } = props;

  const [form] = Form.useForm();
  const namePrefix = ['settings'];

  useEffect(() => {
    initialValues?.settings && form.setFieldsValue(initialValues);
  }, [initialValues]);

  return (
    <Form
      form={form}
      layout='vertical'
      onFinish={onFinish}
      // initialValues={_.merge({}, formatInitVal(props.initialValues))}
      className='settings-source-form'
    >
      <Name />
      <ServiceEntry namePrefix={namePrefix} type='sls' />
      <Auth namePrefix={namePrefix} type='sls' />
      <Description />
      <div className='mt16'>
        <Footer id={initialValues?.id} submitLoading={submitLoading} />
      </div>
    </Form>
  );
}
