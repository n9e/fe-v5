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
import React, { useState, useEffect, useRef } from 'react';
import { IFormButtonModalProps } from '@/components/BaseModal/formButtonModal';
import { Form, Input } from 'antd';
const { TextArea } = Input;
import { cloneCollectSetting } from '@/services/resource';
import { download } from '@/utils';
export const getMoreTypeModal: (
  type: string,
  t: any,
  data?: string,
  refresh?: Function,
  classpath_id?: number,
) => IFormButtonModalProps = (type, t, data, refresh, classpath_id) => {
  return {
    customizeButton: (
      <div>{type === 'import' ? t('导入规则') : t('导出规则')}</div>
    ),
    modalName: type === 'import' ? t('导入规则') : t('导出规则'),
    handlePromiseOk: (values: any) => {
      if (type === 'import') {
        try {
          const data = JSON.parse(values?.data || '[]');
          return cloneCollectSetting(
            data.map((item) => {
              return { ...item, classpath_id };
            }),
          );
        } catch (error) {
          return Promise.resolve();
        }
      } else {
        return Promise.resolve();
      }
    },
    afterPromiseOk: (data, values) => {
      if (type === 'import') {
        refresh && refresh();
      }
    },
    setFields: (form) => {
      if (type === 'export') {
        form.setFieldsValue({
          data: data || '',
        });
      }
    },
    formLayout: 'horizontal',
    children: (
      <>
        <p
          style={{
            color: '#999',
          }}
        >
          {type === 'export' && (
            <a
              onClick={() => {
                download(data || [''], 'Download.json');
              }}
            >
              Download.json
            </a>
          )}
        </p>
        <Form.Item
          name='data'
          key='data'
          wrapperCol={{
            span: 24,
          }}
          rules={[
            {
              required: true,
              message: t('请输入导入信息'),
              validateTrigger: 'trigger',
            },
          ]}
        >
          <TextArea rows={4} />
        </Form.Item>
      </>
    ),
  };
};
