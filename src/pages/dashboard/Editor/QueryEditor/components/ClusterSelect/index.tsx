import React, { useState, useEffect } from 'react';
import { Form, Select } from 'antd';
import { getCommonESClusters, getCommonClusters } from '@/services/common';

export default function index(props: { cate: string }) {
  const { cate } = props;
  const [clusterList, setClusterList] = useState([]);

  useEffect(() => {
    if (cate === 'elasticsearch') {
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
      name='datasourceName'
      rules={[
        {
          required: true,
        },
      ]}
      noStyle
    >
      <Select placeholder='选择集群' style={{ minWidth: 70 }} dropdownMatchSelectWidth={false}>
        {clusterList?.map((item) => (
          <Select.Option value={item} key={item}>
            {item}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
}
