import _ from 'lodash';
import { SyntaxNode, TreeCursor } from '@lezer/common';
import {
  AggregateExpr,
  AggregateModifier,
  AggregateOp,
  BinaryExpr,
  BinModifiers,
  Expr,
  FunctionCall,
  FunctionCallArgs,
  FunctionCallBody,
  FunctionIdentifier,
  GroupingLabel,
  GroupingLabelList,
  GroupingLabels,
  LabelMatcher,
  LabelName,
  MatchOp,
  MetricIdentifier,
  NumberLiteral,
  On,
  OnOrIgnoring,
  ParenExpr,
  parser,
  StringLiteral,
  VectorSelector,
  Without,
} from 'lezer-promql';

import { PromVisualQuery, PromVisualQueryLabelFilter, PromVisualQueryOperation, PromVisualQueryBinary, VisualQueryOperationParamValue, PromVisualQueryOperationId } from '../types';
import { arithmeticBinaryOperators, comparisonBinaryOperators } from '../Operations/utils';

export function buildPromVisualQueryFromPromQL(expr: string): Context {
  const tree = parser.parse(expr);
  const node = tree.topNode as any;

  const visQuery: PromVisualQuery = {
    metric: '',
    labels: [],
    operations: [],
  };
  const context: Context = {
    query: visQuery,
    errors: [],
  };

  try {
    handleExpression(expr, node, context);
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      context.errors.push({
        text: err.message,
      });
    }
  }

  if (isEmptyQuery(context.query)) {
    context.errors = [];
  }
  return context;
}

interface ParsingError {
  text: string;
  from?: number;
  to?: number;
  parentType?: string;
}

interface Context {
  query: PromVisualQuery;
  errors: ParsingError[];
}

function handleExpression(expr: string, node: SyntaxNode, context: Context) {
  const visQuery = context.query;

  switch (node.type.id) {
    case MetricIdentifier: {
      visQuery.metric = getString(expr, node);
      break;
    }

    case LabelMatcher: {
      visQuery.labels.push(getLabel(expr, node));
      const err = node.getChild(ErrorId);
      if (err) {
        context.errors.push(makeError(expr, err));
      }
      break;
    }

    case FunctionCall: {
      handleFunction(expr, node, context);
      break;
    }

    case AggregateExpr: {
      handleAggregation(expr, node, context);
      break;
    }

    case BinaryExpr: {
      handleBinary(expr, node, context);
      break;
    }

    case ErrorId: {
      if (isIntervalVariableError(node)) {
        break;
      }
      context.errors.push(makeError(expr, node));
      break;
    }

    default: {
      if (node.type.id === ParenExpr) {
        context.errors.push(makeError(expr, node));
      }
      let child = node.firstChild;
      while (child) {
        handleExpression(expr, child, context);
        child = child.nextSibling;
      }
    }
  }
}

function isIntervalVariableError(node: SyntaxNode) {
  return node.prevSibling?.type.id === Expr && node.prevSibling?.firstChild?.type.id === VectorSelector;
}

function getLabel(expr: string, node: SyntaxNode): PromVisualQueryLabelFilter {
  const label = getString(expr, node.getChild(LabelName));
  const op = getString(expr, node.getChild(MatchOp));
  const value = getString(expr, node.getChild(StringLiteral)).replace(/"|'/g, '');
  return {
    label,
    op,
    value,
  };
}

const rangeFunctions = ['changes', 'rate', 'irate', 'increase', 'delta'];

function handleFunction(expr: string, node: SyntaxNode, context: Context) {
  const visQuery = context.query;
  const nameNode = node.getChild(FunctionIdentifier);
  const funcName = getString(expr, nameNode);

  const body = node.getChild(FunctionCallBody);
  const callArgs = body!.getChild(FunctionCallArgs);
  const params: any[] = [];
  let interval = '';

  if (rangeFunctions.includes(funcName) || funcName.endsWith('_over_time')) {
    let match = getString(expr, node).match(/\[(.+)\]/);
    if (match?.[1]) {
      interval = match[1];
      params.push(match[1]);
    }
  }

  const op = { id: funcName, params };
  visQuery.operations.unshift(op);

  if (callArgs) {
    if (getString(expr, callArgs) === interval + ']') {
      return;
    }
    updateFunctionArgs(expr, callArgs, context, op);
  }
}

function handleAggregation(expr: string, node: SyntaxNode, context: Context) {
  const visQuery = context.query;
  const nameNode = node.getChild(AggregateOp);
  let funcName = getString(expr, nameNode);

  const modifier = node.getChild(AggregateModifier);
  const labels: any = [];

  if (modifier) {
    const byModifier = modifier.getChild(`By`);
    if (byModifier && funcName) {
      funcName = `__${funcName}_by`;
    }

    const withoutModifier = modifier.getChild(Without);
    if (withoutModifier) {
      funcName = `__${funcName}_without`;
    }

    labels.push(...getAllByType(expr, modifier, GroupingLabel));
  }

  const body = node.getChild(FunctionCallBody);
  const callArgs = body!.getChild(FunctionCallArgs);

  const op: PromVisualQueryOperation = { id: funcName, params: [] };
  visQuery.operations.unshift(op);
  updateFunctionArgs(expr, callArgs, context, op);
  op.params.push(...labels);
}

function updateFunctionArgs(expr: string, node: SyntaxNode | null, context: Context, op: PromVisualQueryOperation) {
  if (!node) {
    return;
  }
  switch (node.type.id) {
    case Expr:
    case FunctionCallArgs: {
      let child = node.firstChild;
      while (child) {
        updateFunctionArgs(expr, child, context, op);
        child = child.nextSibling;
      }
      break;
    }

    case NumberLiteral: {
      op.params.push(parseFloat(getString(expr, node)));
      break;
    }

    case StringLiteral: {
      op.params.push(getString(expr, node).replace(/"/g, ''));
      break;
    }

    default: {
      handleExpression(expr, node, context);
    }
  }
}

function handleBinary(expr: string, node: SyntaxNode, context: Context) {
  const visQuery = context.query;
  const left = node.firstChild!;
  const op = getString(expr, left.nextSibling);
  const binModifier = getBinaryModifier(expr, node.getChild(BinModifiers));

  const right = node.lastChild!;

  const opDef = binaryScalarOperatorToOperatorName(op);

  const leftNumber = left.getChild(NumberLiteral);
  const rightNumber = right.getChild(NumberLiteral);

  const rightBinary = right.getChild(BinaryExpr);

  if (leftNumber) {
  } else {
    handleExpression(expr, left, context);
  }

  if (rightNumber) {
    visQuery.operations.push(makeBinOp(op, opDef, expr, right, !!binModifier?.isBool));
  } else if (rightBinary) {
    const leftMostChild = getLeftMostChild(right);
    if (leftMostChild?.type.id === NumberLiteral) {
      visQuery.operations.push(makeBinOp(op, opDef, expr, leftMostChild, !!binModifier?.isBool));
    }

    handleExpression(expr, right, context);
  } else {
    visQuery.binaryQueries = visQuery.binaryQueries || [];
    const binQuery: PromVisualQueryBinary<PromVisualQuery> = {
      operator: op,
      query: {
        metric: '',
        labels: [],
        operations: [],
      },
    };
    if (binModifier?.isMatcher) {
      binQuery.vectorMatchesType = binModifier.matchType;
      binQuery.vectorMatches = binModifier.matches;
    }
    visQuery.binaryQueries.push(binQuery);
    handleExpression(expr, right, {
      query: binQuery.query,
      errors: context.errors,
    });
  }
}

function getBinaryModifier(
  expr: string,
  node: SyntaxNode | null,
): { isBool: true; isMatcher: false } | { isBool: false; isMatcher: true; matches: string; matchType: 'ignoring' | 'on' } | undefined {
  if (!node) {
    return undefined;
  }
  if (node.getChild('Bool')) {
    return { isBool: true, isMatcher: false };
  } else {
    const matcher = node.getChild(OnOrIgnoring);
    if (!matcher) {
      return undefined;
    }
    const labels = getString(expr, matcher.getChild(GroupingLabels)?.getChild(GroupingLabelList));
    return {
      isMatcher: true,
      isBool: false,
      matches: labels,
      matchType: matcher.getChild(On) ? 'on' : 'ignoring',
    };
  }
}

function isEmptyQuery(query: PromVisualQuery) {
  if (query.labels.length === 0 && query.operations.length === 0 && !query.metric) {
    return true;
  }
  return false;
}

const ErrorId = 0;

function getLeftMostChild(cur: SyntaxNode): SyntaxNode {
  return cur.firstChild ? getLeftMostChild(cur.firstChild) : cur;
}

function makeError(expr: string, node: SyntaxNode) {
  return {
    text: getString(expr, node),
    from: node.from,
    to: node.to,
    parentType: node.parent?.name,
  };
}

function getString(expr: string, node: SyntaxNode | TreeCursor | null | undefined) {
  if (!node) {
    return '';
  }
  return returnVariables(expr.substring(node.from, node.to));
}

const varTypeFunc = [(v: string, f?: string) => `\$${v}`, (v: string, f?: string) => `[[${v}${f ? `:${f}` : ''}]]`, (v: string, f?: string) => `\$\{${v}${f ? `:${f}` : ''}\}`];

function returnVariables(expr: string) {
  return expr.replace(/__V_(\d)__(.+?)__V__(?:__F__(\w+)__F__)?/g, (match, type, v, f) => {
    return varTypeFunc[parseInt(type, 10)](v, f);
  });
}

function makeBinOp(op: string, opDef: { id: string; comparison?: boolean }, expr: string, numberNode: SyntaxNode, hasBool: boolean): PromVisualQueryOperation {
  const params: VisualQueryOperationParamValue[] = [op, parseFloat(getString(expr, numberNode))];
  if (opDef.comparison) {
    params.push(hasBool);
  }
  return {
    id: opDef.id,
    params,
  };
}

function getAllByType(expr: string, cur: SyntaxNode, type: number | string): string[] {
  if (cur.type.id === type || cur.name === type) {
    return [getString(expr, cur)];
  }
  const values: string[] = [];
  let pos = 0;
  let child = cur.childAfter(pos);
  while (child) {
    values.push(...getAllByType(expr, child, type));
    pos = child.to;
    child = cur.childAfter(pos);
  }
  return values;
}

function binaryScalarOperatorToOperatorName(op: string) {
  const acc = {};
  _.forEach(arithmeticBinaryOperators, (item) => {
    acc[item] = {
      id: PromVisualQueryOperationId.ArithmeticBinary,
    };
  });
  _.forEach(comparisonBinaryOperators, (item) => {
    acc[item] = {
      id: PromVisualQueryOperationId.ComparisonBinary,
      comparison: true,
    };
  });
  return acc[op];
}
