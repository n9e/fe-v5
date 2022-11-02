import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Row, Col, Space, Form, Input, AutoComplete, Tooltip, Button } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { getIndices, getLogsQuery } from '@/services/warning';
import TimeRangePicker, { parseRange } from '@/components/TimeRangePicker';
import './style.less';

interface IProps {
  datasourceName?: string;
  form: FormInstance;
}

export default function index(props: IProps) {
  const { datasourceName, form } = props;
  const [indexOptions, setIndexOptions] = useState([]);
  const [indexSearch, setIndexSearch] = useState('');
  const [fields, setFields] = useState<string[]>([]);
  const [data, setData] = useState();

  useEffect(() => {
    if (!_.isEmpty(datasourceName)) {
      getIndices({ cate: 'elasticsearch', cluster: datasourceName }).then((res) => {
        setIndexOptions(
          _.map(res.dat, (item) => {
            return {
              value: item,
            };
          }),
        );
      });
    }
  }, [datasourceName]);

  return (
    <div className='metric-explorer-es-discover-container'>
      <Row gutter={8}>
        <Col span={7}>
          <Input.Group compact>
            <span
              className='ant-input-group-addon'
              style={{
                width: 60,
                height: 32,
                lineHeight: '32px',
              }}
            >
              索引{' '}
              <Tooltip
                title={
                  <div>
                    支持多种配置方式
                    <br />
                    1. 指定单个索引 gb 在 gb 索引中搜索所有的文档
                    <br />
                    2. 指定多个索引 gb,us 在 gb 和 us 索引中搜索所有的文档
                    <br />
                    3. 指定索引前缀 g*,u* 在任何以 g 或者 u 开头的索引中搜索所有的文档
                    <br />
                  </div>
                }
              >
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
            <Form.Item
              name={['query', 'index']}
              rules={[
                {
                  required: true,
                  message: '请输入索引',
                },
              ]}
              validateTrigger='onBlur'
              style={{ width: 'calc(100% - 60px)' }}
            >
              <AutoComplete
                dropdownMatchSelectWidth={false}
                style={{ minWidth: 100 }}
                options={_.filter(indexOptions, (item) => {
                  if (indexSearch) {
                    return item.value.includes(indexSearch);
                  }
                  return true;
                })}
                onSearch={(val) => {
                  setIndexSearch(val);
                }}
              />
            </Form.Item>
          </Input.Group>
        </Col>
        <Col span={7}>
          <Input.Group compact>
            <span
              className='ant-input-group-addon'
              style={{
                width: 90,
                height: 32,
                lineHeight: '32px',
              }}
            >
              过滤条件{' '}
              <a href='https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax ' target='_blank'>
                <QuestionCircleOutlined />
              </a>
            </span>
            <Form.Item name={['query', 'filter']} style={{ width: 'calc(100% - 90px)' }}>
              <Input style={{ minWidth: 100 }} />
            </Form.Item>
          </Input.Group>
        </Col>
        <Col span={10} style={{ display: 'flex' }}>
          <Space>
            <Input.Group compact>
              <span
                className='ant-input-group-addon'
                style={{
                  width: 90,
                  height: 32,
                  lineHeight: '32px',
                }}
              >
                时间字段{' '}
              </span>
              <Form.Item name={['query', 'date_field']} initialValue='@timestamp' style={{ width: 'calc(100% - 90px)' }}>
                <Input style={{ minWidth: 100 }} />
              </Form.Item>
            </Input.Group>
            <Form.Item name={['query', 'range']} initialValue={{ start: 'now-1h', end: 'now' }}>
              <TimeRangePicker />
            </Form.Item>
            <Form.Item>
              <Button
                type='primary'
                onClick={() => {
                  form.validateFields().then((values) => {
                    console.log('values', values);
                    const { start, end } = parseRange(values.query.range);
                    getLogsQuery({
                      cate: 'elasticsearch',
                      cluster: datasourceName,
                      query: [
                        {
                          index: values.query.index,
                          filter: values.query.filter,
                          date_field: values.query.date_field,
                          start: 1660735739,
                          end: 1660736039,
                        },
                      ],
                    }).then((res) => {
                      console.log(res);
                      let allFields: string[] = [];
                      const newData = _.map(res.dat.list, (item) => {
                        const keys = _.keys(item.fields);
                        allFields = _.union(_.concat(allFields, keys));
                        return {
                          id: _.uniqueId(),
                          fields: item.fields,
                          json: item._source,
                        };
                      });
                      setFields(allFields);
                      setData(newData);
                    });
                  });
                }}
              >
                查询
              </Button>
            </Form.Item>
          </Space>
        </Col>
      </Row>
      <div className='metric-explorer-es-discover-content'>
        <div className='metric-explorer-es-discover-sidebar'>
          <div>
            <Input placeholder='搜索字段名' />
          </div>
          <div>
            {_.map(fields, (item) => {
              return <div key={item}>{item}</div>;
            })}
          </div>
        </div>
        <div className='metric-explorer-es-discover-main'></div>
      </div>
    </div>
  );
}
