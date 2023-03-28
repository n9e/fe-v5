import { FuncCate, FuncDef } from '../../types';

const functionsMap = new Map<FuncCate, Set<FuncDef>>([
  [FuncCate.Transform, new Set<FuncDef>()],
  [FuncCate.Aggregate, new Set<FuncDef>()],
  [FuncCate.Filter, new Set<FuncDef>()],
  [FuncCate.Trends, new Set<FuncDef>()],
  [FuncCate.Time, new Set<FuncDef>()],
  [FuncCate.Alias, new Set<FuncDef>()],
  [FuncCate.Special, new Set<FuncDef>()],
]);

function addFuncDef(category: FuncCate, funcDef: FuncDef) {
  const defs = functionsMap.get(category);
  if (defs) {
    defs.add(funcDef);
  } else {
    throw new Error(`Invalid function category: ${category}`);
  }
}

// Transform
addFuncDef(FuncCate.Transform, {
  name: 'groupBy',
  params: [
    { name: 'interval', type: 'string' },
    { name: 'function', type: 'string', options: ['avg', 'min', 'max', 'sum', 'count', 'median', 'first', 'last'] },
  ],
  defaultParams: ['1m', 'avg'],
});

addFuncDef(FuncCate.Transform, {
  name: 'scale',
  params: [{ name: 'factor', type: 'float', options: [100, 0.01, 10, -1] }],
  defaultParams: [100],
});

addFuncDef(FuncCate.Transform, {
  name: 'offset',
  params: [{ name: 'delta', type: 'float', options: [-100, 100] }],
  defaultParams: [100],
});

addFuncDef(FuncCate.Transform, {
  name: 'delta',
  params: [],
  defaultParams: [],
});

addFuncDef(FuncCate.Transform, {
  name: 'rate',
  params: [],
  defaultParams: [],
});

addFuncDef(FuncCate.Transform, {
  name: 'movingAverage',
  params: [{ name: 'factor', type: 'int', options: [6, 10, 60, 100, 600] }],
  defaultParams: [10],
});

addFuncDef(FuncCate.Transform, {
  name: 'exponentialMovingAverage',
  params: [{ name: 'smoothing', type: 'float', options: [6, 10, 60, 100, 600] }],
  defaultParams: [0.2],
});

addFuncDef(FuncCate.Transform, {
  name: 'percentile',
  params: [
    { name: 'interval', type: 'string' },
    { name: 'percent', type: 'float', options: [25, 50, 75, 90, 95, 99, 99.9] },
  ],
  defaultParams: ['1m', 95],
});

addFuncDef(FuncCate.Transform, {
  name: 'removeAboveValue',
  params: [{ name: 'number', type: 'float' }],
  defaultParams: [0],
});

addFuncDef(FuncCate.Transform, {
  name: 'removeBelowValue',
  params: [{ name: 'number', type: 'float' }],
  defaultParams: [0],
});

addFuncDef(FuncCate.Transform, {
  name: 'transformNull',
  params: [{ name: 'number', type: 'float' }],
  defaultParams: [0],
});

// Aggregate
addFuncDef(FuncCate.Aggregate, {
  name: 'aggregateBy',
  params: [
    { name: 'interval', type: 'string' },
    { name: 'function', type: 'string', options: ['avg', 'min', 'max', 'sum', 'count', 'median', 'first', 'last'] },
  ],
  defaultParams: ['1m', 'avg'],
});

addFuncDef(FuncCate.Aggregate, {
  name: 'sumSeries',
  params: [],
  defaultParams: [],
});

addFuncDef(FuncCate.Aggregate, {
  name: 'percentileAgg',
  params: [
    { name: 'interval', type: 'string' },
    { name: 'percent', type: 'float', options: [25, 50, 75, 90, 95, 99, 99.9] },
  ],
  defaultParams: ['1m', 95],
});

// Filter
addFuncDef(FuncCate.Filter, {
  name: 'top',
  params: [
    { name: 'number', type: 'int' },
    { name: 'value', type: 'string', options: ['avg', 'min', 'max', 'sum', 'count', 'median', 'first', 'last'] },
  ],
  defaultParams: [5, 'avg'],
});

addFuncDef(FuncCate.Filter, {
  name: 'bottom',
  params: [
    { name: 'number', type: 'int' },
    { name: 'value', type: 'string', options: ['avg', 'min', 'max', 'sum', 'count', 'median', 'first', 'last'] },
  ],
  defaultParams: [5, 'avg'],
});

addFuncDef(FuncCate.Filter, {
  name: 'sortSeries',
  params: [{ name: 'direction', type: 'string', options: ['asc', 'desc'] }],
  defaultParams: ['asc'],
});

// Trends
addFuncDef(FuncCate.Trends, {
  name: 'trendValue',
  params: [{ name: 'type', type: 'string', options: ['avg', 'min', 'max', 'sum', 'count'] }],
  defaultParams: ['avg'],
});

// Time
addFuncDef(FuncCate.Time, {
  name: 'timeShift',
  params: [{ name: 'interval', type: 'string', options: ['24h', '7d', '1M', '+24h', '-24h'] }],
  defaultParams: ['24h'],
});

// Alias
addFuncDef(FuncCate.Alias, {
  name: 'setAlias',
  params: [{ name: 'alias', type: 'string' }],
  defaultParams: [],
});

addFuncDef(FuncCate.Alias, {
  name: 'setAliasByRegex',
  params: [{ name: 'aliasByRegex', type: 'string' }],
  defaultParams: [],
});

addFuncDef(FuncCate.Alias, {
  name: 'replaceAlias',
  params: [
    { name: 'regexp', type: 'string' },
    { name: 'newAlias', type: 'string' },
  ],
  defaultParams: ['/(.*)/', '$1'],
});

// Special
addFuncDef(FuncCate.Special, {
  name: 'consolidateBy',
  params: [{ name: 'type', type: 'string', options: ['avg', 'min', 'max', 'sum', 'count'] }],
  defaultParams: ['avg'],
});

export default functionsMap;

export function findDefByName(name: string): FuncDef | undefined {
  for (const [key, value] of functionsMap) {
    for (const funcDef of value) {
      if (funcDef.name === name) {
        return funcDef;
      }
    }
  }
  return undefined;
}

// build options for Antd Cascader
interface Option {
  value: string | number;
  label?: React.ReactNode;
  children?: Option[];
}

export function buildOptions(functionsMap: Map<FuncCate, Set<FuncDef>>): Option[] {
  const options: Option[] = [];

  for (const [key, value] of functionsMap) {
    const children: Option[] = [];
    for (const funcDef of value) {
      children.push({
        value: funcDef.name,
        label: funcDef.name,
      });
    }
    options.push({
      value: key,
      label: key,
      children,
    });
  }

  return options;
}

export const options = buildOptions(functionsMap);
