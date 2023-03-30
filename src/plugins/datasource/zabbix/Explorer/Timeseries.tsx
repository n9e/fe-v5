import React, { useState, forwardRef, useImperativeHandle } from 'react';
import _ from 'lodash';
import { Spin, Empty } from 'antd';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import { getHistory, getHistoryByIDs } from '../datasource';

function TimeseriesCpt(props, ref) {
  const [loading, setLoading] = useState(false);
  const [series, setSeries] = useState<any[]>([]);

  useImperativeHandle(ref, () => ({
    fetchData: (datasourceCate, datasourceName, values) => {
      setLoading(true);
      try {
        const fetchFunc = values.query.itemids ? getHistoryByIDs : getHistory;
        fetchFunc({
          datasourceCate,
          datasourceName,
          time: values.query.range,
          targets: [values],
        }).then((res) => {
          setSeries(res);
          setLoading(false);
        });
      } catch (error) {
        setLoading(false);
      }
    },
  }));
  return (
    <>
      {!_.isEmpty(series) ? (
        <Spin spinning={loading}>
          <div
            style={{
              height: 350,
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

export default forwardRef(TimeseriesCpt);
