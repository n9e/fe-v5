import React from 'react';
import _ from 'lodash';
import Queries from './Queries';
import Triggers from './Triggers';

interface IProps {
  form: any;
  datasourceValue: string;
}

export default function index({ form, datasourceValue }: IProps) {
  return (
    <>
      <Queries form={form} datasourceValue={datasourceValue} />
      <Triggers />
    </>
  );
}
