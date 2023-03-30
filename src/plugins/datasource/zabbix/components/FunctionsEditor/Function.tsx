import React from 'react';
import { Select, Input, AutoComplete } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { SortableElement, SortableHandle } from 'react-sortable-hoc';
import { FuncDef, FuncValue } from '../../types';

interface IProps {
  index: number;
  value: FuncValue;
  onChange: (funcValue: FuncValue) => void;
  funcDef: FuncDef;
  onRemove: () => void;
}

const SortableItem = SortableElement(({ children }) => <div>{children}</div>);
const DragHandle = SortableHandle(({ children }) => <div className='n9e-plugin-zabbix-builder-function-handler'>{children}</div>);
function renderOperationParamEditor(paramDef: FuncDef['params'][number], value: string | number, onChange: (val: string | number) => void): React.ReactNode {
  if (paramDef.options) {
    if (paramDef.type === 'string') {
      return (
        <Select
          size='small'
          style={{ width: '100%' }}
          value={value as string | number}
          onChange={(val) => {
            onChange(val);
          }}
        >
          {_.map(paramDef.options, (option: any) => {
            return (
              <Select.Option key={option} value={option}>
                {option}
              </Select.Option>
            );
          })}
        </Select>
      );
    } else {
      return (
        <AutoComplete
          options={_.map(paramDef.options, (option: any) => {
            return {
              value: option,
            };
          })}
          size='small'
          style={{ width: '100%' }}
          value={value as string}
          onChange={(val) => {
            onChange(val);
          }}
        />
      );
    }
  }

  return (
    <Input
      size='small'
      value={value as string}
      onChange={(e) => {
        onChange(e.target.value);
      }}
    />
  );
}

export default function Operation(props: IProps) {
  const { value, onChange, funcDef, onRemove, index } = props;
  const operationElements: React.ReactNode[] = [];

  for (let paramIndex = 0; paramIndex < funcDef.params.length; paramIndex++) {
    const paramDef = funcDef.params[Math.min(funcDef.params.length - 1, paramIndex)];

    operationElements.push(
      <div key={paramIndex - 1} className='n9e-plugin-zabbix-builder-function-param'>
        <div className='n9e-plugin-zabbix-builder-function-param-value'>
          {renderOperationParamEditor(paramDef, value.params[paramIndex], (val) => {
            onChange({
              name: funcDef.name,
              params: [...value.params.slice(0, paramIndex), val, ...value.params.slice(paramIndex + 1)],
            });
          })}
        </div>
      </div>,
    );
  }

  if (!funcDef) {
    return null;
  }
  return (
    <SortableItem key={funcDef.name} index={index}>
      <div className='n9e-plugin-zabbix-builder-function'>
        <div className='n9e-plugin-zabbix-builder-function-header'>
          <DragHandle>{funcDef.name}</DragHandle>
          <CloseCircleOutlined
            onClick={() => {
              onRemove();
            }}
          />
        </div>
        <div className='n9e-plugin-zabbix-builder-function-content'>
          {operationElements}
          {_.isEmpty(funcDef.params) && <div>无参数</div>}
        </div>
      </div>
    </SortableItem>
  );
}
