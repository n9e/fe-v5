import React, { useState, useEffect } from 'react';
import { Form, Select } from 'antd';
import { getCommonESClusters, getCommonClusters } from '@/services/common';

export default function index(props: { cate: string; defaultDatasourceName?: string; name?: string | string[]; label?: React.ReactNode }) {
  const { cate, defaultDatasourceName, name = 'datasourceName', label } = props;
  const [clusterList, setClusterList] = useState([]);

  useEffect(() => {
    if (cate === 'elasticsearch' || cate === 'elasticsearch-log') {
      getCommonESClusters()
        .then(({ dat }) => {
          setClusterList(dat);
        })
        .catch(() => {
          setClusterList([]);
        });
    } else {
      getCommonClusters()
        .then(({ dat }) => {
          setClusterList(dat);
        })
        .catch(() => {
          setClusterList([]);
        });
    }
  }, [cate]);

  return (
    <Form.Item
      label={label}
      name={name}
      rules={[
        {
          required: cate !== 'prometheus',
          message: '请选择数据源',
        },
      ]}
    >
      <Select placeholder={cate !== 'prometheus' ? '选择数据源' : defaultDatasourceName} style={{ minWidth: 70 }} dropdownMatchSelectWidth={false}>
        {clusterList?.map((item) => (
          <Select.Option value={item} key={item}>
            {item}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
}
