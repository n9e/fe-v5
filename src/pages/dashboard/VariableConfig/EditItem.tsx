import React, { useRef, useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Space, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { DeleteOutlined, PlusOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import PromqlEditor from '@/components/PromqlEditor';
import '../index.less';
import { Variable } from './definition';
export interface FormType {
  var: Variable[];
}
interface Props {
  visible: boolean;
  onChange: (v: FormType | undefined) => void;
}
export default function EditItem(props: Props) {
  const { visible, onChange } = props;
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const handleOk = async () => {
    await form.validateFields();
    const v: FormType = form.getFieldsValue();
    onChange(v);
  };
  const onCancel = () => {
    onChange(undefined);
  };

  const onFinish = (values) => {
    console.log('Received values of form:', values);
  };

  return (
    <Modal title={t('大盘变量')} width={900} visible={visible} onOk={handleOk} onCancel={onCancel}>
      <Form name='dynamic_form_nest_item' onFinish={onFinish} autoComplete='off' preserve={false} form={form}>
        <Row gutter={[6, 6]} className='tag-header'>
          <Col span={4}>{t('变量名')}</Col>
          <Col span={10}>{t('变量定义')}</Col>
          <Col span={6}>{t('筛值正则')}</Col>
          <Col span={4}>{t('操作')}</Col>
        </Row>
        <Form.List name='var'>
          {(fields, { add, remove, move }) => (
            <>
              {fields.map(({ key, name, fieldKey, ...restField }) => (
                <Row gutter={[6, 6]} className='tag-content-item'>
                  <Col span={4}>
                    <Form.Item {...restField} name={[name, 'name']} fieldKey={[fieldKey, 'name']} rules={[{ required: true, message: t('请输入变量名') }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={10}>
                    <Form.Item {...restField} name={[name, 'definition']} fieldKey={[fieldKey, 'definition']} rules={[{ required: true, message: t('请输入变量定义') }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...restField} name={[name, 'reg']} fieldKey={[fieldKey, 'reg']}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Button type='link' size='small' onClick={() => move(name, name + 1)} disabled={name === fields.length - 1}>
                      <ArrowDownOutlined />
                    </Button>
                    <Button type='link' size='small' onClick={() => move(name, name - 1)} disabled={name === 0}>
                      <ArrowUpOutlined />
                    </Button>
                    <Button type='link' size='small' onClick={() => remove(name)}>
                      <DeleteOutlined />
                    </Button>
                  </Col>
                </Row>
              ))}
              <Form.Item>
                <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                  {t('新增变量')}
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}
