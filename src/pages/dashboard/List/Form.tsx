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
import React from 'react';
import _ from 'lodash';
import { Form, Modal, Input, Select, message } from 'antd';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { updateDashboard, createDashboard } from '@/services/dashboardV2';

interface IProps {
  mode: 'crate' | 'edit';
  initialValues?: any;
  busiId: number;
  refreshList: () => void;
}

const layout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 16,
  },
};
const titleMap = {
  crate: '创建新监控大盘',
  edit: '编辑监控大盘',
};

function FormCpt(props: IProps & ModalWrapProps) {
  const { mode, initialValues = {}, visible, busiId, refreshList, destroy } = props;
  const [form] = Form.useForm();
  const handleOk = async () => {
    const values = await form.validateFields();

    if (mode === 'edit') {
      await updateDashboard(initialValues.id, {
        name: values.name,
        tags: _.join(values.tags, ' '),
      });
      message.success('编辑大盘成功');
    } else if (mode === 'crate') {
      await createDashboard(busiId, {
        name: values.name,
        tags: _.join(values.tags, ' '),
        configs: JSON.stringify({
          var: [],
          panels: [],
          version: '2.0.0',
        }),
      });
      message.success('新建大盘成功');
    }

    refreshList();
    destroy();
  };
  return (
    <Modal
      title={titleMap[mode]}
      visible={visible}
      onOk={handleOk}
      onCancel={() => {
        destroy();
      }}
      destroyOnClose
    >
      <Form {...layout} form={form} preserve={false} initialValues={initialValues}>
        <Form.Item
          label='大盘名称'
          name='name'
          wrapperCol={{
            span: 24,
          }}
          rules={[
            {
              required: true,
              message: '请输入大盘名称',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          wrapperCol={{
            span: 24,
          }}
          label='分类标签'
          name='tags'
        >
          <Select
            mode='tags'
            dropdownStyle={{
              display: 'none',
            }}
            placeholder={'请输入分类标签(请用回车分割)'}
          />
        </Form.Item>
        <Form.Item name='id' hidden>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalHOC(FormCpt);
