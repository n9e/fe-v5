import { PromVisualQuery, QueryBuilderOperationDef, PromVisualQueryOperation, QueryWithOperations } from '../../types';

export function defaultAddOperationHandler<T extends QueryWithOperations>(def: QueryBuilderOperationDef, query: T) {
  const newOperation: PromVisualQueryOperation = {
    id: def.id,
    params: def.defaultParams,
  };

  return {
    ...query,
    operations: [...query.operations, newOperation],
  };
}

export function addOperationWithRangeVector(def: QueryBuilderOperationDef, query: PromVisualQuery, firstOp: QueryBuilderOperationDef) {
  const newOperation: PromVisualQueryOperation = {
    id: def.id,
    params: def.defaultParams,
  };

  if (query.operations.length > 0) {
    if (firstOp.addOperationHandler === addOperationWithRangeVector) {
      return {
        ...query,
        operations: [newOperation, ...query.operations.slice(1)],
      };
    }
  }

  return {
    ...query,
    operations: [newOperation, ...query.operations],
  };
}

export function labelJoinAddOperationHandler<T extends QueryWithOperations>(def: QueryBuilderOperationDef, query: T) {
  const newOperation: PromVisualQueryOperation = {
    id: def.id,
    params: def.defaultParams,
  };

  return {
    ...query,
    operations: [...query.operations, newOperation],
  };
}
