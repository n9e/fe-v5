import React, { useState, useEffect } from 'react';
import { Button, Spin, message } from 'antd';
import _ from 'lodash';
import queryString from 'query-string';
import request from '@pkgs/request';
import api from '@common/api';
import useFormatMessage from '@pkgs/hooks/useFormatMessage';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import TplForm from '../taskTpl/TplForm';

const Add = (props: any) => {
  const intlFmtMsg = useFormatMessage();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState();
  const [action, setAction] = useState('');
  const handleSubmit = (values: any) => {
    if (action) {
      request(api.tasks, {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          action,
        }),
      }).then((taskId) => {
        message.success(intlFmtMsg({ id: 'msg.create.success' }));
        props.history.push({
          pathname: `/tasks/${taskId}/result`,
        });
      });
    }
  };

  useEffect(() => {
    const query = queryString.parse(_.get(props, 'location.search'));

    if (_.isPlainObject(query)) {
      if (query.tpl !== undefined) {
        setLoading(true);
        request(`${api.tasktpl}/${query.tpl}`, {
        }).then((data) => {
          setData({
            ...data.tpl,
            hosts: data.hosts,
          });
        }).finally(() => {
          setLoading(false);
        });
      } else if (query.task !== undefined) {
        setLoading(true);
        request(`${api.task}/${query.task}`, {
        }).then((data) => {
          setData({
            ...data.meta,
            hosts: _.map(data.hosts, (host) => {
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
    <Spin spinning={loading}>
      <TplForm
        type="task"
        initialValues={data}
        onSubmit={handleSubmit}
        footer={
          <div>
            <Button type="primary" htmlType="submit" className="mr10"
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
      />
    </Spin>
  );
};

export default CreateIncludeNsTree(Add, { visible: false });
