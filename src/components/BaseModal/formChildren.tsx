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
import { Form, FormInstance } from 'antd';
import { FormLayout } from 'antd/lib/form/Form';
import { useTranslation } from 'react-i18next';
export interface IFormChildrenProps {
  setFields?: (form: FormInstance) => unknown;
  form: FormInstance;
  layout?: FormLayout;
  chilldren?: React.ReactNode;
}
const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 6,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};

const FormChildren: React.FC<IFormChildrenProps> = ({
  children,
  setFields,
  form,
  layout = 'vertical',
}) => {
  const { t } = useTranslation();
  useEffect(() => {
    setFields && setFields(form);
  }, []);
  return (
    <Form {...formItemLayout} preserve={false} form={form} layout={layout}>
      {children}
    </Form>
  );
};

export default FormChildren;
