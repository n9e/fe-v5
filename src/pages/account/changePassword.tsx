/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useState } from 'react';
import { Form, Input, Button, message, Drawer, Space } from 'antd';
import { UpdatePwd } from '@/services/login';
import { useTranslation } from 'react-i18next';

export default function ChangePassword(props: { visible: boolean; setVisible: React.Dispatch<React.SetStateAction<boolean>> }) {
  const { visible, setVisible } = props;
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const modifyPassword = () => {
    form.validateFields().then((data) => {
      const { oldpass, newpass } = data;
      UpdatePwd(oldpass, newpass).then((res) => {
        message.success(t('修改密码成功'));
        setVisible(false);
        form.resetFields();
      });
    });
  };

  return (
    <Drawer
      title={t('修改密码')}
      visible={visible}
      onClose={() => setVisible(false)}
      footer={
        <Space>
          <Button type='primary' onClick={() => modifyPassword()}>
            {t('确定')}
          </Button>
          <Button onClick={close}>{t('取消')}</Button>
        </Space>
      }
    >
      <Form form={form} layout='vertical'>
        <Form.Item
          label={<span>{t('旧密码')}</span>}
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
          label={<span>{t('新密码')}</span>}
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
          label={<span>{t('确认密码')}</span>}
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

                return Promise.reject(new Error(t('密码不一致')));
              },
            }),
          ]}
        >
          <Input placeholder={t('再次输入新密码')} type='password' />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
