import React from 'react';
import { Row, Col, Form, Input, InputNumber, Select } from 'antd';
import { useTranslation } from "react-i18next";
export default function index({
  prefixField = {},
  prefixNameField = []
}: any) {
  const {
    t
  } = useTranslation();
  return <>
      <div style={{
      marginBottom: 8
    }}>{t("时间颗粒度")}</div>
      <Row gutter={10}>
        <Col span={12}>
          <Form.Item {...prefixField} name={[...prefixNameField, 'query', 'date_field']}>
            <Input placeholder={t("日期字段 key")} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Input.Group>
            <span className='ant-input-group-addon'>{t("间隔")}</span>
            <Form.Item {...prefixField} name={[...prefixNameField, 'query', 'interval']} noStyle>
              <InputNumber style={{
              width: '100%'
            }} />
            </Form.Item>
            <span className='ant-input-group-addon'>
              <Form.Item {...prefixField} name={[...prefixNameField, 'query', 'interval_unit']} noStyle initialValue='min'>
                <Select>
                  <Select.Option value='second'>{t("秒")}</Select.Option>
                  <Select.Option value='min'>{t("分")}</Select.Option>
                  <Select.Option value='hour'>{t("小时")}</Select.Option>
                </Select>
              </Form.Item>
            </span>
          </Input.Group>
        </Col>
      </Row>
    </>;
}