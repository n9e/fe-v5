import React from 'react';
import { Space, Input, Form, Select, Alert, Tooltip } from 'antd';
import _ from 'lodash';
import AdvancedWrap from '@/components/AdvancedWrap';
import Prometheus from './Prometheus';
import Elasticsearch from './Elasticsearch';
import ElasticsearchLog from './ElasticsearchLog';
import AliyunSLS from './AliyunSLS';
import ClusterSelect from './components/ClusterSelect';
import { useTranslation } from 'react-i18next';
const prometheusCate = {
  value: 'prometheus',
  label: 'Prometheus',
};

export default function index({ chartForm, defaultDatasourceName }) {
  const { t } = useTranslation();
  const allCates = [
    prometheusCate,
    {
      value: 'elasticsearch',
      label: 'Elasticsearch',
    },
    {
      value: 'aliyun-sls',
      label: t('阿里云SLS'),
    },
  ];
  return (
    <div>
      <Space align='start'>
        <Input.Group>
          <span className='ant-input-group-addon'>{t('数据源类型')}</span>
          <AdvancedWrap
            var='VITE_IS_QUERY_ES_DS'
            children={(isES) => {
              const { t } = useTranslation();
              return (
                <Form.Item name='datasourceCate' noStyle initialValue='prometheus'>
                  <Select
                    dropdownMatchSelectWidth={false}
                    style={{
                      minWidth: 70,
                    }}
                    onChange={(val) => {
                      // TODO: 调整数据源类型后需要重置配置
                      setTimeout(() => {
                        if (val === 'prometheus') {
                          chartForm.setFieldsValue({
                            targets: [
                              {
                                refId: 'A',
                                expr: '',
                              },
                            ],
                            datasourceName: undefined,
                          });
                        } else if (val === 'elasticsearch') {
                          chartForm.setFieldsValue({
                            targets: [
                              {
                                refId: 'A',
                                query: {
                                  index: '',
                                  filters: '',
                                  values: [
                                    {
                                      func: 'count',
                                    },
                                  ],
                                  date_field: '@timestamp',
                                  interval: 1,
                                  interval_unit: 'min',
                                },
                              },
                            ],
                            datasourceName: undefined,
                          });
                        }
                      }, 500);
                    }}
                  >
                    {_.map(isES ? allCates : [prometheusCate], (item) => (
                      <Select.Option key={item.value} value={item.value}>
                        {item.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              );
            }}
          />
        </Input.Group>
        <Form.Item shouldUpdate={(prev, curr) => prev.datasourceCate !== curr.datasourceCate} noStyle>
          {({ getFieldValue }) => {
            const { t } = useTranslation();
            const cate = getFieldValue('datasourceCate') || 'prometheus';
            return (
              <Input.Group compact>
                <span
                  className='ant-input-group-addon'
                  style={{
                    width: 'max-content',
                    height: 32,
                    lineHeight: '32px',
                  }}
                >
                  {t('关联数据源')}
                </span>
                <ClusterSelect cate={cate} defaultDatasourceName={defaultDatasourceName} />
              </Input.Group>
            );
          }}
        </Form.Item>
        {chartForm.getFieldValue('datasourceCate') === 'elasticsearch-log' && (
          <span className='ant-form-text'>
            <Tooltip title={t('请选择 elasticsearch 数据源类型，数据提取选择 raw data')}>
              <Alert
                showIcon
                style={{
                  lineHeight: 1.1,
                }}
                message={t('数据源类型 elasticsearch-log 已废弃')}
                type='warning'
              />
            </Tooltip>
          </span>
        )}
      </Space>
      <Form.Item shouldUpdate={(prev, curr) => prev.datasourceCate !== curr.datasourceCate} noStyle>
        {({ getFieldValue }) => {
          const cate = getFieldValue('datasourceCate') || 'prometheus';

          if (cate === 'prometheus') {
            return <Prometheus chartForm={chartForm} />;
          }

          if (cate === 'elasticsearch') {
            return <Elasticsearch chartForm={chartForm} />;
          } // 兼容老数据，当前最新版本没有 elasticsearch-log 类型

          if (cate === 'elasticsearch-log') {
            return <ElasticsearchLog chartForm={chartForm} />;
          }

          if (cate === 'aliyun-sls') {
            return <AliyunSLS chartForm={chartForm} />;
          }

          return null;
        }}
      </Form.Item>
    </div>
  );
}
