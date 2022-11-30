import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Spin, Table, Tag, Empty } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import { parseRange } from '@/components/TimeRangePicker';
import { getSLSFields, getSLSLogs, getHistogram } from '@/services/metric';
import FieldsSidebar from '../components/FieldsSidebar';
import { getColumnsFromFields, getInnerTagKeys } from './utils';
import RawTable from './RawTable';

function Raw(props, ref) {
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

  useImperativeHandle(ref, () => ({
    fetchData: (datasourceCate, datasourceName, values) => {
      const query = values.query;
      const requestParams = {
        cate: datasourceCate,
        cluster: datasourceName,
        query: [
          {
            project: query.project,
            logstore: query.logstore,
            from: moment(parseRange(query.range).start).unix(),
            to: moment(parseRange(query.range).end).unix(),
            lines: 500,
            offset: 0,
            reverse: false,
            power_sql: query.power_sql,
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
    },
  }));

  return (
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
            <RawTable data={logs} selectedFields={selectedFields} scroll={{ x: 'max-content', y: !isMore ? 312 - 35 : 312 }} />
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
  );
}

export default forwardRef(Raw);
