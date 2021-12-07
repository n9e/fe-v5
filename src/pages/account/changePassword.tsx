import React, { useState } from 'react';
import { Form, Input, Button, Radio, message } from 'antd';
import { UpdatePwd } from '@/services/login';
import { useTranslation } from 'react-i18next';
export default function ChangePassword() {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      modifyPassword();
    } catch {
      console.log(t('输入有误'));
    }
  };

  const modifyPassword = () => {
    const { oldpass, newpass } = form.getFieldsValue();
    UpdatePwd(oldpass, newpass).then((res) => {
      console.log(res);
      message.success(t('修改密码成功'));
    });
  };

  return (
    <Form form={form} layout='vertical' requiredMark={true}>
      <Form.Item
        label={<span>{t('旧密码')}:</span>}
        required
        name='oldpass'
        rules={[
          {
            required: true,
            message: t('请输入旧密码'),
          },
        ]}
      >
        <Input placeholder={t('请输入旧密码')} type='password' />
      </Form.Item>
      <Form.Item
        label={<span>{t('新密码')}:</span>}
        required
        name='newpass'
        hasFeedback
        rules={[
          {
            required: true,
            message: t('请输入新密码'),
          },
        ]}
      >
        <Input placeholder={t('请输入新密码')} type='password' />
      </Form.Item>
      <Form.Item
        label={<span>{t('确认密码')}: </span>}
        required
        name='newpassagain'
        hasFeedback
        rules={[
          {
            required: true,
            message: t('再次输入新密码'),
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newpass') === value) {
                return Promise.resolve();
              }

              return Promise.reject(new Error('密码不一致!'));
            },
          }),
        ]}
      >
        <Input placeholder={t('再次输入新密码')} type='password' />
      </Form.Item>

      <Form.Item>
        <Button type='primary' onClick={handleSubmit}>
          {t('确认修改')}
        </Button>
      </Form.Item>
    </Form>
  );
}
