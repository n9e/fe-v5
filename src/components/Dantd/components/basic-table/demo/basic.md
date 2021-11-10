---
order: 0
title: 基本
---

只传递 `columns` 和 `dataSource` 这两个必要属性。会展示默认的分页信息，以及通用的 「排序、搜索、过滤」等功能。这个例子中，也包含了 `searchRender` 的使用，可以自定义 `render` 方法，也可以高亮输入的部分。

```jsx
import { BasicTable as Table } from 'antd-advanced';
import { Tag, Divider, Typography } from 'antd';
const { Paragraph } = Typography;

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    commonFilter: true,
    render: (text) => <a href='test'>{text}</a>,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    commonSorter: true,
    key: 'age',
    render: (text) => <span data-testid='column-age'>{text}</span>,
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    commonSearch: true,
    searchRender(value: any, row: any, index: any, highlightNode: any) {
      const obj = {
        children: (
          <div style={{ minWidth: 64 }}>
            <Paragraph style={{ marginBottom: 0 }} copyable={{ text: value }}>
              {highlightNode}
            </Paragraph>
          </div>
        ),
      };
      return obj;
    },
  },
  {
    title: 'Tags',
    key: 'tags',
    dataIndex: 'tags',
    commonSearch: true,
    render: (tags) => (
      <span>
        {tags.map((tag) => {
          let color = tag.length > 5 ? 'geekblue' : 'green';
          if (tag === 'loser') {
            color = 'volcano';
          }
          return (
            <Tag data-testid='button-up' color={color} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          );
        })}
      </span>
    ),
  },
  {
    title: 'Action',
    key: 'action',
    render: (text, record) => (
      <span>
        <a href='test'>Invite {record.name}</a>
        <Divider type='vertical' />
        <a href='test'>Delete</a>
      </span>
    ),
  },
];

const data = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    tags: ['loser'],
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 23,
    address: 'Sidney No. 1 Lake Park',
    tags: ['cool', 'teacher'],
  },
];

const newDataSource = [];
for (let i = 0; i < 200; i++) {
  const sItem = data[i % data.length];
  newDataSource.push(sItem);
}

ReactDOM.render(
  <div>
    <Table columns={columns} dataSource={newDataSource} />
  </div>,
  mountNode,
);
```
