import React from 'react';
import { useTranslation } from 'react-i18next';
import { Row, Col, Form, Input } from 'antd';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import FunctionsEditor from '../components/FunctionsEditor';

interface IProps {
  renderExecute: () => React.ReactNode;
}

export default function ItemIDs(props: IProps) {
  const { t } = useTranslation();
  const { renderExecute } = props;

  return (
    <>
      <Row gutter={10}>
        <Col flex='auto'>
          <InputGroupWithFormItem label={t('监控 IDs')} labelWidth={84}>
            <Form.Item name={['query', 'itemids']} rules={[{ required: true, message: t('请输入监控 IDs') }]}>
              <Input />
            </Form.Item>
          </InputGroupWithFormItem>
        </Col>
        <Col flex='430px'>{renderExecute()}</Col>
      </Row>
      <Form.Item name={['query', 'functions']}>
        <FunctionsEditor />
      </Form.Item>
    </>
  );
}
