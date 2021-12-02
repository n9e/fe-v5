import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Spin, Card, message } from 'antd';
import { RollbackOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import request from '@/utils/request';
import api from '@/utils/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import TplForm from './tplForm';

const Modify = (props: any) => {
  const history = useHistory();
  const id = _.get(props, 'match.params.id');
  const { curBusiItem } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({});
  const handleSubmit = (values: any) => {
    request(`${api.tasktpl(curBusiItem.id)}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(values),
    }).then(() => {
      message.success(t('msg.modify.success'));
      props.history.push({
        pathname: `/job-tpls`,
      });
    });
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      request(`${api.tasktpl(curBusiItem.id)}/${id}`).then((data) => {
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
  }, [id, curBusiItem.id]);

  return (
    <PageLayout hideCluster title={
      <>
        <RollbackOutlined className='back' onClick={() => history.push('/job-tpls')} />
        自愈脚本
      </>
    }>
      <div style={{ padding: 10 }}>
        <Card
          title="修改自愈脚本"
        >
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
        </Card>
      </div>
    </PageLayout>
  )
}

export default Modify;
