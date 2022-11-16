import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Space, Form, Input, AutoComplete, Tooltip, Button, Table, Empty, Spin, InputNumber, Select } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import { QuestionCircleOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { json } from '@codemirror/lang-json';
import { defaultHighlightStyle } from '@codemirror/highlight';
import { Column } from '@ant-design/plots';
import { getIndices, getLogsQuery } from '@/services/warning';
import TimeRangePicker, { parseRange } from '@/components/TimeRangePicker';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import FieldsList from './FieldsList';
import metricQuery from './metricQuery';
import { getColumnsFromFields } from './utils';
import './style.less';

interface IProps {
  datasourceName?: string;
  form: FormInstance;
}

const LOGS_LIMIT = 50;
const TIME_FORMAT = 'YYYY.MM.DD HH:mm:ss';

export default function index(props: IProps) {
  const { datasourceName, form } = props;
  const [indexOptions, setIndexOptions] = useState([]);
  const [indexSearch, setIndexSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [displayTimes, setDisplayTimes] = useState('');
  const [fieldsSearch, setFieldsSearch] = useState('');
  const [fields, setFields] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isMore, setIsMore] = useState(true);
  const [interval, setInterval] = useState(1);
  const [intervalUnit, setIntervalUnit] = useState<'second' | 'min' | 'hour'>('min');
  const totalRef = useRef(0);
  const pageRef = useRef(1);
  const timesRef =
    useRef<{
      start: number;
      end: number;
    }>();
  const fetchSeries = (values) => {
    if (timesRef.current) {
      const { start, end } = timesRef.current;
      metricQuery({
        ...timesRef.current,
        datasourceCate: 'elasticsearch',
        datasourceName: values.datasourceName,
        query: values.query,
        interval,
        intervalUnit,
      }).then((res) => {
        setDisplayTimes(`${moment.unix(start).format(TIME_FORMAT)} - ${moment.unix(end).format(TIME_FORMAT)}`);
        setSeries(res || []);
      });
    }
  };
  const fetchData = (page) => {
    form.validateFields().then((values) => {
      const { start, end } = parseRange(values.query.range);
      timesRef.current = {
        start: moment(start).unix(),
        end: moment(end).unix(),
      };
      if (page === 1) {
        setLoading(true);
      }
      getLogsQuery({
        cate: 'elasticsearch',
        cluster: datasourceName,
        query: [
          {
            ...timesRef.current,
            index: values.query.index,
            filter: values.query.filter,
            date_field: values.query.date_field,
            limit: LOGS_LIMIT,
            page,
          },
        ],
      })
        .then((res) => {
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
          totalRef.current = res.dat.total;
          setData(page === 1 ? newData : [...data, ...newData]);
          if (page === 1) {
            setFields(allFields);
            const tableEleNodes = document.querySelectorAll(`.event-logs-table .ant-table-body`)[0];
            tableEleNodes?.scrollTo(0, 0);
          }
        })
        .finally(() => {
          setLoading(false);
        });
      if (page === 1) {
        fetchSeries(values);
      }
    });
  };

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

  useEffect(() => {
    fetchSeries(form.getFieldsValue());
  }, [interval, intervalUnit]);

  return (
    <div className='es-discover-container'>
      <Space>
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
            style={{ width: 190 }}
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
          <Form.Item name={['query', 'filter']} style={{ minWidth: 300 }}>
            <Input />
          </Form.Item>
        </Input.Group>
        <div style={{ display: 'flex' }}>
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
                  fetchData(1);
                }}
              >
                查询
              </Button>
            </Form.Item>
          </Space>
        </div>
      </Space>
      <Spin spinning={loading}>
        {!_.isEmpty(data) ? (
          <div className='es-discover-content'>
            <div className='es-discover-sidebar'>
              <div className='es-discover-sidebar-title'>
                <Input
                  placeholder='搜索字段'
                  value={fieldsSearch}
                  onChange={(e) => {
                    setFieldsSearch(e.target.value);
                  }}
                  allowClear
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
              <div className='es-discover-chart'>
                <div className='es-discover-chart-title'>
                  <span>{displayTimes}</span>
                  <span style={{ marginLeft: 10 }}>
                    间隔:{' '}
                    <InputNumber
                      size='small'
                      value={interval}
                      min={1}
                      onBlur={(e) => {
                        const val = _.toNumber(e.target.value);
                        if (val > 0) setInterval(val);
                      }}
                      onPressEnter={(e: any) => {
                        const val = _.toNumber(e.target.value);
                        if (val > 0) setInterval(val);
                      }}
                    />{' '}
                    <Select size='small' style={{ width: 70 }} value={intervalUnit} onChange={(val) => setIntervalUnit(val)}>
                      <Select.Option value='second'>秒</Select.Option>
                      <Select.Option value='min'>分钟</Select.Option>
                      <Select.Option value='hour'>小时</Select.Option>
                    </Select>
                  </span>
                </div>
                <div className='es-discover-chart-content'>
                  <Timeseries
                    series={series}
                    values={
                      {
                        custom: {
                          drawStyle: 'bar',
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
              </div>
              <div
                onScrollCapture={() => {
                  const tableEleNodes = document.querySelectorAll(`.event-logs-table .ant-table-body`)[0];
                  if (Math.round(tableEleNodes?.scrollTop) + tableEleNodes?.clientHeight === tableEleNodes?.scrollHeight) {
                    if (data.length > 500) {
                      setIsMore(false);
                      return false;
                    }
                    fetchData(pageRef.current + 1);
                    pageRef.current = pageRef.current + 1;
                  }
                }}
              >
                <Table
                  size='small'
                  className='event-logs-table'
                  tableLayout='fixed'
                  rowKey='id'
                  columns={getColumnsFromFields(selectedFields, form.getFieldValue(['query', 'date_field']))}
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
                  scroll={{ x: _.isEmpty(selectedFields) ? undefined : 'max-content', y: !isMore ? 312 - 35 : 312 }}
                  pagination={false}
                  footer={
                    !isMore
                      ? () => {
                          return '只能查询您搜索匹配的前 500 个日志，请细化您的过滤条件。';
                        }
                      : undefined
                  }
                />
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        )}
      </Spin>
    </div>
  );
}
