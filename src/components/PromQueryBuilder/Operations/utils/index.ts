import _ from 'lodash';
import { PromVisualQuery, PromVisualQueryOperationCategory, QueryBuilderOperationDef, PromVisualQueryOperationId, QueryBuilderOperationParamDef } from '../../types';
import { createAggregationOperation, createAggregationOperationWithParam, createAggregationOverTime } from './createAggregationOperation';
import { createRangeFunction } from './createRangeFunction';
import { createFunction } from './createFunction';
import { rangeRendererRightWithParams, rangeRendererLeftWithParams, functionRendererLeft, labelJoinRenderer, getSimpleBinaryRenderer } from './renderer';
import { addOperationWithRangeVector, labelJoinAddOperationHandler, defaultAddOperationHandler } from './addOperationHandler';

export const arithmeticBinaryOperators = ['+', '-', '*', '/', '%', '^'];
export const comparisonBinaryOperators = ['==', '!=', '>', '<', '>=', '<='];

export function getOperationDefinitions(): QueryBuilderOperationDef[] {
  const list: QueryBuilderOperationDef[] = [
    ...createAggregationOperation(PromVisualQueryOperationId.Sum),
    ...createAggregationOperation(PromVisualQueryOperationId.Avg),
    ...createAggregationOperation(PromVisualQueryOperationId.Min),
    ...createAggregationOperation(PromVisualQueryOperationId.Max),
    ...createAggregationOperation(PromVisualQueryOperationId.Count),
    ...createAggregationOperationWithParam(PromVisualQueryOperationId.TopK, {
      params: [{ name: 'K-value', type: 'number' }],
      defaultParams: [5],
    }),
    ...createAggregationOperationWithParam(PromVisualQueryOperationId.BottomK, {
      params: [{ name: 'K-value', type: 'number' }],
      defaultParams: [5],
    }),
    ...createAggregationOperationWithParam(PromVisualQueryOperationId.CountValues, {
      params: [{ name: 'Identifier', type: 'string' }],
      defaultParams: ['count'],
    }),
    createAggregationOverTime(PromVisualQueryOperationId.SumOverTime),
    createAggregationOverTime(PromVisualQueryOperationId.AvgOverTime),
    createAggregationOverTime(PromVisualQueryOperationId.MinOverTime),
    createAggregationOverTime(PromVisualQueryOperationId.MaxOverTime),
    createAggregationOverTime(PromVisualQueryOperationId.CountOverTime),
    createAggregationOverTime(PromVisualQueryOperationId.LastOverTime),
    createAggregationOverTime(PromVisualQueryOperationId.PresentOverTime),
    createAggregationOverTime(PromVisualQueryOperationId.AbsentOverTime),
    createAggregationOverTime(PromVisualQueryOperationId.StddevOverTime),
    {
      id: PromVisualQueryOperationId.ArithmeticBinary,
      name: 'Arithmetic',
      params: [
        {
          name: 'Operator',
          type: 'string',
          options: _.map(arithmeticBinaryOperators, (item) => {
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
      id: PromVisualQueryOperationId.ComparisonBinary,
      name: 'Comparison',
      params: [
        {
          name: 'Operator',
          type: 'string',
          options: _.map(comparisonBinaryOperators, (item) => {
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
      category: PromVisualQueryOperationCategory.Functions,
      renderer: rangeRendererRightWithParams,
      addOperationHandler: addOperationWithRangeVector,
    }),
    createFunction({
      id: PromVisualQueryOperationId.PredictLinear,
      params: [getRangeVectorParamDef(), { name: 'Seconds from now', type: 'number' }],
      defaultParams: ['5m', 60],
      alternativesKey: 'range function',
      category: PromVisualQueryOperationCategory.Functions,
      renderer: rangeRendererRightWithParams,
      addOperationHandler: addOperationWithRangeVector,
    }),
    createFunction({
      id: PromVisualQueryOperationId.QuantileOverTime,
      params: [getRangeVectorParamDef(), { name: 'Quantile', type: 'number' }],
      defaultParams: ['5m', 0.5],
      alternativesKey: 'overtime function',
      category: PromVisualQueryOperationCategory.Functions,
      renderer: rangeRendererLeftWithParams,
      addOperationHandler: addOperationWithRangeVector,
    }),
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
      category: PromVisualQueryOperationCategory.Functions,
    }),
    createFunction({
      id: PromVisualQueryOperationId.DayOfWeek,
      category: PromVisualQueryOperationCategory.Functions,
    }),
    createFunction({
      id: PromVisualQueryOperationId.DaysInMonth,
      category: PromVisualQueryOperationCategory.Functions,
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

export function getPromOperationDisplayName(funcName: string) {
  return _.capitalize(funcName.replace(/_/g, ' '));
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
