import _ from 'lodash';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

/**
 * getPromData(
      'api/v1/query_range',
      {
        query,
        start: moment(parsedRange.start).unix(),
        end: moment(parsedRange.end).unix(),
        step: 30,
      },
      { 'X-Data-Source-Id': dataSourceId },
    )
 */
export const getPromData = (url: string, params, headers) => {
  return request(`/api/v1/datasource/prometheus${url}`, {
    method: RequestMethod.Get,
    params,
    headers,
    silence: true,
  }).then((res) => res.data);
};
