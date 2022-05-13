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

export default function Stat(props: IProps) {
  const eleRef = useRef<HTMLDivElement>(null);
  const { dispatch } = useContext(Context);
  const { values, series } = props;
  const { custom, options, overrides } = values;
  const { showHeader, calc, aggrDimension, displayMode, columns } = custom;
  const [calculatedValues, setCalculatedValues] = React.useState([]);

  useEffect(() => {
    const data = getCalculatedValuesBySeries(
      series,
      calc,
      {
        util: options?.standardOptions?.util,
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
      render: (text) => <div className='renderer-table-td-content'>{text}</div>,
    },
    {
      title: 'value',
      dataIndex: 'text',
      key: 'text',
      sorter: (a, b) => {
        return a.stat - b.stat;
      },
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
        render: (_text, record) => {
          if (key === 'value') {
            return _.get(record, 'text');
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
        <Table
          rowKey='id'
          getPopupContainer={() => document.body}
          showSorterTooltip={false}
          showHeader={showHeader}
          dataSource={tableDataSource}
          columns={tableColumns}
          scroll={{ y: height }}
          bordered={false}
          pagination={false}
        />
      </div>
    </div>
  );
}
