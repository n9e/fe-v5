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
import React from 'react';
import _ from 'lodash';
import Timeseries from './Timeseries';
import Stat from './Stat';
import Table from './Table';
import Pie from './Pie';

export default function index({ type, targets }) {
  const OptionsCptMap = {
    timeseries: <Timeseries />,
    stat: <Stat />,
    table: <Table targets={targets} />,
    pie: <Pie />,
  };
  return OptionsCptMap[type] || `无效的图表类型 ${type}`;
}
