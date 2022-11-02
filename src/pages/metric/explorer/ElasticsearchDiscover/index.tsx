import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Row, Col, Space, Form, Input, AutoComplete, Tooltip, Button, Table } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import { QuestionCircleOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { json } from '@codemirror/lang-json';
import { defaultHighlightStyle } from '@codemirror/highlight';
import { getIndices, getLogsQuery } from '@/services/warning';
import TimeRangePicker, { parseRange } from '@/components/TimeRangePicker';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import FieldsList from './FieldsList';
import metricQuery from './metricQuery';
import './style.less';

interface IProps {
  datasourceName?: string;
  form: FormInstance;
}

function localeCompareFunc(a, b) {
  return a.localeCompare(b);
}

export default function index(props: IProps) {
  const { datasourceName, form } = props;
  const [indexOptions, setIndexOptions] = useState([]);
  const [indexSearch, setIndexSearch] = useState('');
  const [data, setData] = useState();
  const [series, setSeries] = useState<any[]>([]);
  const [fieldsSearch, setFieldsSearch] = useState('');
  const [fields, setFields] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

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
    <div className='es-discover-container'>
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
                    metricQuery({
                      datasourceCate: 'elasticsearch',
                      datasourceName: values.datasourceName,
                      query: values.query,
                    }).then((res) => {
                      console.log(res);
                      setSeries(res || []);
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
      <div className='es-discover-content'>
        <div className='es-discover-sidebar'>
          <div className='es-discover-sidebar-title'>
            <Input
              placeholder='搜索字段'
              value={fieldsSearch}
              onChange={(e) => {
                setFieldsSearch(e.target.value);
              }}
            />
          </div>
          <div className='es-discover-sidebar-content'>
            <FieldsList
              style={{ marginBottom: 10 }}
              fieldsSearch={fieldsSearch}
              fields={selectedFields}
              type='selected'
              onRemove={(field) => {
                setSelectedFields(_.without(selectedFields, field));
                setFields(_.concat(fields, field));
              }}
            />
            <FieldsList
              fields={fields}
              fieldsSearch={fieldsSearch}
              type='available'
              onSelect={(field) => {
                setSelectedFields(_.concat(selectedFields, field));
                setFields(_.without(fields, field));
              }}
            />
          </div>
        </div>
        <div className='es-discover-main'>
          <div style={{ height: 150, padding: '10px 0' }}>
            <Timeseries
              series={series}
              values={
                {
                  custom: {
                    drawStyle: 'lines',
                    lineInterpolation: 'smooth',
                  },
                  options: {
                    legend: {
                      displayMode: 'hidden',
                    },
                    tooltip: {
                      mode: 'all',
                    },
                  },
                } as any
              }
            />
          </div>
          <Table
            size='small'
            className='event-logs-table'
            tableLayout='fixed'
            rowKey='id'
            columns={
              _.isEmpty(selectedFields)
                ? [
                    {
                      title: 'Document',
                      dataIndex: 'fields',
                      render(text) {
                        return (
                          <dl className='event-logs-row'>
                            {_.map(text, (val, key) => {
                              return (
                                <React.Fragment key={key}>
                                  <dt>{key}:</dt> <dd>{_.join(val, ',')}</dd>
                                </React.Fragment>
                              );
                            })}
                          </dl>
                        );
                      },
                    },
                  ]
                : _.map(selectedFields, (item) => {
                    return {
                      title: item,
                      dataIndex: 'fields',
                      render(fields) {
                        return _.join(fields[item], ',');
                      },
                      sorter: (a, b) => localeCompareFunc(_.join(_.get(a, `fields[${item}]`, '')), _.join(_.get(b, `fields[${item}]`, ''))),
                    };
                  })
            }
            dataSource={data}
            expandable={{
              expandedRowRender: (record) => {
                let value = '';
                try {
                  value = JSON.stringify(record.json, null, 4);
                } catch (e) {
                  console.error(e);
                  value = '无法解析';
                }
                return (
                  <CodeMirror
                    value={value}
                    height='auto'
                    theme='light'
                    basicSetup={false}
                    editable={false}
                    extensions={[
                      defaultHighlightStyle.fallback,
                      json(),
                      EditorView.lineWrapping,
                      EditorView.theme({
                        '&': {
                          backgroundColor: '#F6F6F6 !important',
                        },
                        '&.cm-editor.cm-focused': {
                          outline: 'unset',
                        },
                      }),
                    ]}
                  />
                );
              },
              expandIcon: ({ expanded, onExpand, record }) =>
                expanded ? <DownOutlined onClick={(e) => onExpand(record, e)} /> : <RightOutlined onClick={(e) => onExpand(record, e)} />,
            }}
            scroll={{ y: 302 }}
          />
        </div>
      </div>
    </div>
  );
}
