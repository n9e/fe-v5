import React from 'react';
import { Button, Card, message } from 'antd';
import { RollbackOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import request from '@/utils/request';
import api from '@/utils/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import TplForm from './tplForm';

const Add = (props: any) => {
  const history = useHistory();
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
    <PageLayout hideCluster title={
      <>
        <RollbackOutlined className='back' onClick={() => history.push('/job-tpls')} />
        自愈脚本
      </>
    }>
      <div style={{ padding: 10 }}>
        <Card
          title="创建自愈脚本"
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
