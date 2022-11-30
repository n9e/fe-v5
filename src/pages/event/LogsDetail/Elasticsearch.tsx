import React, { useState, useEffect } from 'react';
import { Drawer, Table, Space, Input, Select } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import moment from 'moment';
import _ from 'lodash';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { json } from '@codemirror/lang-json';
import { defaultHighlightStyle } from '@codemirror/highlight';
import TimeRangePicker, { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { getEventLogQuery } from '@/services/warning';
import ModalHOC, { ModalWrapProps } from '@/pages/dashboard/Components/ModalHOC';
import './style.less';

interface IProps {
  id: string;
  start: number;
  end: number;
}

interface IJSON {
  [key: string]: string | IJSON;
}

function localeCompareFunc(a, b) {
  return a.localeCompare(b);
}

function index(props: IProps & ModalWrapProps) {
  const { id, start, end, visible, destroy } = props;
  const [range, setRange] = useState<IRawTimeRange>({
    start: moment.unix(start),
    end: moment.unix(end),
  });
  const [limit, setLimit] = useState(10);
  const [fields, setFields] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>();
  const [data, setData] = useState<
    {
      id: string;
      fields: {
        [key: string]: string[];
      };
      json: IJSON;
    }[]
  >([]);

  useEffect(() => {
    const parsedRange = parseRange(range);
    const start = moment(parsedRange.start).unix();
    const end = moment(parsedRange.end).unix();
    getEventLogQuery({
      event_id: Number(id),
      start,
      end,
      limit,
    }).then((res) => {
      let allFields: string[] = [];
      const newData = _.map(res.dat, (item) => {
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
  }, [id, JSON.stringify(range), limit]);

  return (
    <Drawer title='日志详情' width={960} placement='right' onClose={destroy} visible={visible}>
      <div style={{ marginBottom: 10 }}>
        <Space>
          <TimeRangePicker dateFormat='YYYY-MM-DD HH:mm:ss' value={range} onChange={setRange} />
          <Input.Group>
            <span className='ant-input-group-addon'>结果数</span>
            <Select
              value={limit}
              onChange={(val) => {
                setLimit(val);
              }}
              style={{ minWidth: 60 }}
            >
              <Select.Option value={10}>10</Select.Option>
              <Select.Option value={20}>20</Select.Option>
              <Select.Option value={50}>50</Select.Option>
              <Select.Option value={100}>100</Select.Option>
              <Select.Option value={500}>500</Select.Option>
            </Select>
          </Input.Group>
          <Input.Group>
            <span className='ant-input-group-addon'>筛选字段</span>
            <Select
              mode='multiple'
              value={selectedFields}
              onChange={(val) => {
                setSelectedFields(val);
              }}
              style={{ minWidth: 410 }}
              maxTagCount='responsive'
            >
              {fields.map((item) => {
                return (
                  <Select.Option key={item} value={item}>
                    {item}
                  </Select.Option>
                );
              })}
            </Select>
          </Input.Group>
        </Space>
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
      />
    </Drawer>
  );
}

export default ModalHOC(index);
