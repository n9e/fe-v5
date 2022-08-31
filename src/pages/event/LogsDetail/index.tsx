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

interface IProps {
  visible: boolean;
  onClose: () => void;
  id: string;
}

interface IJSON {
  [key: string]: string | IJSON;
}

export default function index(props: IProps) {
  const { id, visible, onClose } = props;
  const [range, setRange] = useState<IRawTimeRange>({
    start: 'now-1h',
    end: 'now',
  });
  const [limit, setLimit] = useState(10);
  const [selectedFields, setSelectedFields] = useState<string[]>();
  const [data, setData] = useState<
    {
      raw: string;
      parsed: IJSON;
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
      setData(
        _.map(res.dat, (item) => {
          return {
            raw: item,
            parsed: JSON.parse(item),
          };
        }),
      );
    });
  }, [id, JSON.stringify(range), limit]);

  console.log('data', data);

  return (
    <Drawer title='日志详情' width={960} placement='right' onClose={onClose} visible={visible}>
      <div>
        <Space>
          <TimeRangePicker value={range} onChange={setRange} />
          <Input.Group>
            <span className='ant-input-group-addon'>结果数</span>
            <Select
              value={limit}
              onChange={(val) => {
                setLimit(val);
              }}
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
              style={{ minWidth: 200 }}
            >
              <Select.Option value={10}>10</Select.Option>
              <Select.Option value={20}>20</Select.Option>
              <Select.Option value={50}>50</Select.Option>
              <Select.Option value={100}>100</Select.Option>
              <Select.Option value={500}>500</Select.Option>
            </Select>
          </Input.Group>
        </Space>
      </div>
      <Table
        showHeader={false}
        columns={[
          {
            dataIndex: 'logs',
            render(text) {
              return text;
            },
          },
        ]}
        expandable={{
          expandedRowRender: (record) => {
            let value = '';
            try {
              value = JSON.stringify(record.__json__, null, 4);
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
