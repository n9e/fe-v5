import _ from 'lodash';
import {
  PromVisualQuery,
  PromVisualQueryOperationCategory,
  QueryBuilderOperationDef,
  PromVisualQueryOperationId,
  QueryBuilderOperationParamDef,
  VisualQueryOperationParamValue,
  PromVisualQueryOperation,
  QueryWithOperations,
} from '../types';

export function getOperationDefinitions(): QueryBuilderOperationDef[] {
  const list: QueryBuilderOperationDef[] = [
    ...createAggregationOperation(PromVisualQueryOperationId.Sum),
    ...createAggregationOperation(PromVisualQueryOperationId.Avg),
    ...createAggregationOperation(PromVisualQueryOperationId.Min),
    ...createAggregationOperation(PromVisualQueryOperationId.Max),
    ...createAggregationOperation(PromVisualQueryOperationId.Count),
    createRangeFunction(PromVisualQueryOperationId.Changes),
    createRangeFunction(PromVisualQueryOperationId.Rate),
    createRangeFunction(PromVisualQueryOperationId.Irate),
    createRangeFunction(PromVisualQueryOperationId.Increase),
    createRangeFunction(PromVisualQueryOperationId.Idelta),
    createRangeFunction(PromVisualQueryOperationId.Delta),
    createFunction({
      id: PromVisualQueryOperationId.HoltWinters,
      params: [getRangeVectorParamDef(), { name: 'Smoothing Factor', type: 'number' }, { name: 'Trend Factor', type: 'number' }],
      defaultParams: ['5m', 0.5, 0.5],
      alternativesKey: 'range function',
      category: PromVisualQueryOperationCategory.RangeFunctions,
      renderer: rangeRendererRightWithParams,
      addOperationHandler: addOperationWithRangeVector,
      changeTypeHandler: operationTypeChangedHandlerForRangeFunction,
    }),
    createFunction({
      id: PromVisualQueryOperationId.PredictLinear,
      params: [getRangeVectorParamDef(), { name: 'Seconds from now', type: 'number' }],
      defaultParams: ['5m', 60],
      alternativesKey: 'range function',
      category: PromVisualQueryOperationCategory.RangeFunctions,
      renderer: rangeRendererRightWithParams,
      addOperationHandler: addOperationWithRangeVector,
      changeTypeHandler: operationTypeChangedHandlerForRangeFunction,
    }),
    createFunction({
      id: PromVisualQueryOperationId.QuantileOverTime,
      params: [getRangeVectorParamDef(), { name: 'Quantile', type: 'number' }],
      defaultParams: ['5m', 0.5],
      alternativesKey: 'overtime function',
      category: PromVisualQueryOperationCategory.RangeFunctions,
      renderer: rangeRendererLeftWithParams,
      addOperationHandler: addOperationWithRangeVector,
      changeTypeHandler: operationTypeChangedHandlerForRangeFunction,
    }),
    {
      id: 'arithmetic_binary_operators',
      name: 'Arithmetic binary operators',
      params: [
        {
          name: 'Operator',
          type: 'string',
          options: _.map(['+', '-', '*', '/', '%', '^'], (item) => {
            return {
              label: item,
              value: item,
            };
          }),
        },
        { name: 'Value', type: 'number' },
      ],
      defaultParams: ['+', 2],
      alternativesKey: 'binary scalar operations',
      category: PromVisualQueryOperationCategory.BinaryOps,
      renderer: getSimpleBinaryRenderer,
      addOperationHandler: defaultAddOperationHandler,
    },
    {
      id: 'comparison_binary_operators',
      name: 'Comparison binary operators',
      params: [
        {
          name: 'Operator',
          type: 'string',
          options: _.map(['==', '!=', '>', '<', '>=', '<='], (item) => {
            return {
              label: item,
              value: item,
            };
          }),
        },
        { name: 'Value', type: 'number' },
        { name: 'Bool', type: 'boolean' },
      ],
      defaultParams: ['==', 2, false],
      alternativesKey: 'binary scalar operations',
      category: PromVisualQueryOperationCategory.BinaryOps,
      renderer: getSimpleBinaryRenderer,
      addOperationHandler: defaultAddOperationHandler,
    },
    {
      id: PromVisualQueryOperationId.NestedQuery,
      name: 'Binary operation with query',
      params: [],
      defaultParams: [],
      category: PromVisualQueryOperationCategory.BinaryOps,
      renderer: (model, def, innerExpr) => innerExpr,
      addOperationHandler: addNestedQueryHandler,
    },
    createFunction({ id: PromVisualQueryOperationId.Absent }),
    createFunction({
      id: PromVisualQueryOperationId.Acos,
      category: PromVisualQueryOperationCategory.Trigonometric,
    }),
    createFunction({
      id: PromVisualQueryOperationId.Acosh,
      category: PromVisualQueryOperationCategory.Trigonometric,
    }),
    createFunction({
      id: PromVisualQueryOperationId.Asin,
      category: PromVisualQueryOperationCategory.Trigonometric,
    }),
    createFunction({
      id: PromVisualQueryOperationId.Asinh,
      category: PromVisualQueryOperationCategory.Trigonometric,
    }),
    createFunction({
      id: PromVisualQueryOperationId.Atan,
      category: PromVisualQueryOperationCategory.Trigonometric,
    }),
    createFunction({
      id: PromVisualQueryOperationId.Atanh,
      category: PromVisualQueryOperationCategory.Trigonometric,
    }),
    createFunction({ id: PromVisualQueryOperationId.Ceil }),
    createFunction({
      id: PromVisualQueryOperationId.Clamp,
      name: 'Clamp',
      params: [
        { name: 'Minimum Scalar', type: 'number' },
        { name: 'Maximum Scalar', type: 'number' },
      ],
      defaultParams: [1, 1],
    }),

    createFunction({
      id: PromVisualQueryOperationId.ClampMax,
      params: [{ name: 'Maximum Scalar', type: 'number' }],
      defaultParams: [1],
    }),
    createFunction({
      id: PromVisualQueryOperationId.ClampMin,
      params: [{ name: 'Minimum Scalar', type: 'number' }],
      defaultParams: [1],
    }),
    createFunction({
      id: PromVisualQueryOperationId.Cos,
      category: PromVisualQueryOperationCategory.Trigonometric,
    }),
    createFunction({
      id: PromVisualQueryOperationId.Cosh,
      category: PromVisualQueryOperationCategory.Trigonometric,
    }),
    createFunction({
      id: PromVisualQueryOperationId.DayOfMonth,
      category: PromVisualQueryOperationCategory.Time,
    }),
    createFunction({
      id: PromVisualQueryOperationId.DayOfWeek,
      category: PromVisualQueryOperationCategory.Time,
    }),
    createFunction({
      id: PromVisualQueryOperationId.DaysInMonth,
      category: PromVisualQueryOperationCategory.Time,
    }),
    createFunction({ id: PromVisualQueryOperationId.Deg }),
    createRangeFunction(PromVisualQueryOperationId.Deriv),
    //
    createFunction({ id: PromVisualQueryOperationId.Exp }),
    createFunction({ id: PromVisualQueryOperationId.Floor }),
    createFunction({ id: PromVisualQueryOperationId.Group }),
    createFunction({ id: PromVisualQueryOperationId.Hour }),
    createFunction({
      id: PromVisualQueryOperationId.LabelJoin,
      params: [
        {
          name: 'Destination Label',
          type: 'string',
          subType: 'labelNameSelect',
        },
        {
          name: 'Separator',
          type: 'string',
        },
        {
          name: 'Source Label',
          type: 'string',
          restParam: true,
          optional: true,
          subType: 'labelNameSelect',
        },
      ],
      defaultParams: ['', ',', ''],
      renderer: labelJoinRenderer,
      addOperationHandler: labelJoinAddOperationHandler,
    }),
    createFunction({ id: PromVisualQueryOperationId.Log10 }),
    createFunction({ id: PromVisualQueryOperationId.Log2 }),
    createFunction({ id: PromVisualQueryOperationId.Minute }),
    createFunction({ id: PromVisualQueryOperationId.Month }),
    createFunction({
      id: PromVisualQueryOperationId.Pi,
      renderer: (model) => `${model.id}()`,
    }),
    createFunction({
      id: PromVisualQueryOperationId.Quantile,
      params: [{ name: 'Value', type: 'number' }],
      defaultParams: [1],
      renderer: functionRendererLeft,
    }),
    createFunction({ id: PromVisualQueryOperationId.Rad }),
    createRangeFunction(PromVisualQueryOperationId.Resets),
    createFunction({
      id: PromVisualQueryOperationId.Round,
      category: PromVisualQueryOperationCategory.Functions,
      params: [{ name: 'To Nearest', type: 'number' }],
      defaultParams: [1],
    }),
    createFunction({ id: PromVisualQueryOperationId.Scalar }),
    createFunction({ id: PromVisualQueryOperationId.Sgn }),
    createFunction({ id: PromVisualQueryOperationId.Sin, category: PromVisualQueryOperationCategory.Trigonometric }),
    createFunction({
      id: PromVisualQueryOperationId.Sinh,
      category: PromVisualQueryOperationCategory.Trigonometric,
    }),
    createFunction({ id: PromVisualQueryOperationId.Sort }),
    createFunction({ id: PromVisualQueryOperationId.SortDesc }),
    createFunction({ id: PromVisualQueryOperationId.Sqrt }),
    createFunction({ id: PromVisualQueryOperationId.Stddev }),
    createFunction({
      id: PromVisualQueryOperationId.Tan,
      category: PromVisualQueryOperationCategory.Trigonometric,
    }),
    createFunction({
      id: PromVisualQueryOperationId.Tanh,
      category: PromVisualQueryOperationCategory.Trigonometric,
    }),
    createFunction({
      id: PromVisualQueryOperationId.Time,
      renderer: (model) => `${model.id}()`,
    }),
    createFunction({ id: PromVisualQueryOperationId.Timestamp }),
    createFunction({
      id: PromVisualQueryOperationId.Vector,
      params: [{ name: 'Value', type: 'number' }],
      defaultParams: [1],
      renderer: (model) => `${model.id}(${model.params[0]})`,
    }),
    createFunction({ id: PromVisualQueryOperationId.Year }),
  ];

  return list;
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

export function createFunction(definition: Partial<QueryBuilderOperationDef>): QueryBuilderOperationDef {
  return {
    ...definition,
    id: definition.id!,
    name: definition.name ?? getPromOperationDisplayName(definition.id!),
    params: definition.params ?? [],
    defaultParams: definition.defaultParams ?? [],
    category: definition.category ?? PromVisualQueryOperationCategory.Functions,
    renderer: definition.renderer ?? (definition.params ? functionRendererRight : functionRendererLeft),
    addOperationHandler: definition.addOperationHandler ?? defaultAddOperationHandler,
  };
}

export function createRangeFunction(name: string): QueryBuilderOperationDef {
  return {
    id: name,
    name: getPromOperationDisplayName(name),
    params: [getRangeVectorParamDef()],
    defaultParams: ['5m'],
    alternativesKey: 'range function',
    category: PromVisualQueryOperationCategory.RangeFunctions,
    renderer: operationWithRangeVectorRenderer,
    addOperationHandler: addOperationWithRangeVector,
    changeTypeHandler: operationTypeChangedHandlerForRangeFunction,
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

function getAggregationByRenderer(aggregation: string) {
  return function aggregationRenderer(model: PromVisualQueryOperation, def: QueryBuilderOperationDef, innerExpr: string) {
    return `${aggregation} by(${model.params.join(', ')}) (${innerExpr})`;
  };
}

function getAggregationWithoutRenderer(aggregation: string) {
  return function aggregationRenderer(model: PromVisualQueryOperation, def: QueryBuilderOperationDef, innerExpr: string) {
    return `${aggregation} without(${model.params.join(', ')}) (${innerExpr})`;
  };
}

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

export function getPromOperationDisplayName(funcName: string) {
  return _.capitalize(funcName.replace(/_/g, ' '));
}

function rangeRendererWithParams(model: PromVisualQueryOperation, def: QueryBuilderOperationDef, innerExpr: string, renderLeft: boolean) {
  if (def.params.length < 2) {
    throw `Cannot render a function with params of length [${def.params.length}]`;
  }

  let rangeVector = (model.params ?? [])[0] ?? '5m';

  const params = renderParams(
    {
      ...model,
      params: model.params.slice(1),
    },
    {
      ...def,
      params: def.params.slice(1),
      defaultParams: def.defaultParams.slice(1),
    },
    innerExpr,
  );

  const str = model.id + '(';

  if (innerExpr) {
    renderLeft ? params.push(`${innerExpr}[${rangeVector}]`) : params.unshift(`${innerExpr}[${rangeVector}]`);
  }

  return str + params.join(', ') + ')';
}

export function rangeRendererRightWithParams(model: PromVisualQueryOperation, def: QueryBuilderOperationDef, innerExpr: string) {
  return rangeRendererWithParams(model, def, innerExpr, false);
}

export function rangeRendererLeftWithParams(model: PromVisualQueryOperation, def: QueryBuilderOperationDef, innerExpr: string) {
  return rangeRendererWithParams(model, def, innerExpr, true);
}

function renderParams(model: PromVisualQueryOperation, def: QueryBuilderOperationDef, innerExpr: string) {
  return (model.params ?? []).map((value, index) => {
    const paramDef = def.params[index];
    if (paramDef.type === 'string') {
      return '"' + value + '"';
    }

    return value;
  });
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

function operationTypeChangedHandlerForRangeFunction(operation: PromVisualQueryOperation, newDef: QueryBuilderOperationDef) {
  if (operation.params[0] === '$__rate_interval' && newDef.defaultParams[0] !== '$__rate_interval') {
    operation.params = newDef.defaultParams;
  } else if (operation.params[0] === '$__interval' && newDef.defaultParams[0] !== '$__interval') {
    operation.params = newDef.defaultParams;
  }

  return operation;
}

function addNestedQueryHandler(def: QueryBuilderOperationDef, query: PromVisualQuery): PromVisualQuery {
  return {
    ...query,
    binaryQueries: [
      ...(query.binaryQueries ?? []),
      {
        operator: '/',
        query,
      },
    ],
  };
}

function labelJoinRenderer(model: PromVisualQueryOperation, def: QueryBuilderOperationDef, innerExpr: string) {
  if (typeof model.params[1] !== 'string') {
    throw 'The separator must be a string';
  }
  const separator = `"${model.params[1]}"`;
  return `${model.id}(${innerExpr}, "${model.params[0]}", ${separator}, "${model.params.slice(2).join(separator)}")`;
}

function labelJoinAddOperationHandler<T extends QueryWithOperations>(def: QueryBuilderOperationDef, query: T) {
  const newOperation: PromVisualQueryOperation = {
    id: def.id,
    params: def.defaultParams,
  };

  return {
    ...query,
    operations: [...query.operations, newOperation],
  };
}

export function functionRendererLeft(model: PromVisualQueryOperation, def: QueryBuilderOperationDef, innerExpr: string) {
  const params = renderParams(model, def, innerExpr);
  const str = model.id + '(';

  if (innerExpr) {
    params.push(innerExpr);
  }

  return str + params.join(', ') + ')';
}

export function functionRendererRight(model: PromVisualQueryOperation, def: QueryBuilderOperationDef, innerExpr: string) {
  const params = renderParams(model, def, innerExpr);
  const str = model.id + '(';

  if (innerExpr) {
    params.unshift(innerExpr);
  }

  return str + params.join(', ') + ')';
}

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

export function operationWithRangeVectorRenderer(model: PromVisualQueryOperation, def: QueryBuilderOperationDef, innerExpr: string) {
  let rangeVector = (model.params ?? [])[0] ?? '5m';
  return `${def.id}(${innerExpr}[${rangeVector}])`;
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

function getSimpleBinaryRenderer(model: PromVisualQueryOperation, def: QueryBuilderOperationDef, innerExpr: string) {
  let operator = model.params[0];
  let param = model.params[1];
  let bool = '';
  if (model.params.length === 3) {
    bool = model.params[2] ? ' bool' : '';
  }

  return `${innerExpr} ${operator}${bool} ${param}`;
}
