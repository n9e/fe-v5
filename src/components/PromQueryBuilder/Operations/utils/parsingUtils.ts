import { SyntaxNode, TreeCursor } from '@lezer/common';

import { PromVisualQueryOperation, VisualQueryOperationParamValue } from '../../types';

export const ErrorId = 0;

export function getLeftMostChild(cur: SyntaxNode): SyntaxNode {
  return cur.firstChild ? getLeftMostChild(cur.firstChild) : cur;
}

export function makeError(expr: string, node: SyntaxNode) {
  return {
    text: getString(expr, node),
    from: node.from,
    to: node.to,
    parentType: node.parent?.name,
  };
}

const variableRegex = /\$(\w+)|\[\[([\s\S]+?)(?::(\w+))?\]\]|\${(\w+)(?:\.([^:^\}]+))?(?::([^\}]+))?}/g;

export function replaceVariables(expr: string) {
  return expr.replace(variableRegex, (match, var1, var2, fmt2, var3, fieldPath, fmt3) => {
    const fmt = fmt2 || fmt3;
    let variable = var1;
    let varType = '0';

    if (var2) {
      variable = var2;
      varType = '1';
    }

    if (var3) {
      variable = var3;
      varType = '2';
    }

    return `__V_${varType}__` + variable + '__V__' + (fmt ? '__F__' + fmt + '__F__' : '');
  });
}

export function getString(expr: string, node: SyntaxNode | TreeCursor | null | undefined) {
  if (!node) {
    return '';
  }
  return returnVariables(expr.substring(node.from, node.to));
}

const varTypeFunc = [(v: string, f?: string) => `\$${v}`, (v: string, f?: string) => `[[${v}${f ? `:${f}` : ''}]]`, (v: string, f?: string) => `\$\{${v}${f ? `:${f}` : ''}\}`];

export function returnVariables(expr: string) {
  return expr.replace(/__V_(\d)__(.+?)__V__(?:__F__(\w+)__F__)?/g, (match, type, v, f) => {
    return varTypeFunc[parseInt(type, 10)](v, f);
  });
}

export function makeBinOp(opDef: { id: string; comparison?: boolean }, expr: string, numberNode: SyntaxNode, hasBool: boolean): PromVisualQueryOperation {
  const params: VisualQueryOperationParamValue[] = [parseFloat(getString(expr, numberNode))];
  if (opDef.comparison) {
    params.push(hasBool);
  }
  return {
    id: opDef.id,
    params,
  };
}

export function getAllByType(expr: string, cur: SyntaxNode, type: number | string): string[] {
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
