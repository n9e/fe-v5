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
