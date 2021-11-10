---
order: 4
title: 从API获取数据
---

这是一个较为完整的，从 `API` 获取数据的示例，使用 `BasicTable` 完成

```jsx
import { Button, Tabs, DatePicker, Form } from 'antd';
import { BasicTable as Table } from 'antd-advanced';
import moment from 'moment';

const columns = [
  {
    title: '标题',
    dataIndex: 'title',
    commonSearch: true,
  },
  {
    title: '缩略图',
    dataIndex: 'image',
    render: (text, record, index) => (
      <div>
        {record.thumbnail_pic_s ? (
          <img style={{ maxHeight: 40 }} src={record.thumbnail_pic_s} alt={record.title} />
        ) : (
          '暂无图片'
        )}
      </div>
    ),
  },
  {
    title: '分类',
    dataIndex: 'category',
    commonFilter: true,
  },
  {
    title: '作者',
    dataIndex: 'author_name',
    commonFilter: true,
  },
  {
    title: '发布日期',
    dataIndex: 'date',
    commonSorter: true,
  },
];

function getOnHourUnix(time) {
  if (!time) {
    return '';
  }
  const onHourDate = new Date(time.format('YYYY-MM-DD 00:00:00'));
  return moment(onHourDate)
    .unix()
    .toString();
}

const listUrl = 'https://service-dmgco1kc-1302187237.gz.apigw.tencentcs.com/release/table_api';

const BasicExample: React.FC = () => {

  const [newsDate, setDate] = React.useState();
  const [newsData, setNews] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    fetchData();
  }, [newsDate]);

  async function fetchData() {
    const date = getOnHourUnix(newsDate);
    let url = new URL(listUrl) as any;
    url.search = new URLSearchParams({
      date,
    }) as any;
    setLoading(true);
    const res = await fetch(url);
    res
      .json()
      .then(res => {
        setNews(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }

  const onDateChange = newDate => {
    setDate(newDate);
  };
  return (
    <Table
      leftHeader={
        <Form.Item
          style={{
            marginBottom: -5,
          }}
          label="发布日期"
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
        >
          <DatePicker placeholder="请选择发布日期" onChange={onDateChange} value={newsDate} />
        </Form.Item>
      }
      queryMode="compact"
      searchPos="right"
      searchPlaceholder="模糊匹配，输入标题/作者/分类，以空格分隔"
      reloadBtnPos="left"
      reloadBtnType="btn"
      filterType="none"
      loading={loading}
      onReload={() => {
        fetchData();
      }}
      tableTitle="头条新闻"
      showSearch={true}
      columns={columns}
      dataSource={newsData}
    />
  );
}

ReactDOM.render(
  <div>
    <BasicExample />
  </div>,
  mountNode,
);
```
