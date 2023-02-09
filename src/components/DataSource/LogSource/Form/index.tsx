import React, { useState, useEffect } from 'react';
import { message, Spin } from 'antd';
import _ from 'lodash';
import { useHistory, useParams } from 'react-router-dom';
import PageLayout from '@/components/pageLayout';
import BreadCrumb from '@/components/BreadCrumb';
import { getDataSourceDetailById, getDataSourcePluginList, submitRequest } from '@/components/DataSource/LogSource/services';
import './index.less';

export const ESsourceType = ['elasticsearch', 'tencent-es', 'aliyun-es'];

export default function FormCpt({ renderContent, backUrl = '/settings/source/log' }) {
  const history = useHistory();
  const { action, type, cate, id } = useParams<{ action: string; type: string; cate: string; id: string }>();

  const [data, setData] = useState<any>();
  const [submitLoading, setSubmitLoading] = useState(false);

  const onFinish = async (values: any) => {
    if (ESsourceType.includes(type)) {
      let tempHeaders = {};
      values.settings['es.headers']?.forEach((el) => {
        if (el.key) {
          tempHeaders[el.key] = el.value;
        }
      });
      values.settings['es.basic']['es.auth.enable'] = values.settings['es.basic']['es.user'] && values.settings['es.basic']['es.password'] ? true : false;
      values.settings['es.headers'] = tempHeaders;
    }

    setSubmitLoading(true);
    let pluginId = data?.plugin_id;
    if (!pluginId) {
      const result = await getDataSourcePluginList('logging');
      pluginId = _.get(_.find(result, { type }), 'id'); // TODO: 这里跟 srm 有区别
    }
    return submitRequest({
      ...values,
      plugin_id: pluginId,
      id: data?.id, // 如有则更新，否则是新建
      is_enable: data ? undefined : true, // 新建默认启用
    })
      .then(() => {
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
    if (id !== undefined) {
      getDataSourceDetailById(id).then((res: any) => {
        setData(res);
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
