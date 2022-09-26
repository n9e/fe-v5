import React, { useState, useEffect } from 'react';
import { message, notification, Spin } from 'antd';
import _ from 'lodash';
import { useHistory, useParams } from 'react-router-dom';
import PageLayout from '@/components/pageLayout';
import BreadCrumb from '@/components/BreadCrumb';
import { getDataSourceDetailById, getDataSourcePluginList, submitRequest } from '@/components/DataSource/TimeSeriesSource/services';
import './index.less';

export default function FormCpt({ renderContent, backUrl = '/settings/source/timeseries' }) {
  const history = useHistory();
  const params = useParams<{ action: string; type: string; id: string }>();
  const { action } = params;
  const id = action === 'edit' ? params.id : undefined;

  const [type, setType] = useState(action === 'add' ? params.type : '');
  const [data, setData] = useState<any>();
  const [submitLoading, setSubmitLoading] = useState(false);

  const onFinish = async (values: any) => {
    if (type === 'prometheus') {
      let temp = values.settings['prometheus.basic'];
      if (_.isEmpty(temp) || !temp['prometheus.password'] || temp['prometheus.password'] === '' || !temp['prometheus.user'] || temp['prometheus.user'] === '') {
        values.settings['prometheus.basic'] = null;
      }
    }

    setSubmitLoading(true);
    let pluginId = data?.plugin_id;
    if (!pluginId) {
      const result = await getDataSourcePluginList({ p: 1, limit: 100, category: 'timeseries' });
      pluginId = _.get(_.find(result, { type }), 'id');
    }
    return submitRequest({
      ...values,
      plugin_id: pluginId,
      id: data?.id, // 如有则更新，否则是新建
      is_enable: data ? undefined : true, // 新建默认启用
      is_test: true, // 是否测试
    })
      .then(() => {
        // TODO: 这里不同于 srm，接口没有返回是否测试成功
        message.success(action === 'add' ? '添加成功, 2s 后返回列表' : '更新成功, 2s 后返回列表');
        setTimeout(() => {
          history.push({
            pathname: backUrl,
          });
        }, 2000);
      })
      .finally(() => {
        setSubmitLoading(false);
      });
  };

  useEffect(() => {
    if (action === 'edit' && id !== undefined) {
      getDataSourceDetailById(id).then((res: any) => {
        setData(res);
        setType(res.plugin_type);
      });
    }
  }, []);

  return (
    <PageLayout
      title={
        <div>
          {type}
          <BreadCrumb
            crumbs={[
              {
                text: '数据源管理',
                link: backUrl,
              },
              {
                text: type!,
              },
            ]}
          />
        </div>
      }
    >
      <div className='srm'>{action === 'edit' && data === undefined ? <Spin spinning={true} /> : renderContent(type, data, onFinish, submitLoading)}</div>
    </PageLayout>
  );
}
