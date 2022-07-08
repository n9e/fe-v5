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
import { Pie, PieConfig } from '@ant-design/plots';

type Marker = {
  symbol?: string;
  spacing?: number;
};

interface ListItem extends DataType {
  marker?: Marker | string;
}

type DataType = {
  name: string;
  value: number;
};
interface Props {
  data: DataType[];
  positon: 'top' | 'left' | 'right' | 'bottom';
  hidden: boolean;
  labelWithName: boolean;
  themeMode?: 'dark';
}

const DemoPie = (props: Props) => {
  const { data, positon, hidden, labelWithName, themeMode } = props;

  const config: PieConfig = {
    padding: [16, 8, 16, 8],
    appendPadding: 10,
    data,
    angleField: 'value',
    colorField: 'name',
    radius: 0.9,
    label: {
      type: 'spider',
      content: (record) => {
        return `${labelWithName ? `${record.name}: ` : ''}${(record.percent * 100).toFixed(0)}%`;
      },
      style: {
        fontSize: 12,
        textAlign: 'center',
        fillStyle: themeMode === 'dark' ? '#fff' : '#333',
      },
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
    tooltip: {
      fields: ['name', 'value'],
      formatter: (datum) => {
        return { name: datum.name, value: `${datum.value.toFixed(3)}` };
      },
    },
    legend: hidden
      ? false
      : {
          position: positon,
        },
  };
  return <Pie {...config} />;
};

export default DemoPie;
