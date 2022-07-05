/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import queryString from 'query-string';

const signals = {};

export const fetchHistory = (params?, signalKey?) => {
  const controller = new AbortController();
  const { signal } = controller;
  if (signalKey && signals[signalKey] && signals[signalKey].abort) {
    signals[signalKey].abort();
  }
  signals[signalKey] = controller;
  return request(`/api/n9e/prometheus/api/v1/query_range`, {
    method: RequestMethod.Post,
    body: queryString.stringify(params),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    signal,
  }).finally(() => {
    delete signals[signalKey];
  });
};

export const fetchAggrGroups = (params?) => {
  return request(`/api/n9e/prometheus/api/v1/labels`, {
    method: RequestMethod.Get,
    params,
    paramsSerializer: function (params) {
      return queryString.stringify(params, { arrayFormat: 'bracket' });
    },
  });
};
