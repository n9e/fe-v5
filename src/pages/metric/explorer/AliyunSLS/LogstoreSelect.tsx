import React, { useEffect, useState } from 'react';
import { AutoComplete, Tooltip, Form } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { DatasourceCateEnum } from '@/utils/constant';
import { getSLSLogstore } from '@/services/metric';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

interface IProps {
  datasourceCate: DatasourceCateEnum.aliyunSLS;
  datasourceName: string;
  project?: string;
  prefixName?: string[];
  width?: number | string;
  layout?: 'horizontal' | 'vertical';
}

export default function LogstoreSelect(props: IProps) {
  const { datasourceCate, datasourceName, project, prefixName = [], width = 190, layout = 'horizontal' } = props;
  const [options, setOptions] = useState<{ label; value }[]>([]);
  const label = (
    <span>
      日志库{' '}
      <Tooltip title=''>
        <QuestionCircleOutlined />
      </Tooltip>
    </span>
  );

  useEffect(() => {
    if (datasourceName && project) {
      getSLSLogstore({
        cate: datasourceCate,
        cluster: datasourceName,
        project,
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
  }, [datasourceName, project]);

  if (layout === 'vertical') {
    return (
      <Form.Item
        label={label}
        name={[...prefixName, 'query', 'logstore']}
        rules={[
          {
            required: true,
            message: '请输入日志库',
          },
        ]}
        style={{ width }}
      >
        <AutoComplete options={options} />
      </Form.Item>
    );
  }

  return (
    <InputGroupWithFormItem label={label} labelWidth={80}>
      <Form.Item
        name={[...prefixName, 'query', 'logstore']}
        rules={[
          {
            required: true,
            message: '请输入日志库',
          },
        ]}
        style={{ width }}
      >
        <AutoComplete options={options} />
      </Form.Item>
    </InputGroupWithFormItem>
  );
}
