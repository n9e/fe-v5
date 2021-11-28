import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Spin, Divider, Breadcrumb } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import Highlight from 'react-highlight';
import 'highlight.js/styles/vs2015.css';
import request from '@pkgs/request';
import api from '@common/api';
import useFormatMessage from '@pkgs/hooks/useFormatMessage';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import { prefixCls } from '@common/config';
import { Tpl } from './interface';

const Detail = (props: any) => {
  const id = _.get(props, 'match.params.id');
  const intlFmtMsg = useFormatMessage();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({} as Tpl);

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
  }, [id]);

  return (
    <Spin spinning={loading}>
      <Breadcrumb style={{ paddingBottom: 20, marginBottom: 20, borderBottom: '1px solid #efefef' }}>
        <Breadcrumb.Item>
          <Link to={`/tpls`}>{intlFmtMsg({ id: 'breadcrumb.tpls' })}</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          {intlFmtMsg({ id: 'breadcrumb.tpl' })}
        </Breadcrumb.Item>
      </Breadcrumb>
      <div className={`${prefixCls}-zeus-task-table`}>
        <div className="ant-table ant-table-default ant-table-bordered">
          <div className="ant-table-content">
            <div className="ant-table-body">
              <table>
                <colgroup>
                  <col style={{ width: 100, minWidth: 100 }} />
                  <col />
                </colgroup>
                <tbody className="ant-table-tbody">
                  <tr className="ant-table-row ant-table-row-level-0">
                    <td>{intlFmtMsg({ id: 'task.title'})}</td>
                    <td>{data.title}</td>
                  </tr>
                  <tr className="ant-table-row ant-table-row-level-0">
                    <td>{intlFmtMsg({ id: 'tpl.creator'})}</td>
                    <td>{data.creator}</td>
                  </tr>
                  <tr className="ant-table-row ant-table-row-level-0">
                    <td>{intlFmtMsg({ id: 'tpl.last_updated'})}</td>
                    <td>{moment(data.last_updated).format('YYYY-MM-DD HH:mm:ss')}</td>
                  </tr>
                  <tr className="ant-table-row ant-table-row-level-0">
                    <td>{intlFmtMsg({ id: 'task.control.params'})}</td>
                    <td>
                      {intlFmtMsg({ id: 'task.account'})}：{data.account}
                      <Divider type="vertical" />
                      {intlFmtMsg({ id: 'task.batch'})}：{data.batch}
                      <Divider type="vertical" />
                      {intlFmtMsg({ id: 'task.tolerance'})}：{data.tolerance}
                      <Divider type="vertical" />
                      {intlFmtMsg({ id: 'task.timeout'})}：{data.timeout}
                    </td>
                  </tr>
                  <tr className="ant-table-row ant-table-row-level-0">
                    <td>{intlFmtMsg({ id: 'task.script'})}</td>
                    <td>
                      <Highlight className="bash">
                        {data.script}
                      </Highlight>
                    </td>
                  </tr>
                  <tr className="ant-table-row ant-table-row-level-0">
                    <td>{intlFmtMsg({ id: 'task.script.args'})}</td>
                    <td>{data.args}</td>
                  </tr>
                  <tr className="ant-table-row ant-table-row-level-0">
                    <td>{intlFmtMsg({ id: 'task.pause'})}</td>
                    <td>{data.pause}</td>
                  </tr>
                  <tr className="ant-table-row ant-table-row-level-0">
                    <td>{intlFmtMsg({ id: 'task.host.list'})}</td>
                    <td>
                      {
                        _.map(data.hosts, (host) => {
                          return <div key={host}>{host}</div>;
                        })
                      }
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="mt10">
        <Link to={{ pathname: `/tpls/${id}/modify` }}>
          <Button type="primary" className="mr10">{intlFmtMsg({ id: 'tpl.modify'})}</Button>
        </Link>
        <Link to={{ pathname: `/tasks-add`, search: `tpl=${id}` }}>
          <Button type="primary">{intlFmtMsg({ id: 'tpl.create.task'})}</Button>
        </Link>
      </div>
    </Spin>
  )
}

export default CreateIncludeNsTree(Detail, { visible: false });
