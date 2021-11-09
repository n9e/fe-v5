---
order: 1
title: 常用表头
---

表头包含左侧的标题区，和右侧的筛选区。

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

ReactDOM.render(
  <div>
    <Table leftHeader='用户信息' columns={columns} dataSource={data} />
  </div>,
  mountNode,
);
```
