import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { sourceLogoMap } from '@/components/DataSource/TimeSeriesSource/config';
import { getDataSourcePluginList } from '@/components/DataSource/TimeSeriesSource/services';
import SourceCards from '@/components/DataSource/components/SourceCards';

import { DataSourceType } from '@/components/DataSource/TimeSeriesSource/types';
import TableSource from '@/components/DataSource/components/TableSource';
import TimeSeriesDetail from '@/components/DataSource/TimeSeriesSource/Detail';

export default function index() {
  const [pluginList, setPluginList] = useState();
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<DataSourceType>();

  useEffect(() => {
    getDataSourcePluginList({ p: 1, limit: 100, category: 'timeseries' }).then((res) => {
      setPluginList(
        _.map(res, (item) => {
          return {
            name: item.type_name,
            type: item.type,
            logo: sourceLogoMap[item.type],
          };
        }),
      );
    });
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <span className='second-color'>添加的数据源可被用于 </span>
        <Link to='/polaris' className='theme-color'>
          北极星系统
        </Link>
        {'、 '}
        <Link to='/firemap' className='theme-color'>
          灭火图
        </Link>
      </div>

      <SourceCards sourceMap={pluginList} />
      <div className='page-title'>已接入的数据源</div>
      {visible && (
        <TimeSeriesDetail
          data={data!}
          visible={visible}
          onClose={() => {
            setVisible(false);
          }}
        />
      )}

      {pluginList && (
        <TableSource
          pluginList={pluginList}
          category='timeseries'
          nameClick={(record) => {
            setData(record);
            setVisible(true);
          }}
        />
      )}
    </div>
  );
}
