import React, { useState, useEffect } from 'react';
import { Form, Select } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import { getCommonClusters, getCommonESClusters } from '@/services/common';

export default function index({ cate, onClusterChange }) {
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
    <Select
      suffixIcon={<CaretDownOutlined />}
      mode='multiple'
      onChange={onClusterChange}
      placeholder='集群'
      style={{ minWidth: 80, marginLeft: 8 }}
      dropdownMatchSelectWidth={false}
    >
      {clusterList?.map((item) => (
        <Select.Option value={item} key={item}>
          {item}
        </Select.Option>
      ))}
    </Select>
  );
}
