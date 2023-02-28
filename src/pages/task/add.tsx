/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
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
  const {
    curBusiItem
  } = useSelector<RootState, CommonStoreState>(state => state.common);
  const {
    t
  } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState();
  const [action, setAction] = useState('');

  const handleSubmit = (values: any) => {
    if (action) {
      request(api.tasks(curBusiItem.id), {
        method: 'POST',
        body: JSON.stringify({ ...values,
          action
        })
      }).then(res => {
        message.success(t('msg.create.success'));
        props.history.push({
          pathname: `/job-tasks/${res.dat}/result`
        });
      });
    }
  };

  useEffect(() => {
    if (_.isPlainObject(query)) {
      if (query.tpl !== undefined) {
        setLoading(true);
        request(`${api.tasktpl(curBusiItem.id)}/${query.tpl}`, {}).then(data => {
          setData({ ...data.dat.tpl,
            hosts: data.dat.hosts
          });
        }).finally(() => {
          setLoading(false);
        });
      } else if (query.task !== undefined) {
        setLoading(true);
        request(`${api.task(curBusiItem.id)}/${query.task}`, {}).then(data => {
          setData({ ...data.dat.meta,
            hosts: _.map(data.dat.hosts, host => {
              return host.host;
            })
          });
        }).finally(() => {
          setLoading(false);
        });
      }
    }
  }, []);
  return <PageLayout hideCluster title={query.tpl ? <>
        <RollbackOutlined className='back' onClick={() => history.push('/job-tpls')} />
        {t("自愈脚本")}
     </> : <>
        <RollbackOutlined className='back' onClick={() => history.push('/job-tasks')} />
        {t("执行历史")}
     </>}>
      <div style={{
      padding: 10
    }}>
        <div style={{
        background: 'none'
      }}>
        <Row gutter={20}>
          <Col span={18}>
            <Card title={query.tpl ? t("创建任务") : query.task ? t("克隆任务") : t("创建临时任务")}>
              <Spin spinning={loading}>
                {data || !query.tpl && !query.task ? <TplForm type="task" initialValues={data} onSubmit={handleSubmit} footer={<div>
                        <Button type="primary" htmlType="submit" style={{
                    marginRight: 10
                  }} onClick={() => {
                    setAction('pause');
                  }}>
                          {t("保存暂不执行")}
                       </Button>
                        <Button type="primary" htmlType="submit" onClick={() => {
                    setAction('start');
                  }}>
                          {t("保存立刻执行")}
                       </Button>
                      </div>} /> : null}
              </Spin>
            </Card>
          </Col>
          <Col span={6}>
            <Alert showIcon message={t("提示信息")} description={t("如果你的角色是管理员，则可以在任意机器执行脚本；否则，只能对有管理权限的业务组下的机器执行脚本")} type="warning" />
          </Col>
        </Row>
        </div>
      </div>
    </PageLayout>;
};

export default Add;