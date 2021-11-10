---
order: 3
title: query 紧凑模式
---

只传递 `columns` 和 `url` 这两个必要属性，以及一些必要的后端 API 请求参数。会展示默认的分页信息，以及通用的 「排序、搜索、过滤」等功能。

```jsx
import { DataTable } from 'antd-advanced';
import { Button } from 'antd';
import moment from 'moment';

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
    sorter: true,
    apiSorter: {
      name: 'date_order',
      ascend: 'asc',
      descend: 'desc',
    },
  },
];

const queryFormColumns = [
  {
    type: 'input',
    title: '标题',
    dataIndex: 'title',
  },
  {
    type: 'input',
    title: '出版社',
    dataIndex: 'appUuids',
  },
  {
    type: 'select',
    title: '分类',
    initialValue: ['科技'],
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

const listUrl =
  'https://service-dmgco1kc-1302187237.gz.apigw.tencentcs.com/release/table_api';

const BasicExample: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);
  const onSelectChange = (newKeys) => {
    setSelectedRowKeys(newKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  return (
    <DataTable
      columns={columns}
      rowSelection={rowSelection}
      url={listUrl}
      queryMode='compact'
      queryFormColumns={queryFormColumns}
      showQueryOptionBtns={false}
      apiCallback={(data) => {
        // data
        // total
        return data;
      }}
      reloadBtnPos='left'
      reloadBtnType='btn'
      filterType='none'
      leftHeader={<Button>一个按钮</Button>}
      pageParams={{
        curPageName: 'cur_page',
        pageSizeName: 'page_size',
        startPage: 1,
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
