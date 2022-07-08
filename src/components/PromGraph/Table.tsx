import React, { useEffect, useState } from 'react';
import moment from 'moment';
import _ from 'lodash';
import { Input, DatePicker, List } from 'antd';
import { getPromData } from './services';
import { QueryStats } from './QueryStatsView';

interface IProps {
  datasourceId: number;
  promql?: string;
  setQueryStats: (stats: QueryStats) => void;
  setErrorContent: (content: string) => void;
  contentMaxHeight: number;
  timestamp?: number;
  setTimestamp: (timestamp?: number) => void;
}
type ResultType = 'matrix' | 'vector' | 'scalar' | 'string';

const LIMIT = 10000;
function getListItemLabel(resultType, record) {
  const { metric } = record;
  if (resultType === 'scalar') return 'scalar';
  if (resultType === 'string') return 'string';
  const metricName = metric?.__name__;
  const labels = _.keys(metric)
    .filter((ml) => ml !== '__name__')
    .map((label, i, labels) => (
      <span key={i}>
        <strong>{label}</strong>="{metric[label]}"{i === labels.length - 1 ? '' : ', '}
      </span>
    ));
  return (
    <>
      {metricName}
      {'{'}
      {labels}
      {'}'}
    </>
  );
}
function getListItemValue(resultType, record) {
  if (resultType === 'scalar' || resultType === 'string') return _.get(record, '[1]') || '-';
  if (resultType === 'vector') {
    return _.get(record, 'value[1]', '-');
  }
  if (resultType === 'matrix') {
    return _.map(_.get(record, 'values'), (value, i) => {
      return (
        <div key={i}>
          {_.get(value, '[1]', '-')} @{_.get(value, '[0]', '-')}
        </div>
      );
    });
  }
}

export default function Table(props: IProps) {
  const { datasourceId, promql, setQueryStats, setErrorContent, contentMaxHeight, timestamp, setTimestamp } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<{
    resultType: ResultType;
    result: any[];
  }>({
    resultType: 'matrix',
    result: [],
  });

  useEffect(() => {
    if (datasourceId && promql && timestamp) {
      const queryStart = Date.now();
      setIsLoading(true);
      getPromData(
        '/api/v1/query',
        {
          time: timestamp,
          query: promql,
        },
        {
          'X-Data-Source-Id': datasourceId,
        },
      )
        .then((res) => {
          const { resultType } = res;
          let { result } = res;
          let tooLong = false;
          let maxLength = 0;
          if (result) {
            if (result.length > LIMIT) {
              tooLong = true;
              maxLength = result.length;
              result = result.slice(LIMIT);
            }
            result.forEach((item) => {
              if (item.values && item.values.length > LIMIT) {
                tooLong = true;
                if (item.values.length > maxLength) {
                  maxLength = item.values.length;
                }
                item.values = item.values.slice(LIMIT);
              }
            });
          }
          if (tooLong) {
            setErrorContent(`Warning：Fetched ${maxLength} metrics, only displaying first ${LIMIT}`);
          } else {
            setErrorContent('');
          }
          if (resultType === 'scalar' || resultType === 'string') {
            setData({ resultType, result: [result] });
          } else {
            setData({ resultType, result });
          }
          setQueryStats({
            loadTime: Date.now() - queryStart,
            resultSeries: result.length,
          });
        })
        .catch((err) => {
          const msg = _.get(err, 'data.error');
          setErrorContent(`Error executing query: ${msg}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [timestamp, datasourceId, promql]);

  return (
    <div className='prom-graph-table-container'>
      <div className='prom-graph-table-controls'>
        <Input.Group>
          <span className='ant-input-group-addon'>Time</span>
          <DatePicker
            value={timestamp ? moment.unix(timestamp) : undefined}
            onChange={(val) => {
              setTimestamp(val ? val.unix() : undefined);
            }}
            showTime
            placeholder='Evaluation time'
            getPopupContainer={() => document.body}
            disabledDate={(current) => current > moment()}
          />
        </Input.Group>
      </div>
      <List
        className='prom-graph-table-list'
        style={{
          maxHeight: contentMaxHeight,
        }}
        size='small'
        loading={isLoading}
        // bordered
        dataSource={data ? data.result : []}
        renderItem={(item) => {
          return (
            <List.Item>
              <div>{getListItemLabel(data?.resultType, item)}</div>
              <div>{getListItemValue(data?.resultType, item)}</div>
            </List.Item>
          );
        }}
      />
    </div>
  );
}
