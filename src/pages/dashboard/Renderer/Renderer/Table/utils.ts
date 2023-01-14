import _ from 'lodash';

export function transformColumns(columns: any[], transformations?: any[]): any[] {
  let newColumns: any[] = columns;
  if (!transformations) {
    return newColumns;
  }
  const organizeOptions = transformations[0]?.options;
  if (organizeOptions) {
    const { excludeByName, indexByName, renameByName } = organizeOptions;
    if (indexByName) {
      newColumns = _.map(newColumns, (column) => {
        const index = indexByName[column.title];
        return {
          ...column,
          sort: index,
        };
      });
      newColumns = _.sortBy(newColumns, 'sort');
    }
    if (excludeByName) {
      newColumns = _.filter(newColumns, (column) => !excludeByName[column.title]);
    }
    if (renameByName) {
      newColumns = _.map(newColumns, (column) => {
        const newName = renameByName[column.title];
        if (newName) {
          return { ...column, title: newName };
        }
        return column;
      });
    }
  }
  return newColumns;
}
