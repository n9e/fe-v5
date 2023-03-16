import React from 'react';
import { Button, Drawer, Form, Input, Select, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { CaretDownOutlined } from '@ant-design/icons';
import { accountStoreState } from '@/store/accountInterface';

export default function AddContact(props: {
  visible: boolean;
  contactsList: any;
  profile: accountStoreState['profile'];
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  updateProfile: (key: string, value: any) => void;
}) {
  const { visible, contactsList, profile, updateProfile, setVisible } = props;
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const close = () => {
    setVisible(false);
    form.resetFields();
  };

  return (
    <Drawer
      title={t('新增更多联系方式')}
      visible={visible}
      onClose={close}
      footer={
        <Space>
          <Button
            type='primary'
            onClick={() => {
              form.validateFields().then((data) => {
                updateProfile('contacts.' + data.key, data.value);
                close();
              });
            }}
          >
            {t('确定')}
          </Button>
          <Button onClick={close}>{t('取消')}</Button>
        </Space>
      }
    >
      <Form form={form} layout='vertical'>
        <Form.Item
          label={t('联系方式')}
          name='key'
          rules={[
            {
              required: true,
              message: t('联系方式不能为空'),
            },
          ]}
        >
          <Select suffixIcon={<CaretDownOutlined />} placeholder={t('请选择联系方式')}>
            {contactsList.map((item, index) => (
              <Select.Option value={item.key} key={index} disabled={Object.keys(profile.contacts).includes(item.key)}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name='value'
          label={t('值')}
          rules={[
            {
              required: true,
              message: t('值不能为空'),
            },
          ]}
        >
          <Input placeholder={t('请输入值')} />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
