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
}

export default function LogstoreSelect(props: IProps) {
  const { datasourceCate, datasourceName, project } = props;
  const [options, setOptions] = useState<{ label; value }[]>([]);

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

  return (
    <InputGroupWithFormItem
      label={
        <span>
          日志库{' '}
          <Tooltip title=''>
            <QuestionCircleOutlined />
          </Tooltip>
        </span>
      }
      labelWidth={80}
    >
      <Form.Item
        name={['query', 'logstore']}
        rules={[
          {
            required: true,
            message: '请输入日志库',
          },
        ]}
        // validateTrigger='onBlur'
        style={{ width: 190 }}
      >
        <AutoComplete options={options} />
      </Form.Item>
    </InputGroupWithFormItem>
  );
}
