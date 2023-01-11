import _ from 'lodash';
import {
  PromVisualQueryOperationCategory,
  QueryBuilderOperationDef,
  QueryBuilderOperationParamDef,
  VisualQueryOperationParamValue,
  PromVisualQueryOperation,
  QueryWithOperations,
} from '../../types';
import { getPromOperationDisplayName, getRangeVectorParamDef } from './index';
import { functionRendererLeft, getAggregationByRenderer, getAggregationWithoutRenderer, operationWithRangeVectorRenderer } from './renderer';
import { defaultAddOperationHandler, addOperationWithRangeVector } from './addOperationHandler';

export function createAggregationOperation<T extends QueryWithOperations>(name: string, overrides: Partial<QueryBuilderOperationDef> = {}): QueryBuilderOperationDef[] {
  const operations: QueryBuilderOperationDef[] = [
    {
      id: name,
      name: getPromOperationDisplayName(name),
      params: [
        {
          name: 'By label',
          type: 'string',
          restParam: true,
          optional: true,
        },
      ],
      defaultParams: [],
      alternativesKey: 'plain aggregations',
      category: PromVisualQueryOperationCategory.Aggregations,
      renderer: functionRendererLeft,
      paramChangedHandler: getOnLabelAddedHandler(`__${name}_by`),
      addOperationHandler: defaultAddOperationHandler,
      ...overrides,
    },
    {
      id: `__${name}_by`,
      name: `${getPromOperationDisplayName(name)} by`,
      params: [
        {
          name: 'Label',
          type: 'string',
          restParam: true,
          optional: true,
          subType: 'labelNameSelect',
        },
      ],
      defaultParams: [''],
      alternativesKey: 'aggregations by',
      category: PromVisualQueryOperationCategory.Aggregations,
      renderer: getAggregationByRenderer(name),
      paramChangedHandler: getLastLabelRemovedHandler(name),
      addOperationHandler: defaultAddOperationHandler,
      hideFromList: true,
      ...overrides,
    },
    {
      id: `__${name}_without`,
      name: `${getPromOperationDisplayName(name)} without`,
      params: [
        {
          name: 'Label',
          type: 'string',
          restParam: true,
          optional: true,
          subType: 'labelNameSelect',
        },
      ],
      defaultParams: [''],
      alternativesKey: 'aggregations by',
      category: PromVisualQueryOperationCategory.Aggregations,
      renderer: getAggregationWithoutRenderer(name),
      paramChangedHandler: getLastLabelRemovedHandler(name),
      addOperationHandler: defaultAddOperationHandler,
      hideFromList: true,
      ...overrides,
    },
  ];

  return operations;
}

export function getOnLabelAddedHandler(changeToOperationId: string) {
  return function onParamChanged(index: number, op: PromVisualQueryOperation, def: QueryBuilderOperationDef) {
    if (op.params.length === def.params.length) {
      return {
        ...op,
        id: changeToOperationId,
      };
    }
    return op;
  };
}

export function getLastLabelRemovedHandler(changeToOperationId: string) {
  return function onParamChanged(index: number, op: PromVisualQueryOperation, def: QueryBuilderOperationDef) {
    if (op.params.length < def.params.length) {
      return {
        ...op,
        id: changeToOperationId,
      };
    }

    return op;
  };
}

export function createAggregationOperationWithParam(
  name: string,
  paramsDef: { params: QueryBuilderOperationParamDef[]; defaultParams: VisualQueryOperationParamValue[] },
  overrides: Partial<QueryBuilderOperationDef> = {},
): QueryBuilderOperationDef[] {
  const operations = createAggregationOperation(name, overrides);
  operations[0].params.unshift(...paramsDef.params);
  operations[1].params.unshift(...paramsDef.params);
  operations[2].params.unshift(...paramsDef.params);
  operations[0].defaultParams = paramsDef.defaultParams;
  operations[1].defaultParams = [...paramsDef.defaultParams, ''];
  operations[2].defaultParams = [...paramsDef.defaultParams, ''];
  operations[1].renderer = getAggregationByRendererWithParameter(name);
  operations[2].renderer = getAggregationByRendererWithParameter(name);
  return operations;
}

function getAggregationByRendererWithParameter(aggregation: string) {
  return function aggregationRenderer(model: PromVisualQueryOperation, def: QueryBuilderOperationDef, innerExpr: string) {
    const restParamIndex = def.params.findIndex((param) => param.restParam);
    const params = model.params.slice(0, restParamIndex);
    const restParams = model.params.slice(restParamIndex);

    return `${aggregation} by(${restParams.join(', ')}) (${params.map((param, idx) => (def.params[idx].type === 'string' ? `\"${param}\"` : param)).join(', ')}, ${innerExpr})`;
  };
}

export function createAggregationOverTime(name: string): QueryBuilderOperationDef {
  return {
    id: name,
    name: getPromOperationDisplayName(name),
    params: [getRangeVectorParamDef()],
    defaultParams: ['5m'],
    alternativesKey: 'overtime function',
    category: PromVisualQueryOperationCategory.Aggregations,
    renderer: operationWithRangeVectorRenderer,
    addOperationHandler: addOperationWithRangeVector,
  };
}
