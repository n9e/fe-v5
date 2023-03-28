import React from 'react';
import { useTranslation } from 'react-i18next';
import { Row, Col, Form, Input } from 'antd';
import FunctionsEditor from '../components/FunctionsEditor';

interface IProps {
  prefixField: any;
}

export default function ItemIDs(props: IProps) {
  const { t } = useTranslation();
  const { prefixField = {} } = props;
  const prefixName = [prefixField.name, 'query'];

  return (
    <>
      <Row gutter={10}>
        <Col flex='auto'>
          <Form.Item {...prefixField} label={t('监控 IDs')} name={[...prefixName, 'itemids']} rules={[{ required: true, message: t('请输入监控 IDs') }]}>
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item {...prefixField} name={[...prefixName, 'functions']}>
        <FunctionsEditor />
      </Form.Item>
    </>
  );
}
