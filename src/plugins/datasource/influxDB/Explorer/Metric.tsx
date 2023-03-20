import React, { useState, forwardRef, useImperativeHandle } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Spin, Empty } from 'antd';
import { parseRange } from '@/components/TimeRangePicker';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import { getSerieName } from '@/pages/dashboard/Renderer/datasource/utils';
import { getInfluxdbQuery } from '../services';

function Metric(props, ref) {
  const [loading, setLoading] = useState(false);
  const [series, setSeries] = useState([]);

  useImperativeHandle(ref, () => ({
    fetchData: (datasourceCate, datasourceName, values) => {
      const query = values.query;

      const requestParams = {
        cate: datasourceCate,
        cluster: datasourceName,
        query: [
          {
            dbname: query.dbname,
            command: query.command,
            start: moment(parseRange(query.range).start).unix(),
            end: moment(parseRange(query.range).end).unix(),
          },
        ],
      };
      setLoading(true);
      getInfluxdbQuery(requestParams)
        .then((res) => {
          setSeries(
            _.map(res, (item) => {
              return {
                name: getSerieName(item.metric),
                metric: item.metric,
                data: _.sortBy(item.values, (v) => v[0]),
              };
            }),
          );
        })
        .finally(() => {
          setLoading(false);
        });
    },
  }));
  return (
    <>
      {!_.isEmpty(series) ? (
        <Spin spinning={loading}>
          <div
            style={{
              height: 500,
            }}
          >
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
                      displayMode: 'table',
                    },
                    tooltip: {
                      mode: 'all',
                    },
                  },
                } as any
              }
            />
          </div>
        </Spin>
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
    </>
  );
}

export default forwardRef(Metric);
