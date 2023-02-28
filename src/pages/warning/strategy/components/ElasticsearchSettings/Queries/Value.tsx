import React, { useState, useEffect } from 'react';
import { useDebounceFn } from 'ahooks';
import { Form, Row, Col, Select, Tooltip, AutoComplete } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { getFields } from '@/services/warning';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
interface IProps {
  cate: string;
  cluster: string[];
  index: string;
  prefixField?: any;
  prefixFields?: string[]; // 前缀字段名

  prefixNameField?: string[]; // 列表字段名
}
const functions = ['count', 'avg', 'sum', 'max', 'min', 'p90', 'p95', 'p99', 'rawData'];
const functionsLabelMap = {
  count: 'count',
  avg: 'avg',
  sum: 'sum',
  max: 'max',
  min: 'min',
  p90: 'p90',
  p95: 'p95',
  p99: 'p99',
  rawData: 'raw data',
};
export default function Value(props: IProps) {
  const { t } = useTranslation();
  const { cate, cluster, index, prefixField = {}, prefixFields = [], prefixNameField = [] } = props;
  const [fieldsOptions, setFieldsOptions] = useState([]);
  const [search, setSearch] = useState('');
  const { run } = useDebounceFn(
    () => {
      getFields({
        cate,
        cluster: _.join(cluster, ' '),
        index,
      }).then((res) => {
        setFieldsOptions(
          _.map(res.dat, (item) => {
            return {
              value: item,
            };
          }),
        );
      });
    },
    {
      wait: 500,
    },
  );
  useEffect(() => {
    if (cate === 'elasticsearch' && !_.isEmpty(cluster) && index) {
      run();
    }
  }, [cate, _.join(cluster), index]);
  return (
    <Form.Item shouldUpdate noStyle>
      {({ getFieldValue }) => {
        const func = getFieldValue(['queries', prefixField.name, 'value', 'func']);
        return (
          <Row gutter={8}>
            <Col span={func === 'count' || func === 'rawData' ? 24 : 12}>
              <InputGroupWithFormItem
                label={
                  <div>
                    {t('数值提取')}
                    {t('取')}{' '}
                    <Tooltip title=''>
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </div>
                }
                labelWidth={90}
              >
                <Form.Item {...prefixField} name={[prefixField.name, 'value', 'func']} noStyle>
                  <Select
                    style={{
                      width: '100%',
                    }}
                  >
                    {functions.map((func) => (
                      <Select.Option key={func} value={func}>
                        {functionsLabelMap[func]}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </InputGroupWithFormItem>
            </Col>
            {func !== 'count' && func !== 'rawData' && (
              <Col span={12}>
                <InputGroupWithFormItem label='Field key' labelWidth={90}>
                  <Form.Item {...prefixField} name={[prefixField.name, 'value', 'field']} noStyle>
                    <AutoComplete
                      options={_.filter(fieldsOptions, (item) => {
                        if (search) {
                          return item.value.includes(search);
                        }

                        return true;
                      })}
                      style={{
                        width: '100%',
                      }}
                      onSearch={setSearch}
                    />
                  </Form.Item>
                </InputGroupWithFormItem>
              </Col>
            )}
          </Row>
        );
      }}
    </Form.Item>
  );
}
