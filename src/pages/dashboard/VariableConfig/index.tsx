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
import React, { useState, useEffect } from 'react';
import { EditOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Range } from '@/components/DateRangePicker';
import DisplayItem from './DisplayItem';
import EditItem, { FormType } from './EditItem';
import './index.less';
export type VariableType = FormType;

interface ITagFilterProps {
  id: string;
  isOpen?: boolean;
  cluster: string;
  editable?: boolean;
  value?: FormType;
  range: Range;
  onChange: (data: FormType, needSave: boolean, options?: FormType) => void;
  onOpenFire?: () => void;
}

export function setVaraiableSelected(name: string, value: string | string[], id: string) {
  if (value === undefined) return;
  localStorage.setItem(`dashboard_${id}_${name}`, JSON.stringify(value));
}

export function getVaraiableSelected(name: string, id: string) {
  const v = localStorage.getItem(`dashboard_${id}_${name}`);
  return v ? JSON.parse(v) : null;
}

const TagFilter: React.ForwardRefRenderFunction<any, ITagFilterProps> = ({ isOpen = false, value, onChange, editable = true, cluster, range, id, onOpenFire }, ref) => {
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
  }, [value]);

  const handleVariableChange = (index: number, v: string | string[], options) => {
    const newData = data ? { var: _.cloneDeep(data.var) } : { var: [] };
    const newDataWithOptions = data ? { var: _.cloneDeep(data.var) } : { var: [] };
    setVaraiableSelected(newData.var[index].name, v, id);
    setVarsMap((varsMap) => ({ ...varsMap, [`$${newData.var[index].name}`]: v }));
    options && (newDataWithOptions.var[index].options = options);
    setData(newData);
    onChange(newData, false, newDataWithOptions);
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
            {editable && (
              <EditOutlined
                className='icon'
                onClick={() => {
                  setEditing(true);
                  onOpenFire && onOpenFire();
                }}
              ></EditOutlined>
            )}
          </>
        )}
        {(data ? data?.var?.length === 0 : true) && editable && (
          <div
            className='add-variable-tips'
            onClick={() => {
              setEditing(true);
              onOpenFire && onOpenFire();
            }}
          >
            {t('添加大盘变量')}
          </div>
        )}
      </div>
      <EditItem visible={editing} onChange={handleEditClose} value={data} range={range} id={id} />
    </div>
  );
};

export default React.forwardRef(TagFilter);
