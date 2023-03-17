import React, { useState, forwardRef, useImperativeHandle } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Spin, Empty } from 'antd';
import { dsQuery } from './services';
import { parseRange } from '@/components/TimeRangePicker';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import { getSerieName } from '@/pages/dashboard/Renderer/datasource/utils';
import AdvancedSettings from './AdvancedSettings';
import { useTranslation } from 'react-i18next';

function Metric(props, ref) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [series, setSeries] = useState([]);
  useImperativeHandle(ref, () => ({
    fetchData: (datasourceCate, datasourceName, values) => {
      const query = values.query;

      if (query.keys.labelKey) {
        query.keys.labelKey = _.join(query.keys.labelKey, ' ');
      }

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
            keys: query.keys,
          },
        ],
      };
      setLoading(true);
      dsQuery(requestParams)
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
      <AdvancedSettings />
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
