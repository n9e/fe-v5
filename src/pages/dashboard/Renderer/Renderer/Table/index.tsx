import React, { useRef } from 'react';
import _ from 'lodash';
import { Table } from 'antd';
import { Range } from '@/components/DateRangePicker';
import usePrometheus from '../../datasource/usePrometheus';
import { IPanel } from '../../../types';
import { VariableType } from '../../../VariableConfig';
import getCalculatedValuesBySeries from '../../utils/getCalculatedValuesBySeries';
import './style.less';

interface IProps {
  id: string;
  time: Range;
  step: number | null;
  values: IPanel;
  variableConfig?: VariableType;
}

export default function Stat(props: IProps) {
  const eleRef = useRef<HTMLDivElement>(null);
  const { id, values, time, step, variableConfig } = props;
  const { targets, custom, options } = values;
  const { showHeader, calc, aggrDimension } = custom;
  const { series } = usePrometheus({
    id,
    time,
    step,
    targets,
    variableConfig,
  });
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
          return (
            <div className='renderer-table-td-content' style={{ color: text?.color }}>
              {text?.text}
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
