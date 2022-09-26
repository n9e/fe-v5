import React from 'react';
import { Input, Form } from 'antd';
import FormItem from './FormItem';

export default function TLSSSLAuth() {
  return (
    <Form.Item
      noStyle
      shouldUpdate={(prevValues, currentValues) => {
        return prevValues.TLSSSLAuth?.enabled !== currentValues.TLSSSLAuth?.enabled;
      }}
    >
      {({ getFieldValue }) => {
        if (getFieldValue(['TLSSSLAuth', 'enabled'])) {
          return (
            <div>
              <h3>TLS/SSL Auth Details</h3>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => {
                  return prevValues.TLSSSLAuth?.withCACert !== currentValues.TLSSSLAuth?.withCACert;
                }}
              >
                {({ getFieldValue }) => {
                  if (getFieldValue(['TLSSSLAuth', 'withCACert'])) {
                    return (
                      <FormItem label='CA Cert' name={['TLSSSLAuth', 'CACert']} rules={[]}>
                        <Input.TextArea rows={7} placeholder='Begins with -----BEGIN CERTIFICATE-----' />
                      </FormItem>
                    );
                  }
                  return null;
                }}
              </Form.Item>
              <FormItem label='ServerName' name={['TLSSSLAuth', 'serverName']} rules={[]}>
                <Input placeholder='domain.example.com' />
              </FormItem>
              <FormItem label='Client Key' name={['TLSSSLAuth', 'clientKey']} rules={[]}>
                <Input.TextArea rows={7} placeholder='Begins with -----BEGIN CERTIFICATE-----' />
              </FormItem>
              <FormItem label='Client Cert' name={['TLSSSLAuth', 'clientCert']} rules={[]}>
                <Input.TextArea rows={7} placeholder='Begins with -----BEGIN RSA PRIVATE KEY-----' />
              </FormItem>
            </div>
          );
        }
        return null;
      }}
    </Form.Item>
  );
}
