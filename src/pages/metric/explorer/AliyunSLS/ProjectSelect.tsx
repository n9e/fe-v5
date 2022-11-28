import React, { useEffect, useState } from 'react';
import { AutoComplete, Tooltip, Form } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { DatasourceCateEnum } from '@/utils/constant';
import { getSLSProject } from '@/services/metric';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

interface IProps {
  datasourceCate: DatasourceCateEnum.aliyunSLS;
  datasourceName: string;
  prefixField?: any;
  prefixName?: (string | number)[];
  width?: number | string;
  layout?: 'horizontal' | 'vertical';
}

export default function ProjectSelect(props: IProps) {
  const { datasourceCate, datasourceName, prefixField = {}, prefixName = [], width = 180, layout = 'horizontal' } = props;
  const [options, setOptions] = useState<{ label; value }[]>([]);
  const label = (
    <span>
      项目{' '}
      <Tooltip title=''>
        <QuestionCircleOutlined />
      </Tooltip>
    </span>
  );

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

  if (layout === 'vertical') {
    return (
      <Form.Item
        {...prefixField}
        label={label}
        name={[...prefixName, 'project']}
        rules={[
          {
            required: true,
            message: '请输入项目',
          },
        ]}
        style={{ width }}
      >
        <AutoComplete options={options} />
      </Form.Item>
    );
  }
  return (
    <InputGroupWithFormItem label={label} labelWidth={70}>
      <Form.Item
        {...prefixField}
        name={[...prefixName, 'project']}
        rules={[
          {
            required: true,
            message: '请输入项目',
          },
        ]}
        style={{ width }}
      >
        <AutoComplete options={options} />
      </Form.Item>
    </InputGroupWithFormItem>
  );
}
