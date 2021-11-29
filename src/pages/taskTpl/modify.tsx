import React, { useState, useEffect } from 'react';
import { Button, Spin, message } from 'antd';
import _ from 'lodash';
import queryString from 'query-string';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import request from '@/utils/request';
import api from '@/utils/api';
import TplForm from './tplForm';

const Modify = (props: any) => {
  const id = _.get(props, 'match.params.id');
  const query = queryString.parse(props.location.search);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({});
  const handleSubmit = (values: any) => {
    if (typeof query.nid === 'string') {
      request(`${api.tasktpl(query.nid)}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(values),
      }).then(() => {
        message.success(t('msg.modify.success'));
        props.history.push({
          pathname: `/job-tpls`,
        });
      });
    }
  };

  useEffect(() => {
    if (id && typeof query.nid === 'string') {
      setLoading(true);
      request(`${api.tasktpl(query.nid)}/${id}`).then((data) => {
        const { dat } = data;
        setData({
          ...dat.tpl,
          hosts: dat.hosts,
          grp: dat.grp,
        });
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [id, query.nid]);

  console.log(data);

  return (
    <PageLayout title={t('修改任务模板')}>
      <div style={{ padding: 20, background: '#fff' }}>
        <Spin spinning={loading}>
          {
            data.title ?
            <TplForm
              onSubmit={handleSubmit}
              initialValues={data}
              footer={
                <Button type="primary" htmlType="submit">
                  {t('form.submit')}
                </Button>
              }
            /> : null
          }
        </Spin>
      </div>
    </PageLayout>
  )
}

export default Modify;
