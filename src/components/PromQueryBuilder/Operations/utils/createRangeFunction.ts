import { PromVisualQueryOperationCategory, QueryBuilderOperationDef, QueryBuilderOperationParamDef } from '../../types';
import { getPromOperationDisplayName } from './index';
import { operationWithRangeVectorRenderer } from './renderer';
import { addOperationWithRangeVector } from './addOperationHandler';

export function createRangeFunction(name: string): QueryBuilderOperationDef {
  return {
    id: name,
    name: getPromOperationDisplayName(name),
    params: [getRangeVectorParamDef()],
    defaultParams: ['5m'],
    alternativesKey: 'range function',
    category: PromVisualQueryOperationCategory.Functions,
    renderer: operationWithRangeVectorRenderer,
    addOperationHandler: addOperationWithRangeVector,
  };
}

export function getRangeVectorParamDef(): QueryBuilderOperationParamDef {
  const param: QueryBuilderOperationParamDef = {
    name: 'Range',
    type: 'string',
    options: [
      { label: '1m', value: '1m' },
      { label: '5m', value: '5m' },
      { label: '10m', value: '10m' },
      { label: '1h', value: '1h' },
      { label: '24h', value: '24h' },
    ],
  };
  return param;
}
