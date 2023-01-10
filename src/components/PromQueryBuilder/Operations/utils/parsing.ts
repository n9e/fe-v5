import { SyntaxNode } from '@lezer/common';
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

import { binaryScalarOperatorToOperatorName } from './index';
import { ErrorId, getAllByType, getLeftMostChild, getString, makeBinOp, makeError, replaceVariables } from './parsingUtils';
import { PromVisualQuery, PromVisualQueryLabelFilter, PromVisualQueryOperation, PromVisualQueryBinary } from '../../types';

export function buildVisualQueryFromString(expr: string): Context {
  const replacedExpr = replaceVariables(expr);
  const tree = parser.parse(replacedExpr);
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
    handleExpression(replacedExpr, node, context);
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

export function handleExpression(expr: string, node: SyntaxNode, context: Context) {
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
  const value = getString(expr, node.getChild(StringLiteral)).replace(/"/g, '');
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

  const opDef = binaryScalarOperatorToOperatorName[op];

  const leftNumber = left.getChild(NumberLiteral);
  const rightNumber = right.getChild(NumberLiteral);

  const rightBinary = right.getChild(BinaryExpr);

  if (leftNumber) {
  } else {
    handleExpression(expr, left, context);
  }

  if (rightNumber) {
    visQuery.operations.push(makeBinOp(opDef, expr, right, !!binModifier?.isBool));
  } else if (rightBinary) {
    const leftMostChild = getLeftMostChild(right);
    if (leftMostChild?.type.id === NumberLiteral) {
      visQuery.operations.push(makeBinOp(opDef, expr, leftMostChild, !!binModifier?.isBool));
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
