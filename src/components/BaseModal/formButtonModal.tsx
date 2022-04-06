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
import React, { useEffect, useState } from 'react';
import { Form, ModalProps } from 'antd';
import PureModal from './index';
import FormChildren from './formChildren';
import { useDispatch } from 'react-redux';
import { basePagingReq } from '@/store/common';
import { FormInstance, FormLayout } from 'antd/lib/form/Form';
import { useTranslation } from 'react-i18next';
export interface IFormButtonModalProps {
  muteTimePromiseOK?: () => void | Promise<basePagingReq>;
  menuButton?: React.ReactNode;
  noModal?: boolean;
  modalName: string;
  customizeButton?: React.ReactNode;
  children: React.ReactNode | ((form: FormInstance) => React.ReactNode);
  modalProps?: ModalProps;
  beforePromiseOk?: (params: Object) => Object;
  handlePromiseOk: (params: Object) => Promise<basePagingReq>;
  afterPromiseOk?: (...res) => unknown;
  setFields?: (form: FormInstance) => unknown;
  formLayout?: FormLayout;
  width?: number;
}
export default function (props: IFormButtonModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handlePromiseOk = () => {
    return form
      .validateFields()
      .then((values) => {
        setLoading(true);
        const realValues = props.beforePromiseOk
          ? props.beforePromiseOk(values)
          : values;
        return props
          .handlePromiseOk(realValues)
          .then((res) => {
            console.log(res);

            if (res.success) {
              props.afterPromiseOk &&
                props.afterPromiseOk(res.dat, values, dispatch);
            }

            setLoading(false);
            return res.success;
          })
          .catch((err) => {
            setLoading(false);
          });
      })
      .catch((e) => {
        console.warn(e);
        setLoading(false);
      });
  };

  const handleMuteTimePromiseOK = () => {
    if (!props.muteTimePromiseOK) return;
    setLoading(true);
    return (props.muteTimePromiseOK() as Promise<basePagingReq>)
      .then((res) => {
        if (res.success) {
          props.afterPromiseOk && props.afterPromiseOk();
        }
        setLoading(false);
        return res.success;
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  return (
    <PureModal
      noModal={props.noModal}
      menuButton={props.menuButton}
      modalName={props.modalName}
      handleOk={handlePromiseOk}
      modalProps={{
        confirmLoading: loading,
        ...props.modalProps,
      }}
      customizeButton={props.customizeButton}
      muteTimePromiseOK={
        props.muteTimePromiseOK ? handleMuteTimePromiseOK : undefined
      }
    >
      <FormChildren
        setFields={props.setFields}
        form={form}
        layout={props.formLayout}
      >
        {typeof props.children !== 'function'
          ? props.children
          : props.children(form)}
      </FormChildren>
    </PureModal>
  );
}
