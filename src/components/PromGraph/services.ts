import _ from 'lodash';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export const getPromData = (url: string, params, headers) => {
  return request(url, {
    method: RequestMethod.Get,
    params,
    headers,
    silence: true,
  }).then((res) => res.data);
};
