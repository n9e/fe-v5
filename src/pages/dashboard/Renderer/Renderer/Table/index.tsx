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
import React, { useRef } from 'react';
import _ from 'lodash';
import { Table } from 'antd';
import { IPanel } from '../../../types';
import getCalculatedValuesBySeries, { getSerieTextObj } from '../../utils/getCalculatedValuesBySeries';
import getOverridePropertiesByName from '../../utils/getOverridePropertiesByName';
import formatToTable from '../../utils/formatToTable';
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
  );
  let tableDataSource = calculatedValues;
  let columns: any[] = [
    {
      title: 'name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <div className='renderer-table-td-content'>{text}</div>,
    },
    {
      title: 'value',
      dataIndex: 'text',
      key: 'text',
      render: (text, record) => {
        let textObj = {
          text,
          color: record.color,
        };
        const overrideProps = getOverridePropertiesByName(overrides, record.fields.refId);
        if (!_.isEmpty(overrideProps)) {
          textObj = getSerieTextObj(record?.stat, overrideProps?.standardOptions, overrideProps?.valueMappings);
        }
        return (
          <div className='renderer-table-td-content' style={{ color: textObj.color }}>
            {textObj.text}
          </div>
        );
      },
    },
  ];

  if (aggrDimension) {
    tableDataSource = formatToTable(calculatedValues, aggrDimension, 'refId');
    const groupNames = _.reduce(
      tableDataSource,
      (pre, item) => {
        return _.union(_.concat(pre, item.groupNames));
      },
      [],
    );
    columns = [
      {
        title: aggrDimension,
        dataIndex: aggrDimension,
        key: aggrDimension,
        render: (text) => <div className='renderer-table-td-content'>{text}</div>,
      },
    ];
    _.map(groupNames, (name) => {
      const result = _.find(tableDataSource, (item) => {
        return item[name];
      });
      columns.push({
        title: result[name]?.name,
        dataIndex: name,
        key: name,
        render: (text) => {
          let textObj = {
            text: text?.text,
            color: text?.color,
          };
          const overrideProps = getOverridePropertiesByName(overrides, name);
          if (!_.isEmpty(overrideProps)) {
            textObj = getSerieTextObj(text?.stat, overrideProps?.standardOptions, overrideProps?.valueMappings);
          }
          return (
            <div className='renderer-table-td-content' style={{ color: textObj?.color }}>
              {textObj?.text}
            </div>
          );
        },
      });
    });
  }

  const headerHeight = showHeader ? 40 : 0;
  const height = eleRef?.current?.clientHeight! - headerHeight;

  return (
    <div className='renderer-table-container' ref={eleRef}>
      <div className='renderer-table-container-box'>
        <Table rowKey='id' showHeader={showHeader} dataSource={tableDataSource} columns={columns} scroll={{ y: height }} bordered={false} pagination={false} />
      </div>
    </div>
  );
}
