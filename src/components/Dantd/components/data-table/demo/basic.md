---
order: 0
title: 基本
---

只传递 `columns` 和 `url` 这两个必要属性，以及一些必要的后端 API 请求参数。会展示默认的分页信息，以及通用的 「排序、搜索、过滤」等功能。

```jsx
import { DataTable as Table } from 'antd-advanced';
import { Button, Tabs, DatePicker, Form } from 'antd';
import moment from 'moment';

const listUrl =
  'https://service-dmgco1kc-1302187237.gz.apigw.tencentcs.com/release/table_api';

const BasicExample: React.FC = () => {
  const columns = [
    {
      title: <div>标题</div>,
      title: '标题',
      dataIndex: 'title',
      apiSearch: {
        name: 'title',
      },
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
      filters: [
        { text: '科技', value: '科技' },
        { text: '头条', value: '头条' },
        { text: '社会', value: '社会' },
        { text: '财经', value: '财经' },
      ],
      apiFilter: {
        name: 'category',
        callback: (arr) => {
          return arr.join(',');
        },
      },
    },
    {
      title: '作者',
      dataIndex: 'author_name',
    },
    {
      title: '发布日期',
      dataIndex: 'date',
      sorter: true,
      apiSorter: {
        name: 'date_order',
        ascend: 'asc',
        descend: 'desc',
      },
    },
  ];
  return (
    <Table
      columns={columns}
      url={listUrl}
      fetchOptions={{
        credentials: 'include',
      }}
      apiCallback={(data) => {
        // data
        // total
        return data;
      }}
      leftHeader={<Button>一个按钮</Button>}
      pageParams={{
        curPageName: 'cur_page',
        pageSizeName: 'page_size',
        startPage: 1,
      }}
      searchParams={{
        apiName: 'search',
        placeholder: '模糊搜索表格内容(多个关键词请用空格分隔。如：key1 key2)',
      }}
    />
  );
};

ReactDOM.render(
  <div>
    <BasicExample />
  </div>,
  mountNode,
);
```
