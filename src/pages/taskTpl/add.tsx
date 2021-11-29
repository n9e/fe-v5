import React from 'react';
import { Button, message } from 'antd';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import request from '@/utils/request';
import api from '@/utils/api';
import TplForm from './tplForm';

const Add = (props: any) => {
  const { t } = useTranslation();
  const handleSubmit = (values: any) => {
    request(`${api.tasktpls}?nid=${values.nid}`, {
      method: 'POST',
      body: JSON.stringify(values),
    }).then(() => {
      message.success(t('msg.create.success'));
      props.history.push({
        pathname: `/tpls`,
      });
    });
  };

  return (
    <PageLayout title={t('创建任务模板')}>
      <div style={{ padding: 20, background: '#fff' }}>
        <TplForm
          onSubmit={handleSubmit}
          footer={
            <div>
              <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}> 
                {t('form.submit')}
              </Button>
              <Button>
                <Link to={{ pathname: '/job-tpls' }}>返回</Link>
              </Button>
            </div>
          }
        />
      </div>
    </PageLayout>
  )
}

export default Add;
