import React, { useState, useEffect } from 'react';
import { Form, Select } from 'antd';
import _ from 'lodash';
import { CaretDownOutlined } from '@ant-design/icons';
import { getCommonClusters, getCommonESClusters, getCommonSLSClusters } from '@/services/common';
export const ClusterAll = '$all';

export default function index({ form, cate }) {
  const [clusterList, setClusterList] = useState<string[]>([]);
  const handleClusterChange = (v: string[]) => {
    if (v.includes(ClusterAll)) {
      form.setFieldsValue({ cluster: [ClusterAll] });
    }
  };

  useEffect(() => {
    if (cate === 'elasticsearch') {
      getCommonESClusters()
        .then(({ dat }) => {
          setClusterList(dat);
        })
        .catch(() => {
          setClusterList([]);
        });
    }
    if (cate === 'aliyun-sls') {
      getCommonSLSClusters()
        .then(({ dat }) => {
          setClusterList(dat);
        })
        .catch(() => {
          setClusterList([]);
        });
    }
    if (cate === 'prometheus') {
      getCommonClusters()
        .then(({ dat }) => {
          setClusterList(_.concat(['$all'], dat));
        })
        .catch(() => {
          setClusterList([]);
        });
    }
  }, [cate]);

  return (
    <Form.Item
      label='生效集群'
      name='cluster'
      rules={[
        {
          required: true,
          message: '生效集群不能为空',
        },
      ]}
    >
      <Select suffixIcon={<CaretDownOutlined />} mode='multiple' onChange={handleClusterChange}>
        {clusterList?.map((item) => (
          <Select.Option value={item} key={item}>
            {item}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
}
