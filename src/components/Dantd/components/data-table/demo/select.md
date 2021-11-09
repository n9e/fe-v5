---
order: 1
title: 选择
---

只传递 `columns` 和 `url` 这两个必要属性，以及一些必要的后端 API 请求参数。会展示默认的分页信息，以及通用的 「排序、搜索、过滤」等功能。

```jsx
import { DataTable as Table, useAsync } from 'antd-advanced';
import { Button, Tabs, DatePicker, Form } from 'antd';
import moment from 'moment';

const listUrl =
  'https://service-dmgco1kc-1302187237.gz.apigw.tencentcs.com/release/table_api';
const columns = [
  {
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
    filters: [],
    apiFilter: {
      name: 'category',
      // mapping: {
      //   '科技': 'BillBill'
      // },
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

const fn = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { text: '科技', value: '1' },
        { text: '头条', value: '2' },
        { text: '社会', value: '3' },
        { text: '财经', value: '4' },
      ]);
    }, 1000);
  });

const BasicExample: React.FC = () => {
  const state = useAsync(fn);
  const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);
  const onSelectChange = (newKeys) => {
    setSelectedRowKeys(newKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const renderColumns = () => {
    return columns.map((column) => {
      if (column.dataIndex === 'category') {
        const filters = state.value || [];
        console.info('filters', filters);
        return {
          ...column,
          filters,
          apiFilter: {
            name: 'category',
            callback: (arr) => {
              return arr.join(',');
            },
          },
        };
      }
      return column;
    });
  };

  return (
    <Table
      rowSelection={rowSelection}
      columns={renderColumns()}
      url={listUrl}
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
