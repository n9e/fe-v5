import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { Select } from 'antd';
import { Range } from '@/components/DateRangePicker';
import { convertExpressionToQuery, replaceExpressionVars, getVaraiableSelected, setVaraiableSelected } from './constant';
import { IVariable } from './definition';
import DisplayItem from './DisplayItem';

interface IProps {
  id: string;
  isOpen?: boolean; // TODO: 不需要
  cluster: string;
  editable?: boolean;
  value?: IVariable[];
  range: Range;
  onChange: (data: IVariable[], needSave: boolean, options?: IVariable[]) => void;
  onOpenFire?: () => void; // TODO: 不需要
}

const defaultValue = [
  {
    definition: 'tt-fc-dev00.nj, tt-fc-dev02.nj,1',
    name: 'ident',
  },
  {
    definition: "label_values(cpu_usage_idle{ident='$ident'}, cpu)",
    name: 'cpu',
    multi: true,
    allOption: true,
  },
  {
    definition: "label_values(cpu_usage_idle{cpu=~'$cpu'}, ident)",
    name: 'iident',
  },
];

function index(props: IProps) {
  const { id, isOpen, cluster, editable, value, onChange, onOpenFire } = props;
  // range 作为非受控状态，解决大盘自动刷新的时候导致变量组件状态变化
  const [range, setRange] = useState(props.range);
  const [editing, setEditing] = useState<boolean>(false);
  const [data, setData] = useState<IVariable[]>([]);

  useEffect(() => {
    if (value) {
      const result: IVariable[] = [];
      (async () => {
        for (let idx = 0; idx < value.length; idx++) {
          const item = value[idx];
          if (item.definition) {
            const definition = idx > 0 ? replaceExpressionVars(item.definition, result, idx, id) : item.definition;
            const options = await convertExpressionToQuery(definition, range);
            result[idx] = item;
            result[idx].fullDefinition = definition;
            result[idx].options = options;
          }
        }
        setData(result);
        onChange(value, false, result);
      })();
    }
  }, [JSON.stringify(value)]);

  return (
    <div className='tag-area'>
      <div className={classNames('tag-content', 'tag-content-close')}>
        {_.map(data, (expression) => {
          return <DisplayItem key={expression.name} id={expression} expression={expression} />;
        })}
        {/* {editable && (
          <EditOutlined
            className='icon'
            onClick={() => {
              setEditing(true);
              onOpenFire && onOpenFire();
            }}
          />
        )} */}
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
      {/* <EditItem visible={editing} onChange={handleEditClose} value={data} range={range} id={id} /> */}
    </div>
  );
}

export default React.memo(index);
