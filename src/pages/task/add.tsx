import React, { useState, useEffect } from 'react';
import { Button, Spin, Row, Col, Card, Alert, message } from 'antd';
import { RollbackOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
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
  const history = useHistory();
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
    <PageLayout hideCluster title={
      query.tpl ?
      <>
        <RollbackOutlined className='back' onClick={() => history.push('/job-tpls')} />
        自愈脚本
      </> :
      <>
        <RollbackOutlined className='back' onClick={() => history.push('/job-tasks')} />
        执行历史
      </>
    }>
      <div style={{ padding: 10 }}>
        <div style={{ background: 'none' }}>
        <Row gutter={20}>
          <Col span={18}>
            <Card
              title={
                query.tpl ? '创建任务' : query.task ? '克隆任务' : '创建临时任务'
              }
            >
              <Spin spinning={loading}>
                {
                  data || (!query.tpl && !query.task) ?
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
            </Card>
          </Col>
          <Col span={6}>
            <Alert
              showIcon
              message="提示信息"
              description="如果你的角色是管理员，则可以在任意机器执行脚本；否则，只能对有管理权限的业务组下的机器执行脚本"
              type="warning"
            />
          </Col>
        </Row>
        </div>
      </div>
    </PageLayout>
  );
};

export default Add;
