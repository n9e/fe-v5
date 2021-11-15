//@ts-nocheck
import React, {
  useCallback,
  useRef,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { Tooltip, Table, Input, Row, Col, Button, ConfigProvider } from 'antd';
import {
  FilterOutlined,
  SearchOutlined,
  CloseOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { ConfigProviderProps } from 'antd/es/config-provider';
import classNames from 'classnames';
import Highlighter from 'react-highlight-words';
import { TableProps, ColumnProps } from 'antd/lib/table';
import { TableRowSelection } from 'antd/lib/table/interface';
import _ from 'lodash';
import QueryForm, { IColumnsType } from '../query-form/QueryForm';
import useDebounce from '@/components/Dantd/hooks/use-debounce';
import useDeepCompareEffect from '@/components/Dantd/hooks/use-deep-compare-effect';
import { pageSizeOptions, TSorterNames } from './config';
import { intlZhMap } from '@/components/Dantd/components/utils';

declare const ModeTypes: ['default', 'compact', string];
export declare type ModeType = typeof ModeTypes[number];

// 过滤，搜索不可以同时使用
export interface ITableColumnProps<T> extends ColumnProps<T> {
  commonFilter?: boolean; // 使用组件提供的过滤
  commonSorter?: boolean; // 使用组件提供的排序
  commonSearch?: boolean; // 使用组件提供的搜索
  searchRender?: (
    value: React.ReactText,
    row: T,
    index: number,
    highlightNode: React.ReactNode,
  ) => React.ReactNode; // （commonSearch 未开启时，无效）search 功能可以高亮被搜索的信息，但是会覆盖 render 方法。如果你希望保持search的所有功能，并自定义 render 方法，请使用 searchRender 代替。
}

interface IBasicTableProps<T> extends TableProps<T> {
  dataSource: T[];
  columns: ITableColumnProps<T>[];
  queryFormColumns?: IColumnsType[];
  showQueryOptionBtns?: boolean;
  showQueryCollapseButton?: boolean;
  queryFormProps?: any;
  isQuerySearchOnChange?: boolean;
  rowSelection?: TableRowSelection<T>;
  loading?: boolean;
  queryMode?: ModeType;
  tableTitle?: string;
  hideContentBorder?: boolean;
  onReload?: () => void;
  showReloadBtn?: boolean;
  showFilter?: boolean;
  showSearch?: boolean;
  showBodyBg?: boolean;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  searchPos?: 'full' | 'right' | string;
  filterType?: 'line' | 'half' | 'none' | string;
  reloadBtnPos?: 'left' | 'right' | string;
  reloadBtnType?: 'icon' | 'btn' | string;
  leftHeader?: React.ReactNode | string | number;
  customHeader?: React.ReactNode | string | number;
  antProps?: TableProps<T>;
  antConfig?: {} & ConfigProviderProps;
}

type TActionName = 'search' | 'filter';

interface IColumnsReducerValue {
  title: string;
  dataIndex: string;
  type?: TActionName;
  value?: any;
}
interface IColumnsReducerState {
  [x: string]: IColumnsReducerValue;
}

type TColumnsReducerAction =
  | {
      type: 'update';
      dataIndex: string | number;
      value?: any;
      updateType?: TActionName;
    }
  | { type: 'clear'; initialState: any };

type TSorterReducerAction = { type: 'update'; value: any } | { type: 'clear' };

function sorterReducer(state: any, action: TSorterReducerAction) {
  switch (action.type) {
    case 'update':
      return {
        ...action.value,
      };
    case 'clear':
      return {};
    default:
      return state;
  }
}

// 泛型函数组件 https://juejin.im/post/5cd7f2c4e51d453a7d63b715#heading-7
function BasicTable<T>(props: IBasicTableProps<T>) {
  const prefixCls = `${props.prefixCls || 'dantd'}-table`;
  const filterType = props.filterType || 'half';
  const tmpDataSource = props.dataSource || ([] as T[]);
  const t = intlZhMap;
  const [dataSource, setDataSource] = useState(tmpDataSource);
  const [queryFormValues, setQueryFormValues] = useState<any>({});
  const [isQueryInit, setQueryInit] = useState(false);
  const {
    showFilter = true,
    showSearch = true,
    showReloadBtn = true,
    showQueryOptionBtns = true,
    showQueryCollapseButton = true,
    queryFormProps = {},
    isQuerySearchOnChange = true,
    loading = false,
    showBodyBg = false,
    queryFormColumns,
    queryMode = 'default',
    searchPos = 'full',
    reloadBtnPos = 'right',
    reloadBtnType = 'icon',
    antProps = {
      rowKey: 'id',
    },
  } = props;
  // 整理搜索区的展示状态
  // 是否展示长条搜索区
  const showFullSearch = showSearch && searchPos === 'full';
  // 搜索按钮展示的位置
  const showReloadBtn2SearchRight =
    searchPos === 'full' && showReloadBtn && reloadBtnPos === 'right';
  const showReloadBtn2FilterRight =
    (!showSearch || searchPos !== 'full') &&
    showReloadBtn &&
    reloadBtnPos === 'right';
  const showReloadBtn2FilterLeft = showReloadBtn && reloadBtnPos === 'left';

  const searchPlaceholder =
    props.searchPlaceholder || t('table.search.placeholder');
  const tableClassName = classNames(prefixCls, props.className);
  const tableContentClassName = classNames({
    [`${prefixCls}-table-content`]: true,
    [`${prefixCls}-table-content-noborder`]: props.hideContentBorder,
  });
  const tableBodyCls = classNames({
    [`${prefixCls}-body`]: !!queryFormColumns || showBodyBg,
    [`${prefixCls}-body-compact`]: queryMode === 'compact',
  });

  const tableQueryCls = classNames({
    [`${prefixCls}-query`]: !!queryFormColumns,
    [`${prefixCls}-query-compact`]: queryMode === 'compact',
  });
  const filterSearchInputRef = useRef({}) as any;
  const clearFiltersRef = useRef({}) as any;
  const [searchQuery, setSearchQuery] = useState('');
  const [showRightHeader, setShowRightHeader] = useState<boolean>(false);
  const [sorterState, sorterDispatch] = useReducer(sorterReducer, {});
  const rowSelection = props.rowSelection;

  const selectRowNum = rowSelection
    ? rowSelection.selectedRowKeys && rowSelection.selectedRowKeys.length
    : -1;
  const sorterNames = {
    ascend: t('table.sort.ascend'),
    descend: t('table.sort.descend'),
  };

  const showTotal = (total: number) => {
    return `${t('table.total.prefix')} ${total} ${t('table.total.suffix')}`;
  };
  // 生成列的 dataIndex 数组
  const columnsDataIndexArr =
    props.columns.map((columnItem) => {
      let dataIndex = columnItem.dataIndex;
      if (typeof dataIndex === 'object' && dataIndex !== null) {
        // metadata name
        dataIndex = dataIndex.join(' ');
      }
      return dataIndex;
    }) || [];

  const renderCurTarget = (
    data: Object,
    parentKey: Array<String>,
    curTarget = '',
  ) => {
    let returnItem = '';
    Object.entries(data).forEach(([curKey, curItem]) => {
      // 如果属性的值是对象，继续递归
      if (typeof curItem === 'object' && curItem !== null) {
        returnItem += ' ' + renderCurTarget(curItem, parentKey.concat(curKey));
      }

      columnsDataIndexArr.some((dataIndex) => {
        // 如果data对象的属性匹配到了columnsDataIndexArr中的某一项
        if (dataIndex === parentKey.concat(curKey).join(' ')) {
          // 当值为String｜Number｜Array类型时，将值加到curTarget中
          if (
            typeof curItem === 'string' ||
            typeof curItem === 'number' ||
            Array.isArray(curItem)
          ) {
            returnItem += ' ' + curItem;
          }
        }
      });
    });
    return `${curTarget} ${returnItem}`;
  };

  const dataSourceMap = useMemo(() => {
    if (!props.dataSource || !Array.isArray(props.dataSource)) {
      return [];
    }
    return props.dataSource.reduce((acc, curVal, curIdx) => {
      // let curTarget = ''
      // Object.entries(curVal).forEach(([curKey, curItem]) => {
      //   if (columnsDataIndexArr.indexOf(curKey) >= 0 && (typeof curItem === 'string' || typeof curItem === 'number')) {
      //     curTarget = `${curTarget} ${curItem}`
      //   }
      // })

      return {
        ...acc,
        [curIdx]: renderCurTarget(curVal, []).toLowerCase(),
      };
    }, {});
  }, [columnsDataIndexArr, props.dataSource]);
  // console.log('basicTable dataSourceMap', dataSourceMap)
  const columnsMap = useMemo(() => {
    const result = {} as any;
    if (props.columns && props.columns.length > 0) {
      props.columns.forEach((columnItem) => {
        if (columnItem.dataIndex) {
          result[columnItem.dataIndex as string] = {
            title: columnItem.title,
            dataIndex: columnItem.dataIndex,
            value: null,
            commonSearch: columnItem.commonSearch,
            commonFilter: columnItem.commonFilter,
            commonSorter: columnItem.commonSorter,
          };
        }
      });
    }
    return result;
  }, [props.columns]);
  // console.log('basicTable columnsMap', columnsMap)
  function columnInit(initColumnState) {
    return initColumnState;
  }

  function columnsReducer(
    state: IColumnsReducerState,
    action: TColumnsReducerAction,
  ) {
    switch (action.type) {
      case 'update':
        return {
          ...state,
          [action.dataIndex]: {
            ...state[action.dataIndex],
            dataIndex: action.dataIndex,
            type: action.updateType,
            value: action.value,
          },
        };
      case 'clear':
        return columnInit(action.initialState);
      default:
        return state;
    }
  }

  const [columnsState, columnsDispatch] = useReducer(
    columnsReducer,
    columnsMap,
    columnInit,
  );
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useDeepCompareEffect(() => {
    // 模糊匹配
    let newDataSource = [...tmpDataSource];
    if (showSearch && debouncedSearchQuery && debouncedSearchQuery.trim()) {
      if (props.onSearch) {
        // 使用用户自定义的search回调
        props.onSearch(debouncedSearchQuery.trim());
        return;
      } else {
        // 使用组件默认的search回调

        const debouncedSearchArr = debouncedSearchQuery
          .trim()
          .toLowerCase()
          .split(' ');
        newDataSource = newDataSource.filter((fiterItem, filterIdx) => {
          const filterStr = dataSourceMap[filterIdx];
          return debouncedSearchArr.every(
            (someItem) => filterStr.indexOf(someItem) >= 0,
          );
        });
      }
    }

    if (queryFormColumns && Object.keys(queryFormValues).length > 0) {
      newDataSource = _.filter(newDataSource, (sourceItem) => {
        return Object.entries(queryFormValues).every(
          ([queryKey, queryValue]) => {
            if (
              (!queryValue && queryValue !== 0) ||
              (Array.isArray(queryValue) && queryValue.length === 0)
            ) {
              return true;
            }
            if (typeof queryValue === 'string') {
              return (
                sourceItem[queryKey] &&
                sourceItem[queryKey].indexOf(queryValue) >= 0
              );
            }
            if (typeof queryValue === 'number') {
              return sourceItem[queryKey] === queryValue;
            }
            if (Array.isArray(queryValue) && queryValue.length > 0) {
              return queryValue.indexOf(sourceItem[queryKey]) >= 0;
            }
          },
        );
      });
    }

    setDataSource(newDataSource);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, queryFormValues, props.dataSource]);

  const handleChange = (
    pagination: any,
    filters: any,
    sorter: any,
    extra: any,
  ) => {
    sorterDispatch({
      type: 'update',
      value: sorter,
    });

    Object.entries(filters).forEach(([filterKey, filterValue]) => {
      if (columnsMap[filterKey].commonFilter) {
        columnsDispatch({
          type: 'update',
          dataIndex: filterKey,
          updateType: 'filter',
          value: filterValue,
        });
      }
    });

    checkRightHeader(filters, sorter);

    if (props.onChange) {
      props.onChange(pagination, filters, sorter, extra);
    }
  };

  const checkRightHeader = (filters?: any, sorter?: any, search?: any) => {
    const checkSorter = sorter || sorterState;
    const checkFilters = filters || columnsState;
    const checkSearch = search || columnsState;
    const isSearch = Object.values(checkSearch).some((columnItem: any) => {
      return !!(columnItem.type === 'search' && columnItem.value);
    });
    let isFilter = false;
    if (filters) {
      isFilter = Object.values(checkFilters).some((columnItem: any) => {
        return columnItem && columnItem.length > 0;
      });
    } else {
      isFilter = Object.values(checkFilters).some((columnItem: any) => {
        return !!(
          columnItem.type === 'filter' &&
          columnItem.value &&
          columnItem.value.length > 0
        );
      });
    }
    const isSorter = !!checkSorter.column;

    const res = isSearch || isFilter || isSorter;
    setShowRightHeader(res);
  };

  const handleFilterSearch = useCallback(
    (
      selectedKeys: React.ReactText[] | undefined,
      confirm: (() => void) | undefined,
      dataIndex: string | number,
    ) => {
      if (confirm) {
        confirm();
      }
      if (selectedKeys && dataIndex) {
        columnsDispatch({
          type: 'update',
          dataIndex,
          updateType: 'search',
          value: selectedKeys[0],
        });
      }
    },
    [],
  );

  const handleFilterSearchReset = useCallback(
    (
      clearFilters: ((selectedKeys: string[]) => void) | undefined,
      dataIndex: string | number | undefined,
    ) => {
      if (clearFilters) {
        clearFilters([]);
      }
      if (dataIndex) {
        columnsDispatch({
          type: 'update',
          dataIndex,
        });
      }
    },
    [],
  );

  const handleClearAll = () => {
    sorterDispatch({ type: 'clear' });
    columnsDispatch({ type: 'clear', initialState: columnsMap });
    setShowRightHeader(false);
    setTimeout(() => {
      Object.values(clearFiltersRef.current).forEach((filterItem: any) => {
        if (filterItem && filterItem.clearFilters) {
          filterItem.clearFilters([]);
        }
      });
    });
  };

  const handleSortClear = () => {
    sorterDispatch({ type: 'clear' });
    checkRightHeader(null, {});
  };

  const handleFilterClear = (columnValue: IColumnsReducerValue) => {
    columnsDispatch({
      type: 'update',
      dataIndex: columnValue.dataIndex,
      value: [],
    });

    const tmpFilters = Object.values(columnsState).map((filterItem: any) => {
      if (filterItem.dataIndex === columnValue.dataIndex) {
        return {
          [filterItem.dataIndex]: [],
        };
      }
      return {
        [filterItem.dataIndex]: filterItem.value || [],
      };
    });

    checkRightHeader(tmpFilters, sorterState, columnsState);
  };

  const handleFilterSearchClear = (columnValue: IColumnsReducerValue) => {
    columnsDispatch({
      type: 'update',
      dataIndex: columnValue.dataIndex,
    });

    if (
      clearFiltersRef.current[columnValue.dataIndex] &&
      clearFiltersRef.current[columnValue.dataIndex].clearFilters
    ) {
      clearFiltersRef.current[columnValue.dataIndex].clearFilters([]);
    }

    checkRightHeader(null, sorterState, {
      ...columnsState,
      [columnValue.dataIndex]: {
        title: columnsState[columnValue.dataIndex].title,
        dataIndex: columnsState[columnValue.dataIndex].dataIndex,
        value: null,
      },
    });
  };

  const renderColumns = () => {
    // if (!dataSource || (dataSource && dataSource.length === 0)) {
    //   return props.columns;
    // }

    const handledColumns = props.columns.map((columnItem) => {
      const currentItem = _.cloneDeep(columnItem);

      // filter
      if (currentItem.commonFilter && !currentItem.filters) {
        const filters = _.uniq(_.map(dataSource, columnItem.dataIndex));
        currentItem.filters = filters.map((value: string) => {
          return {
            text: value,
            value,
          };
        });

        currentItem.filterIcon = () => <FilterOutlined />;
        currentItem.filteredValue =
          columnsState[columnItem.dataIndex as string].value;
        currentItem.onFilter = (value, record: any) => {
          if (currentItem.dataIndex && record[currentItem.dataIndex]) {
            return record[currentItem.dataIndex] === value;
          }

          return false;
        };
      }

      // sort
      if (currentItem.commonSorter) {
        currentItem.sorter = (aItem: any, bItem: any) => {
          const a = aItem[currentItem.dataIndex as string];
          const b = bItem[currentItem.dataIndex as string];
          // number
          const numA = Number(a);
          const numB = Number(b);
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          }

          // date
          const dateA = +new Date(a);
          const dateB = +new Date(b);
          if (!isNaN(dateA) && !isNaN(dateB)) {
            return dateA - dateB;
          }

          // string
          if (typeof a === 'string' && typeof b === 'string') {
            return a > b ? 1 : -1;
          }

          return 0;
        };
        currentItem.sortOrder =
          sorterState.columnKey === currentItem.dataIndex && sorterState.order;
      }

      // Search
      if (currentItem.commonSearch) {
        currentItem.filterIcon = () => <SearchOutlined />;

        currentItem.onFilterDropdownVisibleChange = (visible: boolean) => {
          if (
            visible &&
            filterSearchInputRef.current &&
            filterSearchInputRef.current.select
          ) {
            setTimeout(() => {
              if (
                filterSearchInputRef.current &&
                filterSearchInputRef.current.select
              ) {
                filterSearchInputRef.current.select();
              }
              return null;
            });
          }
        };

        currentItem.filterDropdown = ({
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
        }) => {
          clearFiltersRef.current[currentItem.dataIndex as string] = {
            clearFilters,
          };

          return (
            <div style={{ padding: 8 }}>
              <Input
                data-testid='filter-search-input'
                autoFocus={true}
                ref={(node) => {
                  filterSearchInputRef.current = node;
                }}
                placeholder={t('table.filter.search.placeholder')}
                value={selectedKeys && selectedKeys[0]}
                onChange={(e) => {
                  if (setSelectedKeys) {
                    return setSelectedKeys(
                      e.target.value ? [e.target.value] : [],
                    );
                  }
                  return [];
                }}
                onPressEnter={() =>
                  handleFilterSearch(
                    selectedKeys,
                    confirm,
                    currentItem.dataIndex as string,
                  )
                }
                style={{ width: 188, marginBottom: 8, display: 'block' }}
              />
              <Button
                type='primary'
                onClick={() =>
                  handleFilterSearch(
                    selectedKeys,
                    confirm,
                    currentItem.dataIndex as string,
                  )
                }
                icon='search'
                size='small'
                data-testid='search-btn-ok'
                style={{ width: 90, marginRight: 8 }}
              >
                {t('table.filter.search.btn.ok')}
              </Button>
              <Button
                onClick={() =>
                  handleFilterSearchReset(clearFilters, currentItem.dataIndex)
                }
                size='small'
                style={{ width: 90 }}
              >
                {t('table.filter.search.btn.cancel')}
              </Button>
            </div>
          );
        };

        let searchWords: any[] = [];

        const tmpStateValue =
          columnsState[currentItem.dataIndex as string].value;
        if (typeof tmpStateValue === 'string') {
          searchWords = [tmpStateValue];
        }

        if (
          Array.isArray(tmpStateValue) &&
          typeof tmpStateValue[0] === 'string'
        ) {
          searchWords = [tmpStateValue[0]];
        }

        currentItem.onFilter = (value, record: any) => {
          return record[currentItem.dataIndex as string]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase());
        };

        if (!currentItem.render) {
          currentItem.render = (value, row, index) => {
            if (currentItem.searchRender) {
              return currentItem.searchRender(
                value,
                row,
                index,
                <Highlighter
                  highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                  searchWords={searchWords}
                  autoEscape
                  textToHighlight={String(value)}
                />,
              );
            } else {
              return (
                <Highlighter
                  highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                  searchWords={searchWords}
                  autoEscape
                  textToHighlight={String(value)}
                />
              );
            }
          };
        }
      }
      return currentItem;
    });
    // console.log('basicTable handledColumns', handledColumns)
    return handledColumns;
  };

  const isSearch = Object.values(columnsState).some((columnItem: any) => {
    return !!(columnItem.type === 'search' && columnItem.value);
  });

  const isFilter = Object.values(columnsState).some((columnItem: any) => {
    return !!(
      columnItem.type === 'filter' &&
      columnItem.value &&
      columnItem.value.length > 0
    );
  });

  const handleReload = () => {
    if (props.onReload) {
      props.onReload();
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const handleQueryFormInit = (data) => {
    if (!isQueryInit) {
      setQueryFormValues(data);
      setQueryInit(true);
    }
  };

  const handleQueryFormChange = (data) => {
    setQueryFormValues(data);
  };

  const handleQueryFormReset = (data) => {
    setQueryFormValues(data);
  };

  const renderRightHeader = (params) => {
    if (!showFilter) {
      return null;
    }
    return (
      <>
        <div>
          <b
            style={{
              display: 'inline-block',
              marginTop: 3,
            }}
          >
            {t('table.filter.header.title')}
          </b>
        </div>
        {(isSearch || isFilter) &&
          Object.values(columnsState as IColumnsReducerState).map(
            (columnValue) => {
              if (columnValue.type === 'search' && columnValue.value) {
                return (
                  <div
                    key={`search-header-${columnValue.dataIndex}`}
                    className={`${params.headerClsPrefix}-item`}
                  >
                    <Tooltip
                      title={
                        <span>
                          {columnValue.title}
                          {':'}&nbsp;
                          {columnValue.value}
                        </span>
                      }
                    >
                      <Button
                        size='small'
                        className='table-header-item-btn'
                        onClick={() => handleFilterSearchClear(columnValue)}
                      >
                        <span className='table-header-item-btn-content'>
                          {columnValue.title}
                          {':'}&nbsp;
                          {columnValue.value}
                        </span>
                        <CloseOutlined />
                      </Button>
                    </Tooltip>
                  </div>
                );
              }

              if (
                columnValue.type === 'filter' &&
                columnValue.value &&
                columnValue.value.length > 0
              ) {
                return (
                  <div
                    key={`search-header-${columnValue.dataIndex}`}
                    className={`${params.headerClsPrefix}-item`}
                  >
                    <Tooltip
                      title={
                        <span>
                          {columnValue.title}
                          {':'}&nbsp;
                          {columnValue.value.join(',')}
                        </span>
                      }
                    >
                      <Button
                        size='small'
                        className='table-header-item-btn'
                        onClick={() => handleFilterClear(columnValue)}
                      >
                        <span className='table-header-item-btn-content'>
                          {columnValue.title}
                          {':'}&nbsp;
                          {columnValue.value.join(',')}
                        </span>
                        <CloseOutlined />
                      </Button>
                    </Tooltip>
                  </div>
                );
              }
              return null;
            },
          )}
        {sorterState.columnKey && sorterState.column && (
          <div className={`${params.headerClsPrefix}-item`}>
            <Tooltip
              title={
                <span>
                  {sorterState.column.title}
                  {`: ${sorterNames[sorterState.order as TSorterNames]}`}
                </span>
              }
            >
              <Button
                size='small'
                className='table-header-item-btn'
                onClick={handleSortClear}
              >
                <span className='table-header-item-btn-content'>
                  {sorterState.column.title}
                  {`: ${sorterNames[sorterState.order as TSorterNames]}`}
                </span>
                <CloseOutlined />
              </Button>
            </Tooltip>
          </div>
        )}
        <div className={`${params.headerClsPrefix}-item`}>
          <Button
            size='small'
            type='link'
            data-testid='btn-clearall'
            onClick={handleClearAll}
          >
            {t('table.filter.header.btn.clear')}
          </Button>
        </div>
      </>
    );
  };

  const renderSearch = () => {
    return (
      <Tooltip placement='topLeft' title={searchPlaceholder}>
        <Input
          data-testid='search-input'
          prefix={
            reloadBtnPos === 'right' && (
              <SearchOutlined style={{ color: 'rgba(0,0,0,.25)' }} />
            )
          }
          suffix={
            reloadBtnPos === 'left' && (
              <SearchOutlined style={{ color: 'rgba(0,0,0,.25)' }} />
            )
          }
          allowClear={true}
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={searchPlaceholder}
        />
      </Tooltip>
    );
  };

  const renderReloadBtn = () => {
    if (reloadBtnType === 'icon') {
      const reloadBtnCls = classNames({
        [`${prefixCls}-header-loadbtn`]: true,
        [`${prefixCls}-header-loadbtn-icon`]: true,
        [`${prefixCls}-header-loadbtn-right`]: reloadBtnPos === 'right',
        [`${prefixCls}-header-loadbtn-left`]: reloadBtnPos === 'left',
      });
      return (
        <ReloadOutlined
          onClick={handleReload}
          spin={loading}
          className={reloadBtnCls}
        />
      );
    }

    if (reloadBtnType === 'btn') {
      const reloadBtnCls = classNames({
        [`${prefixCls}-header-loadbtn`]: true,
        [`${prefixCls}-header-loadbtn-btn`]: true,
        [`${prefixCls}-header-loadbtn-right`]: reloadBtnPos === 'right',
        [`${prefixCls}-header-loadbtn-left`]: reloadBtnPos === 'left',
      });
      return (
        <Button
          className={reloadBtnCls}
          loading={loading}
          icon={<ReloadOutlined />}
          data-testid='reload-btn'
          onClick={handleReload}
        />
      );
    }
  };

  return (
    <ConfigProvider {...props.antConfig}>
      <div className={tableClassName} style={props.style}>
        {queryFormColumns && (
          <div className={tableQueryCls}>
            <QueryForm
              onChange={
                isQuerySearchOnChange
                  ? handleQueryFormChange
                  : handleQueryFormInit
              }
              onReset={handleQueryFormReset}
              onSearch={handleQueryFormChange}
              columns={queryFormColumns}
              showOptionBtns={showQueryOptionBtns}
              showCollapseButton={showQueryCollapseButton}
              {...queryFormProps}
            />
          </div>
        )}
        <div className={tableBodyCls}>
          {!!props.tableTitle && <h3> {props.tableTitle} </h3>}

          {showFullSearch && (
            <Row className={`${prefixCls}-header-search`}>
              {showSearch ? renderSearch() : <div></div>}
              {showReloadBtn2SearchRight && renderReloadBtn()}
            </Row>
          )}
          {/* 自定义格式 */}
          {filterType === 'flex' && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: '10px',
              }}
            >
              {showReloadBtn2FilterLeft && renderReloadBtn()}
              {props.leftHeader}
            </div>
          )}
          {filterType === 'none' && searchPos !== 'right' && (
            <Row className={`${prefixCls}-header-filter`}>
              {showReloadBtn2FilterLeft && renderReloadBtn()}
              <Col
                data-testid='left-header'
                className={classNames(
                  `${prefixCls}-header-filter-left`,
                  props.leftHeader !== undefined &&
                    `${prefixCls}-header-filter-left-minh`,
                )}
              >
                {props.leftHeader}
              </Col>
              {showReloadBtn2FilterRight && renderReloadBtn()}
            </Row>
          )}
          {filterType === 'none' && showSearch && searchPos === 'right' && (
            <Row className={`${prefixCls}-header-filter`} align='middle'>
              <Col
                data-testid='left-header'
                className={classNames(
                  `${prefixCls}-header-filter-left`,
                  props.leftHeader !== undefined &&
                    `${prefixCls}-header-filter-left-minh`,
                )}
                span={13}
              >
                {showReloadBtn2FilterLeft && renderReloadBtn()}
                {props.leftHeader}
              </Col>
              <Col
                span={6}
                data-testid='right-header'
                className={`${prefixCls}-header-filter-right`}
              >
                {props.customHeader && (
                  <div data-testid='custom-header'>{props.customHeader}</div>
                )}
              </Col>
              <Col
                data-testid='right-header'
                className={`${prefixCls}-header-filter-right`}
                span={5}
              >
                {renderSearch()}
              </Col>

              {showReloadBtn2FilterRight && renderReloadBtn()}
            </Row>
          )}
          {filterType === 'line' && (
            <Row className={`${prefixCls}-header-filter`}>
              {showReloadBtn2FilterLeft && renderReloadBtn()}
              <Col
                data-testid='right-header'
                className={`${prefixCls}-header-filter-line`}
                span={24}
              >
                {showRightHeader &&
                  renderRightHeader({
                    headerClsPrefix: `${prefixCls}-header-filter-line`,
                  })}
              </Col>
              {showReloadBtn2FilterRight && renderReloadBtn()}
            </Row>
          )}
          {filterType === 'half' && (
            <Row className={`${prefixCls}-header-filter`}>
              {showReloadBtn2FilterLeft && renderReloadBtn()}
              <Col
                data-testid='left-header'
                className={classNames(
                  `${prefixCls}-header-filter-left`,
                  props.leftHeader !== undefined &&
                    `${prefixCls}-header-filter-left-minh`,
                )}
                span={12}
              >
                {props.leftHeader}
              </Col>
              <Col
                data-testid='right-header'
                className={`${prefixCls}-header-filter-right`}
                span={12}
              >
                {showRightHeader &&
                  renderRightHeader({
                    headerClsPrefix: `${prefixCls}-header-filter-right`,
                  })}
              </Col>
              {showReloadBtn2FilterRight && renderReloadBtn()}
            </Row>
          )}
          <div className={`${prefixCls}-table-wrapper`}>
            <div className={tableContentClassName}>
              <Table
                loading={loading}
                columns={renderColumns()}
                dataSource={dataSource}
                bordered={false}
                rowSelection={rowSelection}
                onChange={handleChange}
                pagination={{
                  showTotal: showTotal,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  pageSizeOptions: pageSizeOptions,
                  ...props.pagination,
                }}
                {...antProps}
              />
              {rowSelection && selectRowNum !== undefined && selectRowNum > 0 && (
                <div className={`${prefixCls}-table-content-select-num`}>
                  {t('table.select.num')}
                  {selectRowNum}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default BasicTable;
