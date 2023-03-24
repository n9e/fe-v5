import React from 'react';
import { Form, Select } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
export default function index({ visible, form }) {
  const { t } = useTranslation();
  const typeNameMap = {
    prometheus: 'Prometheus',
    elasticsearch: 'Elasticsearch',
    'aliyun-sls': t('阿里云SLS'),
    ck: 'ClickHouse',
    influxdb: 'InfluxDB',
  };
  const options = visible ? ['prometheus', 'elasticsearch', 'aliyun-sls', 'ck', 'influxdb'] : ['prometheus'];
  return (
    <Form.Item label={t('数据源类型')} name='cate' initialValue='prometheus'>
      <Select
        suffixIcon={<CaretDownOutlined />}
        onChange={(val) => {
          const values: any = {
            cluster: [],
            prom_ql: '',
          };

          if (val === 'elasticsearch') {
            // 旧版本，即将废弃
            // values.query = {
            //   values: [
            //     {
            //       func: 'count',
            //       ref: 'A',
            //     },
            //   ],
            //   date_field: '@timestamp',
            //   interval: 1,
            //   interval_unit: 'min',
            //   rules: [
            //     {
            //       rule_op: 'AND',
            //       severity: 2,
            //       rule: [
            //         {
            //           value: 'A',
            //           func: 'cur',
            //           op: '>',
            //         },
            //       ],
            //     },
            //   ],
            // };
            values.queries = [
              {
                ref: 'A',
                value: {
                  func: 'count',
                },
                date_field: '@timestamp',
                interval: 1,
                interval_unit: 'min',
              },
            ];
            values.triggers = [
              {
                mode: 0,
                severity: 1,
              },
            ];
          }

          form.setFieldsValue(values);
        }}
      >
        {options.map((item) => (
          <Select.Option key={item} value={item}>
            {typeNameMap[item]}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
}
