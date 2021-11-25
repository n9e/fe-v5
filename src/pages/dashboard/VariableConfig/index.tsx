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
  onChange: (data: FormType) => void;
}

const TagFilter: React.ForwardRefRenderFunction<any, ITagFilterProps> = ({ isOpen = false, onChange }, ref) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState<boolean>(isOpen);
  const [data, setData] = useState<FormType>();
  const handleEditClose = (v: FormType) => {
    v && onChange(v);
    setEditing(false);
  };

  const setInitData = (initData: VariableType) => {
    setData(initData);
  };
  useImperativeHandle(ref, () => ({
    setInitData,
  }));
  return (
    <div className='tag-area'>
      <div className={classNames('tag-content', !editing ? 'tag-content-close' : '')}>
        <DisplayItem data={data}></DisplayItem>
        {/* {editing ? null : Array.isArray(data.tagList) && data.tagList.length ? (
          <EditOutlined className='icon' onClick={handleEdit}></EditOutlined>
        ) : ( */}
        <div className='add-variable-tips' onClick={() => setEditing(true)}>
          {t('添加大盘变量')}
        </div>
        {/* )} */}
      </div>
      <EditItem visible={editing} onChange={handleEditClose} />
    </div>
  );
};

export default React.forwardRef(TagFilter);
