import React, { useState, useEffect } from 'react';
import { Form, AutoComplete } from 'antd';
import _ from 'lodash';
import { getIndices } from '@/services/warning';

export default function IndexSelect({ cate, cluster }) {
  const [options, setOptions] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (cate === 'elasticsearch' && !_.isEmpty(cluster)) {
      getIndices({ cate, cluster: _.join(cluster, ' ') }).then((res) => {
        setOptions(
          _.map(res.dat, (item) => {
            return {
              value: item,
            };
          }),
        );
      });
    }
  }, [cate, _.join(cluster, ' ')]);

  return (
    <Form.Item
      label='索引'
      name={['query', 'index']}
      rules={[
        {
          required: true,
          message: '请输入索引',
        },
      ]}
      validateTrigger='onBlur'
    >
      <AutoComplete
        options={_.filter(options, (item) => {
          if (search) {
            return item.value.includes(search);
          }
          return true;
        })}
        onSearch={(val) => {
          setSearch(val);
        }}
      />
    </Form.Item>
  );
}
