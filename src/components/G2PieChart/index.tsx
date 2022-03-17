import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Pie, PieConfig, Options } from '@ant-design/plots';

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
}

const DemoPie = (props: Props) => {
  const { data, positon, hidden } = props;

  const config: PieConfig = {
    padding: [16, 8, 16, 8],
    appendPadding: 10,
    data,
    // autoFit: true,
    angleField: 'value',
    colorField: 'name',
    radius: 0.9,
    label: {
      type: 'spider',
      // offset: '-30%',
      content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
      style: {
        fontSize: 14,
        textAlign: 'center',
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
        // console.log(datum);
        return { name: datum.name, value: `${datum.value.toFixed(3)}` };
      },
      // customContent: (title, data) => {
      //   console.log(title, data);
      //   return `<div style="color: green">${title}</div>`;
      // },
    },
    legend: hidden
      ? false
      : {
          position: positon,
          // itemName: {
          //   formatter(text: string, item: ListItem, index: number) {
          //     // console.log(text, item, index);
          //     return text;
          //   },
          // },
        },
  };
  return <Pie {...config} />;
};

export default DemoPie;
