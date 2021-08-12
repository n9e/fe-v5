import React, { useState, useEffect } from 'react';
import { Modal, Input, InputNumber, Form } from 'antd';
import { EditProps } from '@/store/overview';
import { useTranslation } from 'react-i18next';

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};
const EditModal: React.FC<EditProps> = ({
  modalVisible,
  modalData,
  editClose,
  editOk,
}) => {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(true);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    setVisible(modalVisible);
  }, [modalVisible]);

  useEffect(() => {
    const md = JSON.parse(JSON.stringify(modalData));
    const fd = Object.assign(
      {},
      {
        name: md?.editData?.name || '',
        promql: md?.editData?.promql || '',
        warning: md?.editData?.warning || 99,
      },
    );
    form.setFieldsValue(fd);
  }, [modalData]);

  function modalOk() {
    form.validateFields().then((values) => {
      editOk({
        index: modalData?.index,
        editData: form.getFieldsValue(true),
      });
      setVisible(false);
    });
  }
  function modalCancel() {
    setVisible(false);
  }
  function close() {
    editClose();
  }

  return (
    <Modal
      title={t('编辑')}
      centered
      forceRender
      visible={visible}
      afterClose={close}
      destroyOnClose={true}
      getContainer={() =>
        document.getElementById('overview_con') || document.body
      }
      onOk={() => modalOk()}
      onCancel={() => modalCancel()}
    >
      <Form form={form} name='dynamic_rule' {...formItemLayout}>
        <Form.Item
          name='name'
          label={t('标题')}
          rules={[
            {
              required: true,
              message: t('请输入标题'),
            },
          ]}
        >
          <Input placeholder={t('请输入标题')} />
        </Form.Item>
        <Form.Item
          name='promql'
          label={t('promql')}
          rules={[
            {
              required: true,
              message: t('请输入promql'),
            },
          ]}
        >
          <Input placeholder={t('请输入promql')} />
        </Form.Item>
        <Form.Item
          name='warning'
          label={t('预警值')}
          rules={[
            {
              required: false,
            },
          ]}
        >
          <InputNumber placeholder={t('请输入预警值')} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default EditModal;
