import React, { useImperativeHandle, ReactNode } from 'react';
import { Form, Input } from 'antd';
import { layout } from '../../const';
import { UserAndPasswordFormProps } from '@/store/manageInterface';
import { useTranslation } from 'react-i18next';
const PasswordForm = React.forwardRef<ReactNode, UserAndPasswordFormProps>(
  (props, ref) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    useImperativeHandle(ref, () => ({
      form: form,
    }));
    return (
      <Form {...layout} form={form}>
        <Form.Item
          name='password'
          label={t('密码')}
          rules={[
            {
              required: true,
              message: t('请输入密码!'),
            },
          ]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name='confirm'
          label={t('确认密码')}
          dependencies={['password']}
          hasFeedback
          rules={[
            {
              required: true,
              message: t('请确认密码!'),
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }

                return Promise.reject(new Error('密码不一致!'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
      </Form>
    );
  },
);
export default PasswordForm;
