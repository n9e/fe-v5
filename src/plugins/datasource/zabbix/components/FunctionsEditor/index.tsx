import React from 'react';
import { Cascader, Button } from 'antd';
import _ from 'lodash';
import { arrayMoveImmutable } from 'array-move';
import { SortableContainer } from 'react-sortable-hoc';
import { options, findDefByName } from './functions';
import Function from './Function';
import { FuncValue } from '../../types';
import './style.less';

interface IProps {
  value?: FuncValue[];
  onChange?: (funcValue: FuncValue[]) => void;
}

const SortableBody = SortableContainer(({ children }) => <div className='n9e-plugin-zabbix-builder-functions'>{children}</div>);

export default function index(props: IProps) {
  const { value = [], onChange } = props;

  return (
    <div className='n9e-plugin-zabbix-builder-functions-container'>
      <div className='n9e-plugin-zabbix-builder-functions'>
        {!_.isEmpty(value) && (
          <SortableBody
            useDragHandle
            axis='x'
            helperClass='row-dragging'
            onSortEnd={({ oldIndex, newIndex }) => {
              const newFunctions = arrayMoveImmutable(value, oldIndex, newIndex);
              onChange && onChange(newFunctions);
            }}
          >
            {_.map(value, (funcValue, index) => {
              const funcDef = findDefByName(funcValue.name);
              if (funcDef) {
                return (
                  <Function
                    key={`${funcValue.name}_${index}`}
                    index={index}
                    funcDef={funcDef}
                    value={funcValue}
                    onChange={(val) => {
                      const newFuncValue = [...value];
                      newFuncValue[index] = val;
                      onChange && onChange(newFuncValue);
                    }}
                    onRemove={() => {
                      const newFuncValue = [...value];
                      newFuncValue.splice(index, 1);
                      onChange && onChange(newFuncValue);
                    }}
                  />
                );
              }
            })}
          </SortableBody>
        )}
        <Cascader
          value={[]}
          options={options as any}
          onChange={(val) => {
            const name = _.last(val);
            const funcDef = findDefByName(name);
            if (funcDef) {
              onChange &&
                onChange([
                  ...value,
                  {
                    name: funcDef.name,
                    params: funcDef.defaultParams || [],
                  },
                ]);
            }
          }}
        >
          <Button>添加聚合函数</Button>
        </Cascader>
      </div>
    </div>
  );
}
