import _ from 'lodash';

export function targetsToMatch(idents: string[]) {
  const identsStr = _.join(idents, '|');
  return `{ident=~"${identsStr}"}`;
}