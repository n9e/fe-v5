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
  prefixName?: string[];
}

export default function ProjectSelect(props: IProps) {
  const { datasourceCate, datasourceName, prefixName = [] } = props;
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
      <Form.Item
        name={[...prefixName, 'query', 'project']}
        rules={[
          {
            required: true,
            message: '请输入项目',
          },
        ]}
        // validateTrigger='onBlur'
        style={{ width: 180 }}
      >
        <AutoComplete options={options} />
      </Form.Item>
    </InputGroupWithFormItem>
  );
}
