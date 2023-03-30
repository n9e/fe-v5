import React, { useState, forwardRef, useImperativeHandle } from 'react';
import _ from 'lodash';
import { Spin, Empty, Table } from 'antd';
import { getHistoryText } from '../datasource';

function TimeseriesCpt(props, ref) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  useImperativeHandle(ref, () => ({
    fetchData: (datasourceCate, datasourceName, values) => {
      setLoading(true);
      try {
        getHistoryText({
          datasourceCate,
          datasourceName,
          time: values.query.range,
          targets: [values],
        }).then((res) => {
          setData(
            _.map(res, (item) => {
              return item.metric;
            }),
          );
          setLoading(false);
        });
      } catch (error) {
        setLoading(false);
      }
    },
  }));
  return (
    <>
      {!_.isEmpty(data) ? (
        <Spin spinning={loading}>
          <Table
            className='n9e-plugin-zabbix-builder-text-table'
            size='small'
            dataSource={data}
            columns={[
              {
                title: 'Host',
                dataIndex: 'host',
              },
              {
                title: 'Item',
                dataIndex: 'item',
              },
              {
                title: 'Key',
                dataIndex: 'key_',
              },
              {
                title: 'LastValue',
                dataIndex: 'lastValue',
                ellipsis: true,
              },
            ]}
          />
        </Spin>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      )}
    </>
  );
}

export default forwardRef(TimeseriesCpt);
