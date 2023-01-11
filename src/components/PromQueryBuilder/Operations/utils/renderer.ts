import { QueryBuilderOperationDef, PromVisualQueryOperation } from '../../types';

function renderParams(model: PromVisualQueryOperation, def: QueryBuilderOperationDef, innerExpr: string) {
  return (model.params ?? []).map((value, index) => {
    const paramDef = def.params[index];
    if (paramDef.type === 'string') {
      return '"' + value + '"';
    }

    return value;
  });
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

export function getAggregationByRendererWithParameter(aggregation: string) {
  return function aggregationRenderer(model: PromVisualQueryOperation, def: QueryBuilderOperationDef, innerExpr: string) {
    const restParamIndex = def.params.findIndex((param) => param.restParam);
    const params = model.params.slice(0, restParamIndex);
    const restParams = model.params.slice(restParamIndex);

    return `${aggregation} by(${restParams.join(', ')}) (${params.map((param, idx) => (def.params[idx].type === 'string' ? `\"${param}\"` : param)).join(', ')}, ${innerExpr})`;
  };
}

export function getAggregationByRenderer(aggregation: string) {
  return function aggregationRenderer(model: PromVisualQueryOperation, def: QueryBuilderOperationDef, innerExpr: string) {
    return `${aggregation} by(${model.params.join(', ')}) (${innerExpr})`;
  };
}

export function getAggregationWithoutRenderer(aggregation: string) {
  return function aggregationRenderer(model: PromVisualQueryOperation, def: QueryBuilderOperationDef, innerExpr: string) {
    return `${aggregation} without(${model.params.join(', ')}) (${innerExpr})`;
  };
}

export function operationWithRangeVectorRenderer(model: PromVisualQueryOperation, def: QueryBuilderOperationDef, innerExpr: string) {
  let rangeVector = (model.params ?? [])[0] ?? '5m';
  return `${def.id}(${innerExpr}[${rangeVector}])`;
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

export function labelJoinRenderer(model: PromVisualQueryOperation, def: QueryBuilderOperationDef, innerExpr: string) {
  if (typeof model.params[1] !== 'string') {
    throw 'The separator must be a string';
  }
  const separator = `"${model.params[1]}"`;
  return `${model.id}(${innerExpr}, "${model.params[0]}", ${separator}, "${model.params.slice(2).join(separator)}")`;
}

export function getSimpleBinaryRenderer(model: PromVisualQueryOperation, def: QueryBuilderOperationDef, innerExpr: string) {
  let operator = model.params[0];
  let param = model.params[1];
  let bool = '';
  if (model.params.length === 3) {
    bool = model.params[2] ? ' bool' : '';
  }

  return `${innerExpr} ${operator}${bool} ${param}`;
}
