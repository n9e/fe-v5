import React, { useEffect, useState } from 'react';
import { AutoComplete, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { DatasourceCateEnum } from '@/utils/constant';
import { getSLSProject } from '@/services/metric';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

interface IProps {
  datasourceCate: DatasourceCateEnum.aliyunSLS;
  datasourceName: string;
  onChange: (value: string) => void;
}

export default function ProjectSelect(props: IProps) {
  const { datasourceCate, datasourceName, onChange } = props;
  const [value, setValue] = useState('');
  const [options, setOptions] = useState<{ label; value }[]>([]);

  useEffect(() => {
    if (datasourceName) {
      getSLSProject({
        cate: datasourceCate,
        cluster: datasourceName,
      }).then((res) => {
        setOptions(
          _.map(res, (item) => {
            return {
              label: item,
              value: item,
            };
          }),
        );
      });
    }
  }, [datasourceName]);

  return (
    <InputGroupWithFormItem
      label={
        <span>
          项目{' '}
          <Tooltip title=''>
            <QuestionCircleOutlined />
          </Tooltip>
        </span>
      }
      labelWidth={70}
    >
      <AutoComplete
        options={options}
        style={{ width: 180 }} // 只是为了跟下面搜索框对齐
        value={value}
        onChange={(val) => {
          setValue(val);
          onChange(val);
        }}
      />
    </InputGroupWithFormItem>
  );
}
