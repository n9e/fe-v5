import React from 'react';
import _ from 'lodash';
import Queries from './Queries';
import Triggers from './Triggers';
import { useTranslation } from "react-i18next";
export default function index({
  form
}) {
  const {
    t
  } = useTranslation();
  return <>
      <Queries form={form} />
      <Triggers />
    </>;
}