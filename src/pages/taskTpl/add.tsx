import React from 'react';
import { Button, Card, message } from 'antd';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import request from '@/utils/request';
import api from '@/utils/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import TplForm from './tplForm';

const Add = (props: any) => {
  const { curBusiItem } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const { t } = useTranslation();
  const handleSubmit = (values: any) => {
    request(`${api.tasktpls(curBusiItem.id)}`, {
      method: 'POST',
      body: JSON.stringify(values),
    }).then(() => {
      message.success(t('msg.create.success'));
      props.history.push({
        pathname: `/job-tpls`,
      });
    });
  };

  return (
    <PageLayout title={<Link to={{ pathname: '/job-tpls' }}>{'<'} 自愈脚本</Link>}>
      <div style={{ padding: 20 }}>
        <Card
          title="创建任务模板"
        >
        <TplForm
          onSubmit={handleSubmit}
          footer={
            <div>
              <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}> 
                {t('form.submit')}
              </Button>
            </div>
          }
        />
        </Card>
      </div>
    </PageLayout>
  )
}

export default Add;
