---
order: 2
title: 自定义Column长度
---

自定义 Column 的长度等样式。但是此时收起时，无法计算需要隐藏的 Column 的宽度，现在收起时默认只展示一项，可以通过 `columnStyleHideNumber` 设置

```jsx
import { useState } from 'react';
import { QueryForm } from 'antd-advanced';
import { InputNumber } from 'antd';

const columns = [
  {
    type: 'input',
    title: '实例名称',
    dataIndex: 'name',
    initialValue: '机器3011',
    isInputPressEnterCallSearch: true,
    colStyle: {
      width: '600px',
    },
  },
  {
    type: 'select',
    title: '报警等级',
    dataIndex: 'level',
    initialValue: 'all',
    options: [
      {
        title: '全部',
        value: 'all',
      },
      {
        title: 'P0',
        value: 'p0',
      },
      {
        title: 'P1',
        value: 'p1',
      },
      {
        title: 'P2',
        value: 'p2',
      },
    ],
  },
  {
    type: 'select',
    title: '任务状态',
    dataIndex: 'status',
    selectMode: 'multiple',
    initialValue: 'success',
    options: [
      {
        title: '进行中',
        value: 'processing',
      },
      {
        title: '成功',
        value: 'success',
      },
      {
        title: '失败',
        value: 'fail',
      },
    ],
  },
  {
    type: 'custom',
    title: '机器数量',
    dataIndex: 'number',
    initialValue: 10,
    component: (
      <InputNumber
        placeholder='请输入机器数量'
        style={{ marginTop: 4, width: '100%' }}
        min={0}
        precision={0}
      />
    ),
  },
];

const Demo: React.FC = () => {
  const [result, setResult] = useState({});

  const handleChange = (queryValue) => {
    setResult(queryValue);
  };

  const handleSearch = (queryValue) => {
    setResult(queryValue);
  };

  return (
    <div>
      <QueryForm
        colMode='style'
        onChange={handleChange}
        onSearch={handleSearch}
        columns={columns}
      />
      <h3>结果：</h3>
      <div>{JSON.stringify(result)}</div>
    </div>
  );
};

ReactDOM.render(
  <div>
    <Demo />
  </div>,
  mountNode,
);
```
