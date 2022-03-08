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
import { Range } from '@/components/DateRangePicker';
export type VariableType = FormType;

interface ITagFilterProps {
  id: string;
  isOpen?: boolean;
  cluster: string;
  editable?: boolean;
  value?: FormType;
  range: Range;
  onChange: (data: FormType, needSave: boolean) => void;
}

export function setVaraiableSelected(name: string, value: string | string[], id: string) {
  if (value === undefined) return;
  localStorage.setItem(`dashboard_${id}_${name}`, JSON.stringify(value));
}

export function getVaraiableSelected(name: string, id: string) {
  const v = localStorage.getItem(`dashboard_${id}_${name}`);
  return v ? JSON.parse(v) : null;
}

const TagFilter: React.ForwardRefRenderFunction<any, ITagFilterProps> = ({ isOpen = false, value, onChange, editable = true, cluster, range, id }, ref) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState<boolean>(isOpen);
  const [varsMap, setVarsMap] = useState<{ string?: string | string[] | undefined }>({});
  const [data, setData] = useState<FormType>();
  const handleEditClose = (v: FormType) => {
    if (v) {
      onChange(v, true);
      setData(v);
    }
    setEditing(false);
  };

  useEffect(() => {
    value && setData(value);
    console.log(value);
  }, [value]);

  const handleVariableChange = (index: number, v: string | string[], options) => {
    const newData = data ? { var: [...data.var] } : { var: [] };
    console.log(newData);
    // newData.var[index].selected = v;
    setVaraiableSelected(newData.var[index].name, v, id);
    setVarsMap((varsMap) => ({ ...varsMap, [`$${newData.var[index].name}`]: v }));
    // options && (newData.var[index].options = options);
    setData(newData);
    onChange(newData, false);
  };

  return (
    <div className='tag-area'>
      <div className={classNames('tag-content', 'tag-content-close')}>
        {data?.var && data?.var.length > 0 && (
          <>
            {data.var.map((expression, index) => (
              <DisplayItem
                expression={expression}
                index={index}
                data={data.var}
                onChange={handleVariableChange}
                cluster={cluster}
                range={range}
                key={index}
                id={id}
                varsMap={varsMap}
              ></DisplayItem>
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
      <EditItem visible={editing} onChange={handleEditClose} value={data} range={range} id={id} />
    </div>
  );
};

export default React.forwardRef(TagFilter);
