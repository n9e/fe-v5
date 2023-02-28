import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Spin, Empty } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import _ from 'lodash';
import moment from 'moment';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import { parseRange } from '@/components/TimeRangePicker';
import { getFields, logQuery, getHistogram } from './services';
import FieldsSidebar from '../components/FieldsSidebar';
import RawTable from './RawTable';

interface IProps {
  form: FormInstance;
}

function Raw(props: IProps, ref) {
  const { form } = props;
  const [fields, setFields] = useState<string[]>([]);
  const [timeField, setTimeField] = useState<string>('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [logs, setLogs] = useState<{ [index: string]: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMore, setIsMore] = useState(true);
  const [histogram, setHistogram] = useState<
    {
      metric: string;
      data: [number, number][];
    }[]
  >([]);

  useImperativeHandle(ref, () => ({
    fetchData: (datasourceCate, datasourceName, values) => {
      const query = values.query;
      const requestParams = {
        cate: datasourceCate,
        cluster: datasourceName,
        query: [
          {
            sql: query.sql,
            time_field: query.time_field,
            time_format: query.time_format,
            from: moment(parseRange(query.range).start).unix(),
            to: moment(parseRange(query.range).end).unix(),
            limit: 500,
          },
        ],
      };
      setTimeField(query.time_field);
      getFields(requestParams).then((res) => {
        setFields(res || []);
      });
      setLoading(true);
      logQuery(requestParams)
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

  const reloadLogs = (from, to) => {
    const values = form.getFieldsValue();
    const query = values.query;
    const requestParams = {
      cate: values.datasourceCate,
      cluster: values.datasourceName,
      query: [
        {
          sql: query.sql,
          time_field: query.time_field,
          time_format: query.time_format,
          from,
          to,
          limit: 500,
        },
      ],
    };
    setLoading(true);
    logQuery(requestParams)
      .then((res) => {
        setLogs(res.list);
      })
      .finally(() => {
        setLoading(false);
      });
  };

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
                  onClick={(event, datetime, value, points) => {
                    const start = _.get(points, '[0][0]');
                    const allPoints = _.get(histogram, '[0].data');
                    if (start && allPoints) {
                      const step = _.get(allPoints, '[2][0]') - _.get(allPoints, '[1][0]');
                      const end = start + step;
                      reloadLogs(start, end);
                    }
                  }}
                />
              </div>
            </div>
            <RawTable data={logs} timeField={timeField} selectedFields={selectedFields} scroll={{ x: 'max-content', y: !isMore ? 312 - 35 : 312 }} />
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
