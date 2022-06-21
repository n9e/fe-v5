import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { EditOutlined } from '@ant-design/icons';
import { Range } from '@/components/DateRangePicker';
import { convertExpressionToQuery, replaceExpressionVars } from './constant';
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
  range: Range;
  onChange: (data: IVariable[], needSave: boolean, options?: IVariable[]) => void;
  onOpenFire?: () => void;
}

function index(props: IProps) {
  const { id, cluster, editable = true, value, range, onChange, onOpenFire } = props;
  const [editing, setEditing] = useState<boolean>(false);
  const [data, setData] = useState<IVariable[]>([]);

  useEffect(() => {
    if (value) {
      const result: IVariable[] = [];
      (async () => {
        for (let idx = 0; idx < value.length; idx++) {
          const item = _.cloneDeep(value[idx]);
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
  }, [JSON.stringify(value), cluster]);

  return (
    <div className='tag-area'>
      <div className={classNames('tag-content', 'tag-content-close')}>
        {_.map(data, (expression) => {
          return <DisplayItem key={expression.name} id={expression} expression={expression} />;
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
