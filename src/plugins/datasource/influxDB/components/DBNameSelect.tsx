import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import _ from 'lodash';
import { getInfluxdbDBs } from '../services';

interface IProps {
  datasourceName: string;
  datasourceCate: string;
  value?: string;
  onChange?: (value: string) => void;
}

export default function DBNameSelect(props: IProps) {
  const { datasourceName, datasourceCate, value, onChange } = props;
  const [dbnames, setDbnames] = useState<string[]>([]);

  useEffect(() => {
    if (datasourceName) {
      getInfluxdbDBs({
        cate: datasourceCate,
        cluster: datasourceName,
      }).then((res) => {
        setDbnames(res || []);
      });
    }
  }, [datasourceName]);

  return (
    <Select
      value={value}
      onChange={(val) => {
        onChange && onChange(val);
      }}
    >
      {_.map(dbnames, (dbname) => {
        return (
          <Select.Option key={dbname} value={dbname}>
            {dbname}
          </Select.Option>
        );
      })}
    </Select>
  );
}
