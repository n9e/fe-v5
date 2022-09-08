import React, { useState, useEffect } from 'react';
import { Form, Select } from 'antd';
import { getCommonESClusters } from '@/services/common';

export default function index() {
  const [clusterList, setClusterList] = useState([]);

  useEffect(() => {
    getCommonESClusters()
      .then(({ dat }) => {
        setClusterList(dat);
      })
      .catch(() => {
        setClusterList([]);
      });
  }, []);

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
