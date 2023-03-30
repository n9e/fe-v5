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
import React, { useEffect } from 'react';
import _ from 'lodash';
import { Form, Modal, Input, Select, message } from 'antd';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { updateDashboard, createDashboard, updateDashboardConfigs, getDashboard } from '@/services/dashboardV2';
import { JSONParse } from '../utils';
import { useTranslation } from 'react-i18next';
interface IProps {
  mode: 'crate' | 'edit';
  initialValues?: any;
  busiId: number;
  refreshList: () => void;
  clusters: string[];
}
const layout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 16,
  },
};

function FormCpt(props: IProps & ModalWrapProps) {
  const { t } = useTranslation();
  const titleMap = {
    crate: t('创建新仪表盘'),
    edit: t('编辑仪表盘'),
  };
  const { mode, initialValues = {}, visible, busiId, refreshList, destroy, clusters } = props;
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      let result;

      if (mode === 'edit') {
        result = await updateDashboard(initialValues.id, {
          name: values.name,
          ident: values.ident,
          tags: _.join(values.tags, ' '),
        });
        message.success(t('编辑仪表盘成功'));
      } else if (mode === 'crate') {
        result = await createDashboard(busiId, {
          name: values.name,
          ident: values.ident,
          tags: _.join(values.tags, ' '),
          configs: JSON.stringify({
            var: [],
            panels: [],
            version: '2.0.0',
          }),
        });
        message.success(t('新建仪表盘成功'));
      }

      if (result) {
        const configs = JSONParse(result.configs);
        await updateDashboardConfigs(result.id, {
          configs: JSON.stringify({ ...configs, datasourceValue: values.datasourceValue }),
        });
      }

      refreshList();
      destroy();
    } catch (error) {
      message.error(t('操作失败'));
    }
  };

  useEffect(() => {
    if (initialValues.id) {
      getDashboard(initialValues.id).then((res) => {
        const configs = JSONParse(res.configs);
        form.setFieldsValue({
          datasourceValue: configs.datasourceValue,
        });
      });
    }
  }, [initialValues.id]);
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
          label={t('仪表盘名称')}
          name='name'
          labelCol={{
            span: 5,
          }}
          wrapperCol={{
            span: 24,
          }}
          rules={[
            {
              required: true,
              message: t('请输入仪表盘名称'),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t('英文标识')}
          name='ident'
          labelCol={{
            span: 5,
          }}
          wrapperCol={{
            span: 24,
          }}
          rules={[
            {
              pattern: /^[a-zA-Z0-9\-]*$/,
              message: t('请输入英文字母、数字、中划线'),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          labelCol={{
            span: 5,
          }}
          wrapperCol={{
            span: 24,
          }}
          label={t('分类标签')}
          name='tags'
        >
          <Select
            mode='tags'
            dropdownStyle={{
              display: 'none',
            }}
            placeholder={t('请输入分类标签(请用回车分割)')}
          />
        </Form.Item>
        <Form.Item
          labelCol={{
            span: 5,
          }}
          wrapperCol={{
            span: 24,
          }}
          label={t('默认关联数据源')}
          name='datasourceValue'
        >
          <Select>
            {_.map(clusters, (item) => {
              return (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item name='id' hidden>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalHOC(FormCpt);
