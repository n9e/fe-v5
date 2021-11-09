export const pageSizeOptions = ['10', '20', '50', '100'];

export const paginationLocale = {
  items_per_page: '/ 页',
  jump_to: '跳至',
  jump_to_confirm: '确定',
  page: '页',
  prev_page: '上一页',
  next_page: '下一页',
  prev_5: '向前 5 页',
  next_5: '向后 5 页',
  prev_3: '向前 3 页',
  next_3: '向后 3 页',
};

export const sorterNames = {
  ascend: '升序',
  descend: '降序',
};

export type TSorterNames = 'ascend' | 'descend';

export const locale = {
  filterTitle: '筛选',
  filterConfirm: '确定',
  filterReset: '重置',
  emptyText: '暂无数据',
};

export const showTotal = (total: number) => {
  return `共 ${total} 条`;
};
