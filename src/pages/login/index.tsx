import React, { useState } from 'react';
import { Form, Input, Button, Radio } from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import './login.less'; // import { Login, GenCsrfToken } from '@/services/login';

import { useTranslation } from 'react-i18next';
export default function Login() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const history = useHistory();
  const location = useLocation();
  const redirect = location.search && new URLSearchParams(location.search).get('redirect');
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      login();
    } catch {
      console.log(t('输入有误'));
    }
  };

  const login = async () => {
    let { username, password } = form.getFieldsValue();
    const err = await dispatch({
      type: 'account/login',
      username,
      password,
    });

    if (!err) {
      history.push(redirect || '/metric/explorer');
    }
  };

  return (
    <div className='login-warp'>
      <div className='banner'>
        <div className='banner-bg'>
          <img src={'/image/logo-l.svg'} className='logo' width='132'></img>
        </div>
      </div>
      <div className='login-panel'>
        <div className='login-main'>
          <div className='login-title'>Nightingale</div>
          <Form form={form} layout='vertical' requiredMark={true}>
            <Form.Item
              required
              name='username'
              rules={[
                {
                  required: true,
                  message: t('请输入用户名'),
                },
              ]}
            >
              <Input placeholder={t('请输入用户名')} prefix={<UserOutlined className='site-form-item-icon' />} />
            </Form.Item>
            <Form.Item
              required
              name='password'
              rules={[
                {
                  required: true,
                  message: t('请输入密码'),
                },
              ]}
            >
              <Input type='password' placeholder={t('请输入密码')} onPressEnter={handleSubmit} prefix={<LockOutlined className='site-form-item-icon' />} />
            </Form.Item>

            <Form.Item>
              <Button type='primary' onClick={handleSubmit}>
                {t('登录')}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
