import React from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Form, Radio, Space, Input, Select } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import Builder from './Builder';
import Code from './Code';

interface IProps {
  prefixField?: any;
  fullPrefixName?: (string | number)[]; // 完整的前置字段名，用于 getFieldValue 获取指定字段的值

  prefixName?: (string | number)[]; // 列表字段名
}
export default function Trigger(props: IProps) {
  const { t } = useTranslation();
  const { prefixField = {}, fullPrefixName = [], prefixName = [] } = props;
  return (
    <div
      style={{
        backgroundColor: '#fafafa',
        padding: 16,
        marginBottom: 16,
      }}
    >
      <Form.Item {...prefixField} name={[...prefixName, 'mode']} initialValue={0}>
        <Radio.Group buttonStyle='solid' size='small'>
          <Radio.Button value={0}>{t('简单模式')}</Radio.Button>
          <Radio.Button value={1}>{t('表达式模式')}</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          const mode = getFieldValue([...fullPrefixName, 'mode']);
          const queries = getFieldValue(['queries']);

          if (mode == 0) {
            return <Builder prefixField={prefixField} prefixName={prefixName} queries={queries} />;
          }

          if (mode === 1) {
            return <Code prefixField={prefixField} prefixName={prefixName} />;
          }
        }}
      </Form.Item>
      <Form.List {...prefixField} name={[...prefixName, 'relation_key']}>
        {(fields, { add, remove }) => (
          <div>
            <div
              style={{
                marginBottom: 8,
              }}
            >
              {t('关联')} Label:{' '}
              <PlusCircleOutlined
                onClick={() => {
                  add();
                }}
              />
            </div>
            {fields.map((field) => {
              return (
                <Space align='start'>
                  <Form.Item {...field} name={[field.name, 'left_key']}>
                    <Input
                      style={{
                        width: 197,
                      }}
                    />
                  </Form.Item>
                  <Form.Item {...field} name={[field.name, 'op']} initialValue='=='>
                    <Input
                      disabled
                      style={{
                        width: 64,
                      }}
                    />
                  </Form.Item>
                  <Form.Item {...field} name={[field.name, 'right_key']}>
                    <Input
                      style={{
                        width: 200,
                      }}
                    />
                  </Form.Item>
                  <Space
                    style={{
                      height: 32,
                      lineHeight: ' 32px',
                    }}
                  >
                    <MinusCircleOutlined
                      onClick={() => {
                        remove(field.name);
                      }}
                    />
                  </Space>
                </Space>
              );
            })}
          </div>
        )}
      </Form.List>
      <InputGroupWithFormItem label={t('触发')} labelWidth={60}>
        <Form.Item {...prefixField} name={[...prefixName, 'severity']} initialValue={1}>
          <Select
            style={{
              width: 210,
            }}
          >
            <Select.Option value={1}>{t('一级告警')}</Select.Option>
            <Select.Option value={2}>{t('二级告警')}</Select.Option>
            <Select.Option value={3}>{t('三级告警')}</Select.Option>
          </Select>
        </Form.Item>
      </InputGroupWithFormItem>
    </div>
  );
}
