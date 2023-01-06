import React from 'react';
import { Button, Col, Row, Select, Input, InputNumber, Switch } from 'antd';
import { CloseCircleOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { SortableElement, SortableHandle } from 'react-sortable-hoc';
import { PromVisualQuery, PromVisualQueryOperation, VisualQueryOperationParamValue, QueryBuilderOperationParamDef } from '../types';
import { getOperationDefinitions } from './utils';
import LabelNameSelect from '../LabelFilters/LabelNameSelect';

interface IProps {
  metric?: string;
  datasourceValue: string;
  params: {
    start: number;
    end: number;
  };
  query: PromVisualQuery;
  onChange: (query: PromVisualQuery) => void;
  operation: PromVisualQueryOperation;
  index: number;
}

const SortableItem = SortableElement(({ children }) => <div>{children}</div>);
const DragHandle = SortableHandle(({ children }) => <div className='prom-query-builder-operation-handler'>{children}</div>);
function renderOperationParamEditor(
  paramDef: QueryBuilderOperationParamDef,
  paramEditorProps: any,
  value: VisualQueryOperationParamValue,
  onChange: (val: VisualQueryOperationParamValue) => void,
): React.ReactNode {
  if (paramDef.subType === 'labelNameSelect') {
    return <LabelNameSelect size='small' {...paramEditorProps} style={{ width: '100%' }} />;
  }

  if (paramDef.options) {
    return (
      <Select
        size='small'
        style={{ width: '100%' }}
        value={value as string | number}
        onChange={(val) => {
          onChange(val);
        }}
      >
        {_.map(paramDef.options, (option) => {
          return (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          );
        })}
      </Select>
    );
  }

  switch (paramDef.type) {
    case 'boolean':
      return (
        <Switch
          size='small'
          checked={value as boolean}
          onChange={(checked) => {
            onChange(checked);
          }}
        />
      );
    case 'number':
      return (
        <InputNumber
          style={{ width: '100%' }}
          size='small'
          value={value as number}
          onChange={(val) => {
            onChange(val);
          }}
        />
      );
    case 'string':
    default:
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
}

export default function Operation(props: IProps) {
  const { metric, datasourceValue, params, query, onChange, operation, index } = props;
  const { operations } = query;
  const addOperationOptions = getOperationDefinitions();
  const operationDef = _.find(addOperationOptions, { id: operation.id });

  // let restParam: React.ReactNode | undefined;
  // if (operationDef.params.length > 0) {
  //   const lastParamDef = operationDef.params[operationDef.params.length - 1];
  //   if (lastParamDef.restParam) {
  //     restParam = (
  //       <Button size='small' icon={<PlusOutlined />}>
  //         {lastParamDef.name}
  //       </Button>
  //     );
  //   }
  // }

  if (!operationDef) {
    return null;
  }
  return (
    <SortableItem key={operation.id} index={index}>
      <div className='prom-query-builder-operation'>
        <div className='prom-query-builder-operation-header'>
          <DragHandle>{operationDef.name}</DragHandle>
          <CloseCircleOutlined
            onClick={() => {
              onChange({
                ...query,
                operations: _.filter(operations, (o) => o.id !== operation.id),
              });
            }}
          />
        </div>
        <div className='prom-query-builder-operation-content'>
          {_.map(operationDef.params, (paramDef, idx) => {
            return (
              <div key={idx - 1} className='prom-query-builder-operation-param'>
                {!paramDef.hideName && <div className='prom-query-builder-operation-param-label'>{paramDef.name}</div>}
                <div className='prom-query-builder-operation-param-value'>
                  <Row gutter={8}>
                    <Col flex='auto'>
                      {renderOperationParamEditor(
                        paramDef,
                        {
                          metric,
                          datasourceValue,
                          params,
                          labels: query.labels,
                        },
                        _.get(operation, `params[${idx}]`),
                        (val) => {
                          const newOperations = _.cloneDeep(operations);
                          _.set(newOperations, `[${index}].params[${idx}]`, val);
                          onChange({
                            ...query,
                            operations: newOperations,
                          });
                        },
                      )}
                    </Col>
                    {/* {paramDef.restParam && (operation.params.length > operationDef.params.length || paramDef.optional) && (
                      <Col flex='24px'>
                        <Button
                          size='small'
                          icon={<CloseOutlined />}
                          title={`Remove ${paramDef.name}`}
                          onClick={() => {
                            const newOperation = {
                              ...operation,
                              params: [...operation.params.slice(0, idx), ...operation.params.slice(idx + 1)],
                            };
                            console.log(newOperation);
                            const newOperations = _.cloneDeep(operations);
                            newOperations[index] = newOperation;
                            onChange({
                              ...query,
                              operations: newOperations,
                            });
                          }}
                        />
                      </Col>
                    )} */}
                  </Row>
                </div>
              </div>
            );
          })}
          {/* {restParam} */}
          {_.isEmpty(operationDef.params) && <div>无参数</div>}
        </div>
      </div>
    </SortableItem>
  );
}
