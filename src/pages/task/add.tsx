import React, { useState, useEffect } from 'react';
import { Button, Spin, message } from 'antd';
import _ from 'lodash';
import queryString from 'query-string';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import request from '@/utils/request';
import api from '@/utils/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import TplForm from '../taskTpl/tplForm';

const Add = (props: any) => {
  const query = queryString.parse(_.get(props, 'location.search'));
  const { curBusiItem } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState();
  const [action, setAction] = useState('');
  const handleSubmit = (values: any) => {
    if (action) {
      request(api.tasks(curBusiItem.id), {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          action,
        }),
      }).then((res) => {
        message.success(t('msg.create.success'));
        props.history.push({
          pathname: `/job-tasks/${res.dat}/result`,
        });
      });
    }
  };

  useEffect(() => {
    if (_.isPlainObject(query)) {
      if (query.tpl !== undefined) {
        setLoading(true);
        request(`${api.tasktpl(curBusiItem.id)}/${query.tpl}`, {
        }).then((data) => {
          setData({
            ...data.dat.tpl,
            hosts: data.dat.hosts,
          });
        }).finally(() => {
          setLoading(false);
        });
      } else if (query.task !== undefined) {
        setLoading(true);
        request(`${api.task(curBusiItem.id)}/${query.task}`, {
        }).then((data) => {
          setData({
            ...data.dat.meta,
            hosts: _.map(data.dat.hosts, (host) => {
              return host.host;
            }),
          });
        }).finally(() => {
          setLoading(false);
        });
      }
    }
  }, []);

  return (
    <PageLayout title={t('创建任务')}>
      <div style={{ padding: 20 }}>
      <div style={{ padding: 20 }}>
        <Spin spinning={loading}>
          {
            data ?
            <TplForm
              type="task"
              initialValues={data}
              onSubmit={handleSubmit}
              footer={
                <div>
                  <Button type="primary" htmlType="submit" style={{ marginRight: 10 }}
                    onClick={() => {
                      setAction('pause');
                    }}
                  >
                    保存暂不执行
                  </Button>
                  <Button type="primary" htmlType="submit"
                    onClick={() => {
                      setAction('start');
                    }}
                  >
                    保存立刻执行
                  </Button>
                </div>
              }
            /> : null
          }
        </Spin>
      </div>
      </div>
    </PageLayout>
  );
};

export default Add;
