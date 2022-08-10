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
import React, { useRef, useContext, useEffect } from 'react';
import _ from 'lodash';
import { Table } from 'antd';
import { useSize } from 'ahooks';
import { IPanel } from '../../../types';
import getCalculatedValuesBySeries, { getSerieTextObj } from '../../utils/getCalculatedValuesBySeries';
import getOverridePropertiesByName from '../../utils/getOverridePropertiesByName';
import localeCompare from '../../utils/localeCompare';
import formatToTable from '../../utils/formatToTable';
import { Context } from '../../../Context';
import './style.less';

interface IProps {
  values: IPanel;
  series: any[];
  themeMode?: 'dark';
}

const getColumnsKeys = (data: any[]) => {
  const keys = _.reduce(
    data,
    (result, item) => {
      return _.union(result, _.keys(item.metric));
    },
    [],
  );
  return _.uniq(keys);
};
const getSortOrder = (key, sortObj) => {
  return sortObj.sortColumn === key ? sortObj.sortOrder : false;
};

export default function Stat(props: IProps) {
  const eleRef = useRef<HTMLDivElement>(null);
  const size = useSize(eleRef);
  const { dispatch } = useContext(Context);
  const { values, series, themeMode } = props;
  const { custom, options, overrides } = values;
  const { showHeader, calc, aggrDimension, displayMode, columns, sortColumn, sortOrder, colorMode = 'value' } = custom;
  const [calculatedValues, setCalculatedValues] = React.useState([]);
  const [sortObj, setSortObj] = React.useState({
    sortColumn,
    sortOrder,
  });

  useEffect(() => {
    setSortObj({
      sortColumn,
      sortOrder,
    });
  }, [sortColumn, sortOrder]);

  useEffect(() => {
    const data = getCalculatedValuesBySeries(
      series,
      calc,
      {
        unit: options?.standardOptions?.util,
        decimals: options?.standardOptions?.decimals,
      },
      options?.valueMappings,
    );
    if (dispatch) {
      dispatch({
        type: 'updateMetric',
        payload: getColumnsKeys(data),
      });
    }
    setCalculatedValues(data);
  }, [JSON.stringify(series), calc, JSON.stringify(options)]);

  let tableDataSource = calculatedValues;
  let tableColumns: any[] = [
    {
      title: 'name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => {
        return localeCompare(a.name, b.name);
      },
      sortOrder: getSortOrder('name', sortObj),
      render: (text) => <div className='renderer-table-td-content'>{text}</div>,
    },
    {
      title: 'value',
      dataIndex: 'text',
      key: 'text',
      sorter: (a, b) => {
        return a.stat - b.stat;
      },
      sortOrder: getSortOrder('value', sortObj),
      className: 'renderer-table-td-content-value-container',
      render: (text, record) => {
        let textObj = {
          value: text,
          unit: '',
          color: record.color || (themeMode === 'dark' ? '#fff' : '#000'),
        };
        const overrideProps = getOverridePropertiesByName(overrides, record.fields.refId);
        if (!_.isEmpty(overrideProps)) {
          textObj = getSerieTextObj(record?.stat, overrideProps?.standardOptions, overrideProps?.valueMappings);
        }
        return (
          <div
            className='renderer-table-td-content'
            style={{
              color: colorMode === 'background' ? '#fff' : textObj?.color,
              backgroundColor: colorMode === 'background' ? textObj.color : 'unset',
            }}
          >
            {textObj.value}
            {textObj.unit}
          </div>
        );
      },
    },
  ];

  if (displayMode === 'labelsOfSeriesToRows') {
    const columnsKeys = _.isEmpty(columns) ? _.concat(getColumnsKeys(calculatedValues), 'value') : columns;
    tableColumns = _.map(columnsKeys, (key) => {
      return {
        title: key,
        dataIndex: key,
        key: key,
        sorter: (a, b) => {
          if (key === 'value') {
            return a.stat - b.stat;
          }
          return localeCompare(a.name, b.name);
        },
        sortOrder: getSortOrder(key, sortObj),
        className: key === 'value' ? 'renderer-table-td-content-value-container' : '',
        render: (_text, record) => {
          if (key === 'value') {
            const textObj = {
              value: record?.value,
              unit: record?.unit,
              color: record.color || (themeMode === 'dark' ? '#fff' : '#000'),
            };
            return (
              <div
                className='renderer-table-td-content'
                style={{
                  color: colorMode === 'background' ? '#fff' : textObj?.color,
                  backgroundColor: colorMode === 'background' ? textObj.color : 'unset',
                }}
              >
                {textObj?.value}
                {textObj?.unit}
              </div>
            );
          }
          return _.get(record.metric, key);
        },
      };
    });
  }

  if (displayMode === 'labelValuesToRows' && aggrDimension) {
    tableDataSource = formatToTable(calculatedValues, aggrDimension, 'refId');
    const groupNames = _.reduce(
      tableDataSource,
      (pre, item) => {
        return _.union(_.concat(pre, item.groupNames));
      },
      [],
    );
    tableColumns = [
      {
        title: aggrDimension,
        dataIndex: aggrDimension,
        key: aggrDimension,
        sorter: (a, b) => {
          return localeCompare(a[aggrDimension], b[aggrDimension]);
        },
        sortOrder: getSortOrder(aggrDimension, sortObj),
        render: (text) => <div className='renderer-table-td-content'>{text}</div>,
      },
    ];
    _.map(groupNames, (name) => {
      const result = _.find(tableDataSource, (item) => {
        return item[name];
      });
      tableColumns.push({
        title: result[name]?.name,
        dataIndex: name,
        key: name,
        sorter: (a, b) => {
          return _.get(a[name], 'stat') - _.get(b[name], 'stat');
        },
        sortOrder: getSortOrder('value', sortObj),
        className: 'renderer-table-td-content-value-container',
        render: (text) => {
          let textObj = {
            value: text?.text,
            unit: '',
            color: text.color || (themeMode === 'dark' ? '#fff' : '#000'),
          };
          const overrideProps = getOverridePropertiesByName(overrides, name);
          if (!_.isEmpty(overrideProps)) {
            textObj = getSerieTextObj(text?.stat, overrideProps?.standardOptions, overrideProps?.valueMappings);
          }
          return (
            <div
              className='renderer-table-td-content'
              style={{
                color: colorMode === 'background' ? '#fff' : textObj?.color,
                backgroundColor: colorMode === 'background' ? textObj.color : 'unset',
              }}
            >
              {textObj?.value}
              {textObj?.unit}
            </div>
          );
        },
      });
    });
  }

  const headerHeight = showHeader ? 40 : 0;
  const height = _.get(size, 'height') - headerHeight;
  const realHeight = isNaN(height) ? 0 : height;

  return (
    <div className='renderer-table-container' ref={eleRef}>
      <div className='renderer-table-container-box'>
        <Table
          rowKey='id'
          getPopupContainer={() => document.body}
          showSorterTooltip={false}
          showHeader={showHeader}
          dataSource={tableDataSource}
          columns={tableColumns}
          scroll={{ y: realHeight }}
          bordered={false}
          pagination={false}
          onChange={(pagination, filters, sorter: any) => {
            setSortObj({
              sortColumn: sorter.columnKey,
              sortOrder: sorter.order,
            });
          }}
        />
      </div>
    </div>
  );
}
