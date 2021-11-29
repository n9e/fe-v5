import React from 'react';
import { Modal, Form, Select, message } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import ModalControl from '@/components/BaseModal/modalControl';
import request from '@/utils/request';
import api from '@/utils/api';

const FormItem = Form.Item;
const { Option } = Select;

const UnBindTags = (props) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const handleOk = () => {
    const { selectedIds } = props;
    form.validateFields().then((values: any) => {
      request(`${api.tasktpl}s/tags`, {
        method: 'PUT',
        body: JSON.stringify({
          tags: _.join(values.tags, ','),
          ids: selectedIds,
          act: 'unbind',
        }),
      }).then(() => {
        message.success(t('tpl.tag.unbind.success'));
        props.onOk();
        props.destroy();
      });
    });
  }

  const handleCancel = () => {
    props.destroy();
  }

  const { visible, uniqueTags } = props;

  return (
    <Modal
      title={t('tpl.tag.unbind.title')}
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Form form={form}>
        <FormItem
          label={t('tpl.tag.unbind.field')}
          required
          name="tags"
          rules={[{ required: true }]}
        >
          <Select mode="tags">
            {
              _.map(uniqueTags, (tag) => {
                return <Option key={tag} value={tag}>{tag}</Option>;
              })
            }
          </Select>
        </FormItem>
      </Form>
    </Modal>
  );
}

UnBindTags.defaultProps = {
  visible: true,
  onOk: _.noop,
  destroy: _.noop,
};

export default ModalControl(UnBindTags as any);
