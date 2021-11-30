import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Divider, Popconfirm, Tag, Row, Col, Input, Button, Dropdown, Menu, message } from 'antd';
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import { ColumnProps } from 'antd/lib/table';
import _ from 'lodash';
import moment from 'moment';
import { useAntdTable } from 'ahooks';
import { useTranslation } from 'react-i18next';
import request from '@/utils/request';
import api from '@/utils/api';
import LeftTree from '@/components/LeftTree';
import PageLayout from '@/components/pageLayout';
import { Tpl } from './interface';
import BindTags from './bindTags';
import UnBindTags from './unBindTags';

function getTableData(options: any, busiGroup: number | undefined, query: string) {
  if (busiGroup) {
    return request(`${api.tasktpls(busiGroup)}?limit=${options.pageSize}&p=${options.current}&query=${query}`).then((res) => {
      return { list: res.dat.list, total: res.dat.total };
    });
  }
  return Promise.resolve({ list: [], total: 0 });
}

const index = (_props: any) => {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const [busiId, setBusiId] = useState<number>();
  const [selectedIds, setSelectedIds] = useState([] as any[]);
  const { tableProps, refresh } = useAntdTable<any, any>((options) => getTableData(options, busiId, query), {refreshDeps: [busiId, query]});

  function handleTagClick(tag: string) {
    if (!_.includes(query, tag)) {
      const newQuery = query ? `${query} ${tag}` : tag;
      setQuery(newQuery);
    }
  }

  function handleDelBtnClick(id: number) {
    if (busiId) {
      request(`${api.tasktpl(busiId)}/${id}`, {
        method: 'DELETE',
      }).then(() => {
        message.success(t('msg.delete.success'));
        refresh();
      });
    }
  }

  function handleBatchBindTags () {
    if (!_.isEmpty(selectedIds)) {
      BindTags({
        language: i18n.language,
        selectedIds,
        busiId,
        onOk: () => {
          refresh();
        },
      });
    }
  }

  function handleBatchUnBindTags() {
    if (!_.isEmpty(selectedIds)) {
      let uniqueTags = [] as any[];
      _.each(tableProps.dataSource, (item) => {
        const tags = item.tags ? _.split(item.tags, ',') : [];
        uniqueTags = _.union(uniqueTags, tags);
      });
      UnBindTags({
        language: i18n.language,
        selectedIds,
        uniqueTags,
        busiId,
        onOk: () => {
          refresh();
        },
      });
    }
  }

  const columns: ColumnProps<Tpl>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
    }, {
      title: t('tpl.title'),
      dataIndex: 'title',
      render: (text, record) => {
        return <Link to={{ pathname: `/job-tpls/${record.id}/detail` }}>{text}</Link>;
      },
    }, {
      title: t('tpl.tags'),
      dataIndex: 'tags',
      render: (text) => {
        const tags = text ? _.split(text, ',') : [];
        return _.map(tags, item => <Tag color="blue" key={item} onClick={() => handleTagClick(item)}>{item}</Tag>);
      },
    }, {
      title: t('tpl.creator'),
      dataIndex: 'create_by',
      width: 100,
    }, {
      title: t('tpl.last_updated'),
      dataIndex: 'update_at',
      width: 160,
      render: (text) => {
        return moment.unix(text).format('YYYY-MM-DD HH:mm:ss');
      },
    }, {
      title: t('table.operations'),
      width: 220,
      render: (_text, record) => {
        return (
          <span>
            <Link to={{ pathname: `/job-tasks/add`, search: `tpl=${record.id}` }}>
              {t('task.create')}
            </Link>
            <Divider type="vertical" />
            <Link to={{ pathname: `/job-tpls/${record.id}/modify` }}>
              {t('table.modify')}
            </Link>
            <Divider type="vertical" />
            <Link to={{ pathname: `/job-tpls/${record.id}/clone` }}>
              {t('table.clone')}
            </Link>
            <Divider type="vertical" />
            <Popconfirm title={t('table.delete.sure')} onConfirm={() => { handleDelBtnClick(record.id); }}>
              <a style={{ color: 'red' }}>{t('table.delete')}</a>
            </Popconfirm>
          </span>
        );
      },
    },
  ];
  return (
    <PageLayout title={t('自愈脚本')}>
      <div style={{ display: 'flex' }}>
        <LeftTree busiGroup={{ onChange: (id) => setBusiId(id) }}></LeftTree>
        <div style={{ flex: 1, padding: 20 }}>
          <Row>
            <Col span={14} className="mb10">
              <Input.Search
                style={{ width: 200 }}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                }}
                placeholder="搜索标题、标签"
              />
            </Col>
            <Col span={10} className="textAlignRight">
              <Link to={{ pathname: `/job-tpls/add` }}>
                <Button
                  icon={<PlusOutlined />}
                  style={{ marginRight: 10 }}
                >
                  {t('tpl.create')}
                </Button>
              </Link>
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item>
                      <Button type="link" disabled={selectedIds.length === 0} onClick={() => { handleBatchBindTags(); }}>{t('tpl.tag.bind')}</Button>
                    </Menu.Item>
                    <Menu.Item>
                      <Button type="link" disabled={selectedIds.length === 0} onClick={() => { handleBatchUnBindTags(); }}>{t('tpl.tag.unbind')}</Button>
                    </Menu.Item>
                  </Menu>
                }
              >
                <Button icon={<DownOutlined />}>{t('table.batch.operations')}</Button>
              </Dropdown>
            </Col>
          </Row>
          <Table
            rowKey="id"
            columns={columns}
            {...tableProps as any}
            rowSelection={{
              selectedRowKeys: selectedIds,
              onChange: (selectedRowKeys) => {
                setSelectedIds(selectedRowKeys);
              }
            }}
          />
        </div>
      </div>
    </PageLayout>
  )
}

export default index;
