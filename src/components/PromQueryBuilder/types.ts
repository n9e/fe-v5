export enum PromVisualQueryOperationCategory {
  Aggregations = 'Aggregations',
  BinaryOps = 'Binary operations',
  Functions = 'Functions',
  Trigonometric = 'Trigonometric',
}

export interface PromVisualQueryBinary<T> {
  operator: string;
  vectorMatchesType?: 'on' | 'ignoring';
  vectorMatches?: string;
  query: T;
}

export interface PromVisualQueryLabelFilter {
  label: string;
  op: string;
  value: string;
}

export type QueryBuilderOperationRenderer = (model: PromVisualQueryOperation, def: QueryBuilderOperationDef, innerExpr: string) => string;
export type VisualQueryOperationParamValue = string | number | boolean;

export interface PromVisualQueryOperation {
  id: string;
  params: VisualQueryOperationParamValue[];
}

export interface QueryWithOperations {
  operations: PromVisualQueryOperation[];
}

export interface PromVisualQuery {
  metric?: string;
  labels: PromVisualQueryLabelFilter[];
  operations: PromVisualQueryOperation[];
  binaryQueries?: Array<PromVisualQueryBinary<PromVisualQuery>>;
}

export enum PromVisualQueryOperationId {
  Abs = 'abs',
  Absent = 'absent',
  AbsentOverTime = 'absent_over_time',
  Acos = 'acos',
  Acosh = 'acosh',
  Asin = 'asin',
  Asinh = 'asinh',
  Atan = 'atan',
  Atanh = 'atanh',
  Avg = 'avg',
  AvgOverTime = 'avg_over_time',
  BottomK = 'bottomk',
  Ceil = 'ceil',
  Changes = 'changes',
  Clamp = 'clamp',
  ClampMax = 'clamp_max',
  ClampMin = 'clamp_min',
  Cos = 'cos',
  Cosh = 'cosh',
  Count = 'count',
  CountOverTime = 'count_over_time',
  CountScalar = 'count_scalar',
  CountValues = 'count_values',
  DayOfMonth = 'day_of_month',
  DayOfWeek = 'day_of_week',
  DaysInMonth = 'days_in_month',
  Deg = 'deg',
  Delta = 'delta',
  Deriv = 'deriv',
  DropCommonLabels = 'drop_common_labels',
  Exp = 'exp',
  Floor = 'floor',
  Group = 'group',
  HistogramQuantile = 'histogram_quantile',
  HoltWinters = 'holt_winters',
  Hour = 'hour',
  Idelta = 'idelta',
  Increase = 'increase',
  Irate = 'irate',
  LabelJoin = 'label_join',
  LabelReplace = 'label_replace',
  Last = 'last',
  LastOverTime = 'last_over_time',
  Ln = 'ln',
  Log10 = 'log10',
  Log2 = 'log2',
  Max = 'max',
  MaxOverTime = 'max_over_time',
  Min = 'min',
  MinOverTime = 'min_over_time',
  Minute = 'minute',
  Month = 'month',
  Pi = 'pi',
  PredictLinear = 'predict_linear',
  Present = 'present',
  PresentOverTime = 'present_over_time',
  Quantile = 'quantile',
  QuantileOverTime = 'quantile_over_time',
  Rad = 'rad',
  Rate = 'rate',
  Resets = 'resets',
  Round = 'round',
  Scalar = 'scalar',
  Sgn = 'sgn',
  Sin = 'sin',
  Sinh = 'sinh',
  Sort = 'sort',
  SortDesc = 'sort_desc',
  Sqrt = 'sqrt',
  Stddev = 'stddev',
  StddevOverTime = 'stddev_over_time',
  Sum = 'sum',
  SumOverTime = 'sum_over_time',
  Tan = 'tan',
  Tanh = 'tanh',
  Time = 'time',
  Timestamp = 'timestamp',
  TopK = 'topk',
  Vector = 'vector',
  Year = 'year',
  ArithmeticBinary = '__arithmetic_binary_operators',
  ComparisonBinary = '__comparison_binary_operators',
  NestedQuery = '__nested_query',
}

export interface QueryBuilderOperationDef<T = any> {
  id: string;
  name: string;
  description?: string;
  documentation?: string;
  params: QueryBuilderOperationParamDef[];
  defaultParams: VisualQueryOperationParamValue[];
  category: string;
  hideFromList?: boolean;
  alternativesKey?: string;
  orderRank?: number;
  renderer: QueryBuilderOperationRenderer;
  addOperationHandler: QueryBuilderAddOperationHandler<T>;
  paramChangedHandler?: QueryBuilderOnParamChangedHandler;
}

export interface QueryBuilderOperationParamDef {
  name: string;
  type: 'string' | 'number' | 'boolean';
  options?:
    | string[]
    | number[]
    | {
        label: string;
        value: string | number;
      }[];
  hideName?: boolean;
  restParam?: boolean;
  optional?: boolean;
  placeholder?: string;
  description?: string;
  minWidth?: number;
  subType?: string;
  runQueryOnEnter?: boolean;
}

export type VisualQueryModeller = any;

export type QueryBuilderAddOperationHandler<T> = (def: QueryBuilderOperationDef, query: T, modeller: VisualQueryModeller) => T;

export type QueryBuilderOnParamChangedHandler = (index: number, operation: PromVisualQueryOperation, operationDef: QueryBuilderOperationDef) => PromVisualQueryOperation;

export type QueryBuilderExplainOperationHandler = (op: PromVisualQueryOperation, def?: QueryBuilderOperationDef) => string;
