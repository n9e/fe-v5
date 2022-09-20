import React, { useState, useEffect } from 'react';
import { Form, AutoComplete } from 'antd';
import _ from 'lodash';
import { getIndices } from '@/services/warning';

export default function IndexSelect({ prefixField = {}, prefixName = [], cate, cluster }: any) {
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
      tooltip={
        <div>
          支持多种配置方式
          <br />
          1. 指定单个索引 gb 在 gb 索引中搜索所有的文档
          <br />
          2. 指定多个索引 gb,us 在 gb 和 us 索引中搜索所有的文档
          <br />
          3. 指定索引前缀 g*,u* 在任何以 g 或者 u 开头的索引中搜索所有的文档
          <br />
        </div>
      }
      {...prefixField}
      name={[...prefixName, 'query', 'index']}
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
