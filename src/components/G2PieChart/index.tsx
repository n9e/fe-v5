import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Pie, PieConfig } from '@ant-design/plots';
console.log(Pie);

type Marker = {
  symbol?: string;
  spacing?: number;
};

type ListItem = {
  /**
   * 名称 {string}
   */
  name: string;
  /**
   * 值 {any}
   */
  value: any;
  /**
   * 图形标记 {object|string}
   */
  marker?: Marker | string;
};

const DemoPie = () => {
  const data = [
    {
      type: '分类一',
      value: 27,
      num: 123,
    },
    {
      type: '分类二',
      value: 25,
      num: 234,
    },
    {
      type: '分类三',
      value: 18,
    },
    {
      type: '分类四',
      value: 15,
    },
    {
      type: '分类五',
      value: 10,
    },
    {
      type: '其他',
      value: 5,
    },
  ];
  const config: PieConfig = {
    padding: [16, 8, 16, 8],
    appendPadding: 10,
    data,
    angleField: 'value',
    colorField: 'type',
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
      fields: ['num', 'type', 'value'],
      formatter: (datum) => {
        // console.log(datum);
        return { name: datum.type, value: datum.num + '%' };
      },
      customContent: (title, data) => {
        // console.log(title, data);
        return `<div style="color: green">${title}</div>`;
      },
    },
    legend: {
      itemName: {
        formatter(text: string, item: ListItem, index: number) {
          console.log(text, item, index);
          return text + 123;
        },
      },
    },
  };
  return <Pie {...config} />;
};

export default DemoPie;
