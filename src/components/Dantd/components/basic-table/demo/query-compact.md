---
order: 7
title: query 紧凑模式
---

只传递 `columns` 和 `dataSource` 这两个必要属性。会展示默认的分页信息，以及通用的 「排序、搜索、过滤」等功能。这个例子中，也包含了 `searchRender` 的使用，可以自定义 `render` 方法，也可以高亮输入的部分。

```jsx
import { useState } from 'react';
import { BasicTable, useAsyncRetry } from 'antd-advanced';
import { Button, Divider, Typography } from 'antd';

const columns = [
  {
    title: '标题',
    dataIndex: 'title',
  },
  {
    title: '缩略图',
    dataIndex: 'image',
    render: (text, record, index) => (
      <div>
        {record.thumbnail_pic_s ? (
          <img
            style={{ maxHeight: 40 }}
            src={record.thumbnail_pic_s}
            alt={record.title}
          />
        ) : (
          '暂无图片'
        )}
      </div>
    ),
  },
  {
    title: '分类',
    dataIndex: 'category',
  },
  {
    title: '作者',
    dataIndex: 'author_name',
  },
  {
    title: '发布日期',
    dataIndex: 'date',
    commonSorter: true,
  },
];

const queryFormColumns = [
  {
    type: 'input',
    title: '标题',
    initialValue: '40',
    dataIndex: 'title',
  },
  {
    type: 'select',
    title: '作者',
    dataIndex: 'author_name',
    options: [
      {
        title: '快科技',
        value: '快科技',
      },
      {
        title: '搜狐新闻',
        value: '搜狐新闻',
      },
      {
        title: '科技朝闻',
        value: '科技朝闻',
      },
    ],
  },
  {
    type: 'select',
    title: '分类',
    dataIndex: 'category',
    selectMode: 'multiple',
    options: [
      {
        title: '科技',
        value: '科技',
      },
      {
        title: '头条',
        value: '头条',
      },
      {
        title: '社会',
        value: '社会',
      },
      {
        title: '财经',
        value: '财经',
      },
    ],
  },
];

const fetchData = () => {
  const listUrl =
    'https://service-dmgco1kc-1302187237.gz.apigw.tencentcs.com/release/table_api';
  return new Promise(async (resolve, reject) => {
    const res = await fetch(listUrl);
    res
      .json()
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const Demo: React.FC = () => {
  const tableState = useAsyncRetry(fetchData);
  const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);
  const onSelectChange = (newKeys) => {
    setSelectedRowKeys(newKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  return (
    <BasicTable
      queryFormColumns={queryFormColumns}
      loading={tableState.loading}
      onReload={tableState.retry}
      rowSelection={rowSelection}
      leftHeader={<Button>一个按钮</Button>}
      queryMode='compact'
      searchPos='right'
      searchPlaceholder='模糊匹配，输入标题/作者/分类，以空格分隔'
      reloadBtnPos='left'
      reloadBtnType='btn'
      filterType='none'
      // hideContentBorder={true}
      columns={columns}
      dataSource={tableState.value}
    />
  );
};

ReactDOM.render(
  <div>
    <Demo />
  </div>,
  mountNode,
);
```
