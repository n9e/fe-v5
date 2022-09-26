import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import PageLayout from '@/components/pageLayout';
import { sourceLogoMap } from '@/components/DataSource/TimeSeriesSource/config';
import { getDataSourcePluginList } from '@/components/DataSource/TimeSeriesSource/services';
import SourceCards from '@/components/DataSource/components/SourceCards';
import TableSource from '@/components/DataSource/components/TableSource';
import Detail from './Detail';

export default function index() {
  const [pluginList, setPluginList] = useState();
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState();

  useEffect(() => {
    getDataSourcePluginList({ p: 1, limit: 100 }).then((res) => {
      setPluginList(
        _.map(res, (item) => {
          return {
            name: item.type_name,
            category: item.category,
            type: item.type,
            logo: sourceLogoMap[item.type],
          };
        }),
      );
    });
  }, []);

  return (
    <PageLayout title='数据源管理'>
      <div className='srm'>
        <SourceCards sourceMap={pluginList} urlPrefix='help/source' />
        <div className='page-title'>已接入的数据源</div>
        {pluginList && (
          <TableSource
            pluginList={pluginList}
            nameClick={(record) => {
              setDetailVisible(true);
              setDetailData(record);
            }}
          />
        )}
        {detailVisible && (
          <Detail
            visible={detailVisible}
            data={detailData}
            onClose={() => {
              setDetailVisible(false);
            }}
          />
        )}
      </div>
    </PageLayout>
  );
}
