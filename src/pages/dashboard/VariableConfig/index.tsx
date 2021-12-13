import React, { useImperativeHandle, useMemo, useReducer, useState } from 'react';
import { Row, Col } from 'antd';
import DisplayItem from './DisplayItem';
import EditItem, { FormType } from './EditItem';
import { Button } from 'antd';
import { ADD_ITEM, CLASS_PATH_VALUE, CLASS_PATH_PREFIX_VALUE, INIT_DATA, TagFilterReducer, TagFilterStore } from './constant';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { useEffect } from 'react';
import './index.less';
import { useTranslation } from 'react-i18next';

export type VariableType = FormType;

interface ITagFilterProps {
  isOpen?: boolean;
  cluster: string;
  editable?: boolean;
  value?: FormType;
  onChange: (data: FormType) => void;
}

const TagFilter: React.ForwardRefRenderFunction<any, ITagFilterProps> = ({ isOpen = false, value, onChange, editable = true, cluster }, ref) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState<boolean>(isOpen);
  const [data, setData] = useState<FormType>();
  const handleEditClose = (v: FormType) => {
    if (v) {
      onChange(v);
      setData(v);
    }
    setEditing(false);
  };

  useEffect(() => {
    value && setData(value);
  }, [value]);

  const handleVariableChange = (index: number, v: string | string[], options) => {
    const newData = data ? { var: [...data.var] } : { var: [] };
    newData.var[index].selected = v;
    options && (newData.var[index].options = options);
    setData(newData);
    onChange(newData);
  };

  const setInitData = (initData: VariableType) => {
    setData(initData);
  };
  useImperativeHandle(ref, () => ({
    setInitData,
  }));
  return (
    <div className='tag-area'>
      <div className={classNames('tag-content', 'tag-content-close')}>
        {data?.var && data?.var.length > 0 && (
          <>
            {data.var.map((expression, index) => (
              <DisplayItem expression={expression} index={index} data={data.var} onChange={handleVariableChange} cluster={cluster}></DisplayItem>
            ))}
            {editable && <EditOutlined className='icon' onClick={() => setEditing(true)}></EditOutlined>}
          </>
        )}
        {(data ? data?.var.length === 0 : true) && editable && (
          <div className='add-variable-tips' onClick={() => setEditing(true)}>
            {t('添加大盘变量')}
          </div>
        )}
      </div>
      <EditItem visible={editing} onChange={handleEditClose} value={data} />
    </div>
  );
};

export default React.forwardRef(TagFilter);
