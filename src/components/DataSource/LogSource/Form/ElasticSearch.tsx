import React, { useEffect } from 'react';
import { Form } from 'antd';
import _ from 'lodash';
import Name from '@/components/DataSource/TimeSeriesSource/Form/items/Name';
import BasicAuth from '@/components/DataSource/TimeSeriesSource/Form/items/BasicAuth';
import Headers from '@/components/DataSource/TimeSeriesSource/Form/items/Headers';
import Footer from '@/components/DataSource/TimeSeriesSource/Form/items/Footer';
import './index.less';
import Description from '@/components/DataSource/TimeSeriesSource/Form/items/Description';
import EsDetail from '@/components/DataSource/TimeSeriesSource/Form/items/EsDetail';
import WriteConfig from '@/components/DataSource/TimeSeriesSource/Form/items/WriteConfig';
import HTTPList from '@/components/DataSource/TimeSeriesSource/Form/items/HTTPList';

interface IProps {
  initialValues: any;
  onFinish: (values: any) => void;
  submitLoading: boolean;
}
export const formatInitVal = (val: any) => {
  const tempVal = _.cloneDeep(val);
  if (!_.isEmpty(tempVal.settings['es.headers'])) {
    let tempHeaders = _.keys(tempVal.settings['es.headers']).map((el) => {
      return { key: el, value: tempVal.settings['es.headers'].el };
    });
    tempVal.settings['es.headers'] = tempHeaders;
  } else {
    tempVal.settings['es.headers'] = [];
  }
  return tempVal;
};

export default function ElasticSearch(props: IProps) {
  const { initialValues, onFinish, submitLoading } = props;

  const [form] = Form.useForm();
  const namePrefix = ['settings'];

  useEffect(() => {
    initialValues?.settings && form.setFieldsValue(formatInitVal(initialValues));
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
      {/* <HTTP namePrefix={namePrefix} type='es' /> */}
      <HTTPList namePrefix={namePrefix} type='es' />

      {/* <Auth /> */}
      <BasicAuth namePrefix={[...namePrefix, 'es.basic']} type='es' />
      {/* <TLSSSLAuth /> */}
      <Headers namePrefix={namePrefix} type='es' />
      <EsDetail namePrefix={namePrefix} type='es' max_shard={initialValues?.settings?.['es.max_shard']} />
      <WriteConfig />
      <Description />
      <div className='mt16'>
        <Footer id={initialValues?.id} submitLoading={submitLoading} />
      </div>
    </Form>
  );
}
