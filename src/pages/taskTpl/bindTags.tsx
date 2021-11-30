import React from 'react';
import { Modal, Form, Select, message } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import ModalControl from '@/components/BaseModal/modalControl';
import request from '@/utils/request';
import api from '@/utils/api';
const FormItem = Form.Item;

const BindTags = (props) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const handleOk = () => {
    const { selectedIds } = props;
    form.validateFields().then((values: any) => {
      request(`${api.tasktpls(props.busiId)}/tags`, {
        method: 'POST',
        body: JSON.stringify({
          tags: values.tags,
          ids: selectedIds,
        }),
      }).then(() => {
        message.success(t('tpl.tag.bind.success'));
        props.onOk();
        props.destroy();
      });
    });
  }

  const handleCancel = () => {
    props.destroy();
  }

  const { visible } = props;

  return (
    <Modal
      title={t('tpl.tag.bind.title')}
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Form form={form}>
        <FormItem label={t('tpl.tag.bind.field')} required name="tags" rules={[{ required: true , message: '请选择！'}]}>
          <Select mode="tags" open={false} />
        </FormItem>
      </Form>
    </Modal>
  );
}

BindTags.defaultProps = {
  visible: true,
  onOk: _.noop,
  destroy: _.noop,
};

export default ModalControl(BindTags as any);
