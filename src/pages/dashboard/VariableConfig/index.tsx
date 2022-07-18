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
import _ from 'lodash';
import classNames from 'classnames';
import { EditOutlined } from '@ant-design/icons';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { convertExpressionToQuery, replaceExpressionVars, getVaraiableSelected, setVaraiableSelected, stringToRegex } from './constant';
import { IVariable } from './definition';
import DisplayItem from './DisplayItem';
import EditItem from './EditItem';
import './index.less';
export type { IVariable } from './definition';

interface IProps {
  id: string;
  cluster: string; // 集群变动后需要重新获取数据
  editable?: boolean;
  value?: IVariable[];
  range: IRawTimeRange;
  onChange: (data: IVariable[], needSave: boolean, options?: IVariable[]) => void;
  onOpenFire?: () => void;
}
function attachVariable2Url(key, value) {
  const { protocol, host, pathname, search } = window.location;
  var searchObj = new URLSearchParams(search);
  searchObj.set(key, value);
  var newurl = `${protocol}//${host}${pathname}?${searchObj.toString()}`;
  window.history.replaceState({ path: newurl }, '', newurl);
}

function index(props: IProps) {
  const { id, cluster, editable = true, range, onChange, onOpenFire } = props;
  const [editing, setEditing] = useState<boolean>(false);
  const [data, setData] = useState<IVariable[]>([]);
  const [refreshFlag, setRefreshFlag] = useState<string>(_.uniqueId('refreshFlag_'));
  const value = _.map(props.value, (item) => {
    return {
      ...item,
      type: item.type || 'query',
    };
  });

  useEffect(() => {
    if (value) {
      const result: IVariable[] = [];
      try {
        (async () => {
          for (let idx = 0; idx < value.length; idx++) {
            const item = _.cloneDeep(value[idx]);
            if (item.type === 'query' && item.definition) {
              const definition = idx > 0 ? replaceExpressionVars(item.definition, result, idx, id) : item.definition;
              const options = await convertExpressionToQuery(definition, range);
              const regFilterOptions = _.filter(options, (i) => !!i && (!item.reg || !stringToRegex(item.reg) || (stringToRegex(item.reg) as RegExp).test(i)));
              result[idx] = item;
              result[idx].fullDefinition = definition;
              result[idx].options = regFilterOptions;
              // 当大盘变量值为空时，设置默认值
              const selected = getVaraiableSelected(item.name, id);
              if (selected === null) {
                const head = regFilterOptions?.[0];
                const defaultVal = item.multi ? (head ? [head] : []) : head;
                setVaraiableSelected(item.name, defaultVal, id, true);
              }
            } else if (item.type === 'textbox') {
              result[idx] = item;
              const selected = getVaraiableSelected(item.name, id);
              if (selected === null) {
                setVaraiableSelected(item.name, item.defaultValue, id, true);
              }
            }
          }
          setData(result);
          onChange(value, false, result);
        })();
      } catch (e) {
        console.log(e);
      }
    }
  }, [JSON.stringify(value), cluster, refreshFlag]);

  return (
    <div className='tag-area'>
      <div className={classNames('tag-content', 'tag-content-close')}>
        {_.map(data, (expression) => {
          return (
            <DisplayItem
              key={expression.name}
              id={id}
              expression={expression}
              onChange={() => {
                setRefreshFlag(_.uniqueId('refreshFlag_'));
              }}
            />
          );
        })}
        {editable && (
          <EditOutlined
            className='icon'
            onClick={() => {
              setEditing(true);
              onOpenFire && onOpenFire();
            }}
          />
        )}
        {(data ? data?.length === 0 : true) && editable && (
          <div
            className='add-variable-tips'
            onClick={() => {
              setEditing(true);
              onOpenFire && onOpenFire();
            }}
          >
            添加大盘变量
          </div>
        )}
      </div>
      <EditItem
        visible={editing}
        onChange={(v: IVariable[]) => {
          if (v) {
            onChange(v, true);
            setData(v);
          }
          setEditing(false);
        }}
        value={value}
        range={range}
        id={id}
      />
    </div>
  );
}

export default React.memo(index);
