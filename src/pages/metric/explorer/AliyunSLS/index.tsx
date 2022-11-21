import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Radio, Space, Input, Switch, Button, Tooltip, Spin, Empty, Table, Tag } from 'antd';
import { QuestionCircleOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import moment from 'moment';
import _ from 'lodash';
import { DatasourceCateEnum } from '@/utils/constant';
import { getSLSFields, getSLSLogs, getHistogram } from '@/services/metric';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import TimeRangePicker, { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import ProjectSelect from './ProjectSelect';
import LogstoreSelect from './LogstoreSelect';
import FieldsSidebar from '../components/FieldsSidebar';
import { getColumnsFromFields, getInnerTagKeys } from './utils';
import './style.less';

interface IProps {
  datasourceCate: DatasourceCateEnum.aliyunSLS;
  datasourceName: string;
  headerExtra: HTMLDivElement | null;
}

const ModeRadio = ({ mode, setMode }) => {
  return (
    <Radio.Group
      value={mode}
      onChange={(e) => {
        setMode(e.target.value);
      }}
      buttonStyle='solid'
    >
      <Radio.Button value='timeSeries'>时序值</Radio.Button>
      <Radio.Button value='raw'>日志原文</Radio.Button>
    </Radio.Group>
  );
};

export default function index(props: IProps) {
  const { datasourceCate, datasourceName = 'sls_test', headerExtra } = props;
  const [mode, setMode] = useState('timeSeries');
  const [project, setProject] = useState('');
  const [logstore, setLogstore] = useState('');
  const [query, setQuery] = useState('');
  const [power_sql, setPower_sql] = useState<boolean>(false);
  const [range, setRange] = useState<IRawTimeRange>({ start: 'now-1h', end: 'now' });
  const [fields, setFields] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [logs, setLogs] = useState<{ [index: string]: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMore, setIsMore] = useState(true);
  const [histogram, setHistogram] = useState<
    {
      metric: string;
      data: [number, number][];
    }[]
  >([
    {
      metric: '',
      data: [],
    },
  ]);

  return (
    <div>
      {headerExtra ? (
        createPortal(<ModeRadio mode={mode} setMode={setMode} />, headerExtra)
      ) : (
        <div style={{ marginBottom: 10 }}>
          <ModeRadio mode={mode} setMode={setMode} />
        </div>
      )}
      <Space style={{ display: 'flex', marginBottom: 16 }}>
        <ProjectSelect datasourceCate={datasourceCate} datasourceName={datasourceName} onChange={setProject} />
        <LogstoreSelect datasourceCate={datasourceCate} datasourceName={datasourceName} project={project} onChange={setLogstore} />
        <InputGroupWithFormItem
          label={
            <span>
              查询条件{' '}
              <Tooltip title=''>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          }
          labelWidth={90}
        >
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            style={{ width: 300 }}
          />
        </InputGroupWithFormItem>
        <Switch
          checkedChildren='开启'
          unCheckedChildren='关闭'
          checked={power_sql}
          onChange={(val) => {
            setPower_sql(val);
          }}
        />
        <TimeRangePicker value={range} />
        <Button
          type='primary'
          onClick={() => {
            const requestParams = {
              cate: datasourceCate,
              cluster: datasourceName,
              query: [
                {
                  project,
                  logstore,
                  from: moment(parseRange(range).start).unix(),
                  to: moment(parseRange(range).end).unix(),
                  lines: 500,
                  offset: 0,
                  reverse: false,
                  power_sql,
                },
              ],
            };
            getSLSFields(requestParams).then((res) => {
              setFields(res);
            });
            setLoading(true);
            getSLSLogs(requestParams)
              .then((res) => {
                setLogs(res.list);
              })
              .finally(() => {
                setLoading(false);
              });
            getHistogram(requestParams).then((res) => {
              setHistogram(
                _.map(res, (item) => {
                  return {
                    metric: item.metric,
                    data: item.values,
                  };
                }),
              );
            });
          }}
        >
          查询
        </Button>
      </Space>
      <Spin spinning={loading}>
        {!_.isEmpty(logs) ? (
          <div className='sls-discover-content'>
            <FieldsSidebar fields={fields} setFields={setFields} value={selectedFields} onChange={setSelectedFields} />
            <div className='sls-discover-main'>
              <div className='sls-discover-chart'>
                <div className='sls-discover-chart-content'>
                  <Timeseries
                    series={histogram}
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
              <Table
                size='small'
                className='event-logs-table'
                tableLayout='fixed'
                rowKey='__time__'
                columns={getColumnsFromFields(selectedFields, '__time__')}
                dataSource={logs}
                expandable={{
                  expandedRowRender: (record) => {
                    const tagskeys = getInnerTagKeys(record);
                    return (
                      <div className='sls-discover-raw-content'>
                        {!_.isEmpty(tagskeys) && (
                          <div className='sls-discover-raw-tags'>
                            {_.map(tagskeys, (key) => {
                              return <Tag color='purple'>{record[key]}</Tag>;
                            })}
                          </div>
                        )}
                        {_.map(record, (val, key) => {
                          return (
                            <dl key={key} className='event-logs-row'>
                              <dt>{key}: </dt>
                              <dd>{val}</dd>
                            </dl>
                          );
                        })}
                      </div>
                    );
                    // let value = '';
                    // try {
                    //   value = JSON.stringify(record.json, null, 4);
                    // } catch (e) {
                    //   console.error(e);
                    //   value = '无法解析';
                    // }
                    // return (
                    //   <CodeMirror
                    //     value={value}
                    //     height='auto'
                    //     theme='light'
                    //     basicSetup={false}
                    //     editable={false}
                    //     extensions={[
                    //       defaultHighlightStyle.fallback,
                    //       json(),
                    //       EditorView.lineWrapping,
                    //       EditorView.theme({
                    //         '&': {
                    //           backgroundColor: '#F6F6F6 !important',
                    //         },
                    //         '&.cm-editor.cm-focused': {
                    //           outline: 'unset',
                    //         },
                    //       }),
                    //     ]}
                    //   />
                    // );
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
