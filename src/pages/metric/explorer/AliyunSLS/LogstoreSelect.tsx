import React, { useEffect, useState } from 'react';
import { AutoComplete, Tooltip, Form } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useDebounceFn } from 'ahooks';
import { DatasourceCateEnum } from '@/utils/constant';
import { getSLSLogstore } from '@/services/metric';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { useTranslation } from 'react-i18next';
interface IProps {
  datasourceCate: DatasourceCateEnum.aliyunSLS;
  datasourceName: string;
  project?: string;
  prefixField?: any;
  prefixName?: (string | number)[];
  width?: number | string;
  layout?: 'horizontal' | 'vertical';
}
export default function LogstoreSelect(props: IProps) {
  const { t } = useTranslation();
  const { datasourceCate, datasourceName, project, prefixField = {}, prefixName = [], width = 190, layout = 'horizontal' } = props;
  const [options, setOptions] = useState<{ label; value }[]>([]);
  const [search, setSearch] = useState<string>('');
  const label = (
    <span>
      {t('日志库')}
      <Tooltip
        title={
          <div>
            {t('日志库是日志服务中日志数据的采集、存储和查询单元。更多信息，请参见')}
            <a
              href='https://help.aliyun.com/document_detail/48874.htm'
              target='_blank'
              style={{
                color: '#c6b2fd',
              }}
            >
              {t('日志库')}
            </a>
          </div>
        }
      >
        <QuestionCircleOutlined />
      </Tooltip>
    </span>
  );
  useEffect(() => {
    if (datasourceName && project) {
      fetchSLSLogstore();
    }
  }, [datasourceName, project]);

  const { run: fetchSLSLogstore } = useDebounceFn(
    () => {
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
    },
    {
      wait: 500,
    },
  );

  if (layout === 'vertical') {
    return (
      <Form.Item
        {...prefixField}
        label={label}
        name={[...prefixName, 'logstore']}
        rules={[
          {
            required: true,
            message: t('请输入日志库'),
          },
        ]}
        style={{
          width,
        }}
      >
        <AutoComplete options={options} />
      </Form.Item>
    );
  }

  return (
    <InputGroupWithFormItem label={label} labelWidth={84}>
      <Form.Item
        {...prefixField}
        name={[...prefixName, 'logstore']}
        rules={[
          {
            required: true,
            message: t('请输入日志库'),
          },
        ]}
        style={{
          width,
        }}
      >
        <AutoComplete
          options={_.filter(options, (item) => {
            if (search) {
              return item.label.indexOf(search) > -1;
            }
            return true;
          })}
          onSearch={(val) => {
            setSearch(val);
          }}
        />
      </Form.Item>
    </InputGroupWithFormItem>
  );
}
