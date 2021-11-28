import React, { useState, useEffect } from 'react';
import { Button, Spin, message } from 'antd';
import _ from 'lodash';
import request from '@pkgs/request';
import api from '@common/api';
import useFormatMessage from '@pkgs/hooks/useFormatMessage';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import TplForm from './TplForm';

const Modify = (props: any) => {
  const id = _.get(props, 'match.params.id');
  const intlFmtMsg = useFormatMessage();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const handleSubmit = (values: any) => {
    request(`${api.tasktpl}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(values),
    }).then(() => {
      message.success(intlFmtMsg({ id: 'msg.modify.success'}));
      props.history.push({
        pathname: `/tpls`,
      });
    });
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      request(`${api.tasktpl}/${id}`).then((data) => {
        setData({
          ...data.tpl,
          hosts: data.hosts,
          grp: data.grp,
        });
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [id])

  return (
    <Spin spinning={loading}>
      <TplForm
        onSubmit={handleSubmit}
        initialValues={data}
        footer={
          <Button type="primary" htmlType="submit">
            {intlFmtMsg({ id: 'form.submit' })}
          </Button>
        }
      />
    </Spin>
  )
}

export default CreateIncludeNsTree(Modify, { visible: false });
