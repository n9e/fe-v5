import React, { useRef } from 'react';
import _ from 'lodash';
import { Table } from 'antd';
import { IPanel } from '../../../types';
import getCalculatedValuesBySeries, { getSerieTextObj } from '../../utils/getCalculatedValuesBySeries';
import getOverridePropertiesByName from '../../utils/getOverridePropertiesByName';
import './style.less';

interface IProps {
  values: IPanel;
  series: any[];
}

export default function Stat(props: IProps) {
  const eleRef = useRef<HTMLDivElement>(null);
  const { values, series } = props;
  const { custom, options, overrides } = values;
  const { showHeader, calc, aggrDimension } = custom;
  const calculatedValues = getCalculatedValuesBySeries(
    series,
    calc,
    {
      util: options?.standardOptions?.util,
      decimals: options?.standardOptions?.decimals,
    },
    options?.valueMappings,
    aggrDimension,
  );
  const firstItem = _.first(calculatedValues);
  const columns: any[] = [
    {
      title: 'name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <div className='renderer-table-td-content'>{text}</div>,
    },
  ];

  if (aggrDimension) {
    _.map(firstItem?.groupNames, (name) => {
      columns.push({
        title: name,
        dataIndex: name,
        key: name,
        render: (text) => {
          const overrideProps = getOverridePropertiesByName(overrides, name);
          const obj = getSerieTextObj(text?.stat, overrideProps?.standardOptions, overrideProps?.valueMappings);
          return (
            <div className='renderer-table-td-content' style={{ color: obj?.color }}>
              {obj?.text}
            </div>
          );
        },
      });
    });
  } else {
    columns.push({
      title: 'value',
      dataIndex: 'text',
      key: 'text',
      render: (text, record) => {
        return (
          <div className='renderer-table-td-content' style={{ color: record.color }}>
            {text}
          </div>
        );
      },
    });
  }

  const headerHeight = showHeader ? 40 : 0;
  const height = eleRef?.current?.clientHeight! - headerHeight;

  return (
    <div className='renderer-table-container' ref={eleRef}>
      <div className='renderer-table-container-box'>
        <Table rowKey='id' showHeader={showHeader} dataSource={calculatedValues} columns={columns} scroll={{ y: height }} bordered={false} pagination={false} />
      </div>
    </div>
  );
}
