import React from 'react';
import { Modal, Form, Input, Tooltip, Switch, Button, Space } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import _ from 'lodash';
import ModalHOC, { ModalWrapProps } from '../Components/ModalHOC';
import { ILink } from '../types';

interface IProps {
  initialValues: ILink[];
  onOk: (values: any) => void;
}

function index(props: ModalWrapProps & IProps) {
  const { visible, initialValues } = props;
  const [form] = Form.useForm();
  return (
    <Modal
      width={800}
      title='大盘链接设置'
      style={{ top: 10, padding: 0 }}
      visible={visible}
      closable={false}
      onOk={() => {
        form.validateFields().then((values) => {
          props.onOk(values.links);
          props.destroy();
        });
      }}
      onCancel={() => {
        props.destroy();
      }}
      bodyStyle={{
        padding: '10px 24px 24px 24px',
      }}
    >
      <Form
        layout='vertical'
        initialValues={{
          links: initialValues,
        }}
        form={form}
      >
        <Form.List name={'links'}>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => {
                return (
                  <Space
                    key={key}
                    style={{
                      alignItems: 'flex-start',
                    }}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'title']}
                      rules={[
                        {
                          required: true,
                          message: '链接名称',
                        },
                      ]}
                    >
                      <Input placeholder='链接名称' style={{ width: 192 }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'url']}
                      rules={[
                        {
                          required: true,
                          message: '链接地址',
                        },
                      ]}
                    >
                      <Input style={{ width: 460 }} placeholder='链接地址' />
                    </Form.Item>
                    <Tooltip title='是否新窗口打开'>
                      <Form.Item {...restField} name={[name, 'targetBlank']} valuePropName='checked'>
                        <Switch />
                      </Form.Item>
                    </Tooltip>
                    <Button
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        remove(name);
                      }}
                    />
                  </Space>
                );
              })}
              <Button
                type='dashed'
                style={{ width: '100%', marginBottom: 10 }}
                onClick={() => {
                  add({});
                }}
              >
                <PlusOutlined /> 新增链接
              </Button>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}

export default ModalHOC(index);
