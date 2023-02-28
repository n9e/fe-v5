import React, { useState } from 'react';
import { Input } from 'antd';
import _ from 'lodash';
import FieldsList from './FieldsList';
import './style.less';
import { useTranslation } from "react-i18next";
interface IProps {
  fields: string[];
  setFields: (fields: string[]) => void;
  value: string[];
  onChange: (value: string[]) => void;
}
export default function index(props: IProps) {
  const {
    t
  } = useTranslation();
  const {
    fields,
    setFields,
    value,
    onChange
  } = props;
  const [fieldsSearch, setFieldsSearch] = useState('');
  return <div className='discover-sidebar'>
      <div className='discover-sidebar-title'>
        <Input placeholder={t("搜索字段")} value={fieldsSearch} onChange={e => {
        setFieldsSearch(e.target.value);
      }} allowClear />
      </div>
      <div className='discover-sidebar-content'>
        <FieldsList style={{
        marginBottom: 10
      }} fieldsSearch={fieldsSearch} fields={value} type='selected' onRemove={field => {
        onChange(_.without(value, field));
        setFields(_.sortBy(_.concat(fields, field)));
      }} />
        <FieldsList fields={fields} fieldsSearch={fieldsSearch} type='available' onSelect={field => {
        onChange(_.concat(value, field));
        setFields(_.sortBy(_.without(fields, field)));
      }} />
      </div>
    </div>;
}