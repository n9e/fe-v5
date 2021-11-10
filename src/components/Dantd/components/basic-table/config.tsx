export const pageSizeOptions = ['10', '20', '50', '100'];

export type TSorterNames = 'ascend' | 'descend';

export const sorterNames = {
  ascend: '升序',
  descend: '降序',
};

export const locale = {
  filterTitle: '筛选',
  filterConfirm: '确定',
  filterReset: '重置',
  emptyText: '暂无数据',
};

export const showTotal = (total: number) => {
  return `共 ${total} 条`;
};
