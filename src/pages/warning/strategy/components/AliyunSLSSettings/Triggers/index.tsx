import React from 'react';
import { Form } from 'antd';
import { PlusCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import Trigger from './Trigger';
import { useTranslation } from 'react-i18next';
interface IProps {
  prefixField?: any;
  fullPrefixName?: string[]; // 完整的前置字段名，用于 getFieldValue 获取指定字段的值

  prefixName?: string[]; // 列表字段名
}
export default function index(props: IProps) {
  const { t } = useTranslation();
  const { prefixField = {}, fullPrefixName = [], prefixName = [] } = props;
  return (
    <Form.List
      {...prefixField}
      name={[...prefixName, 'triggers']}
      initialValue={[
        {
          mode: 0,
        },
      ]}
    >
      {(fields, { add, remove }) => (
        <div>
          <div
            style={{
              marginBottom: 8,
            }}
          >
            {t('告警条件')}
            <PlusCircleOutlined
              style={{
                cursor: 'pointer',
              }}
              onClick={() => {
                add({});
              }}
            />
          </div>
          {fields.map((field) => {
            return (
              <div
                key={field.key}
                style={{
                  position: 'relative',
                }}
              >
                <Trigger prefixField={field} fullPrefixName={[...prefixName, 'triggers', field.name]} prefixName={[field.name]} />
                {fields.length > 1 && (
                  <CloseCircleOutlined
                    style={{
                      position: 'absolute',
                      right: -4,
                      top: -4,
                    }}
                    onClick={() => {
                      remove(field.name);
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </Form.List>
  );
}
