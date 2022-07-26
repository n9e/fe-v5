/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
//@ts-nocheck
import React, { useCallback, useRef, useMemo, useReducer, useState, useEffect, useImperativeHandle } from 'react';
import request from '@/utils/request';
import { Tooltip, Table, Input, Row, Col, Button, ConfigProvider } from 'antd';
import { FilterOutlined, SearchOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import { ConfigProviderProps } from 'antd/es/config-provider';
import queryString from 'query-string';
import classNames from 'classnames';
import Highlighter from 'react-highlight-words';
import _ from 'lodash';
import useDebounce from '@/components/Dantd/hooks/use-debounce';
// import useDeepCompareEffect from '../use-deep-compare-effect';
import { TableProps, ColumnProps } from 'antd/lib/table';
import { TableRowSelection } from 'antd/lib/table/interface';
import QueryForm, { IColumnsType } from '../query-form/QueryForm';
import { PaginationProps } from 'antd/lib/pagination';
import { pageSizeOptions, TSorterNames } from './config';
import { intlZhMap } from '@/components/Dantd/components/utils';

declare const ModeTypes: ['default', 'compact', string];
export declare type ModeType = typeof ModeTypes[number];

export interface ITableColumnProps<T> extends ColumnProps<T> {
  apiFilter?: {
    name: string;
    // mapping?: any;
    callback: (data: string[]) => string; // 过滤会返回一个数组，此方法会在发请求之前调用，处理API参数
  }; // 使用组件提供的过滤
  apiSorter?: {
    name: string;
    ascend?: string; // 升序
    descend?: string; // 降序
  }; // 使用组件提供的排序
  apiSearch?: {
    name: string;
  }; // 使用组件提供的搜索
  searchRender?: (value: React.ReactText, row: T, index: number, highlightNode: React.ReactNode) => React.ReactNode; // （apiSearch 未开启时，无效）search 功能可以高亮被搜索的信息，但是会覆盖 render 方法。如果你希望保持search的所有功能，并自定义 render 方法，请使用 searchRender 代替。
}

interface IPageParamsProps extends PaginationProps {
  curPageName: string; // api curPage 的名称
  pageSizeName: string; // api pageSize 的名称
  startPage?: 0 | 1 | number; // api 开始页码 默认1 (后端参数)
}

interface ISearchParamsProps {
  apiName: string;
  placeholder?: string;
}

interface IDataTableProps<T> extends TableProps<T> {
  tableTitle?: string;
  columns: ITableColumnProps<T>[];
  rowSelection?: TableRowSelection<T>;
  url: string;
  showQueryOptionBtns?: boolean;
  showQueryCollapseButton?: boolean;
  queryFormProps?: any;
  isQuerySearchOnChange?: boolean;
  queryMode?: ModeType;
  queryFormColumns?: IColumnsType[];
  hideContentBorder?: boolean;
  fetchOptions?: any; // 跨域等配置 https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch
  apiCallback?: (data: any) => any; // 处理 api 返回的数据
  apiAsyncCallback?: (data: any) => any; // 处理 api 返回的数据 (以异步的形式返回)
  apiErrorCallback?: (data: any) => any; // 处理 api 错误时返回的数据
  onSearch?: (data: string) => any; // search回调
  customQueryCallback?: (data: any) => any; // 自定义查询参数，会使用 queryString.stringify 处理
  customFetchUrlCallback?: (url: string) => string; // 自定义查询参数，会使用 queryString.stringify 处理
  pageParams: IPageParamsProps;
  searchParams?: ISearchParamsProps; // 需要api Search，就要定义此参数
  searchPos?: 'full' | 'right' | string;
  showReloadBtn?: boolean;
  showFilter?: boolean;
  showBodyBg?: boolean;
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
  filters?: any[];
  apiFilter?: {
    name: string;
    // mapping?: any;
    callback: (data: string[]) => string; // 过滤会返回一个数组，此方法会在发请求之前调用，处理API参数
  }; // 使用组件提供的过滤
  apiSorter?: {
    name: string;
    ascend?: string; // 升序
    descend?: string; // 降序
  }; // 使用组件提供的排序
  apiSearch?: {
    name: string;
  }; // 使用组件提供的搜索
}

type TColumnsReducerAction =
  | {
      type: 'update';
      dataIndex: string | number;
      value?: any;
      updateType?: TActionName;
    }
  | { type: 'clear'; initialState: any };

interface IColumnsReducerState {
  [x: string]: IColumnsReducerValue;
}

type TSorterReducerAction = { type: 'update'; value: any } | { type: 'clear' };

function columnsReducer(state: IColumnsReducerState, action: TColumnsReducerAction) {
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
      return {
        ...action.initialState,
      };
    default:
      return state;
  }
}

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

function DataTable<T>(props: IDataTableProps<T>, ref: any) {
  const prefixCls = `${props.prefixCls || 'dantd'}-data-table`;
  const filterType = props.filterType || 'half';
  const isUrlLoad = useRef<string>();
  const t = intlZhMap;
  const {
    fetchOptions = {},
    searchParams,
    showFilter = true,
    showReloadBtn = true,
    showQueryOptionBtns = true,
    showQueryCollapseButton = true,
    isQuerySearchOnChange = true,
    showBodyBg = false,
    queryFormProps = {},
    url,
    queryMode = 'default',
    reloadBtnPos = 'right',
    searchPos = 'full',
    reloadBtnType = 'icon',
    queryFormColumns,
    pageParams,
    antProps = {
      rowKey: 'id',
    },
  } = props;

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

  // hooks
  const columnsMap = useMemo(() => {
    const result = {} as any;
    if (props.columns && props.columns.length > 0) {
      props.columns.forEach((columnItem) => {
        if (columnItem.dataIndex) {
          result[columnItem.dataIndex as string] = {
            ...columnItem,
            value: null,
          };
        }
      });
    }
    return result;
  }, [props.columns]);

  const [queryFormValues, setQueryFormValues] = useState<any>({});
  const [isQueryInit, setQueryInit] = useState(false);
  const isPageChangeNoSearch = useRef<boolean>(false);
  const filterSearchInputRef = useRef({}) as any;
  const clearFiltersRef = useRef({}) as any;
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sorterState, sorterDispatch] = useReducer(sorterReducer, {});
  const [showRightHeader, setShowRightHeader] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState();
  const rowSelection = props.rowSelection;

  const selectRowNum = rowSelection ? rowSelection.selectedRowKeys && rowSelection.selectedRowKeys.length : -1;

  const sorterNames = {
    ascend: t('table.sort.ascend'),
    descend: t('table.sort.descend'),
  };

  const showTotal = (total: number) => {
    return `${t('table.total.prefix')} ${total} ${t('table.total.suffix')}`;
  };
  const showSearch = !!searchParams;
  // 是否展示长条搜索区
  const showFullSearch = showSearch && searchPos === 'full';
  // 搜索按钮展示的位置
  const showReloadBtn2SearchRight = searchPos === 'full' && showReloadBtn && reloadBtnPos === 'right';
  const showReloadBtn2FilterRight = (!showSearch || searchPos !== 'full') && showReloadBtn && reloadBtnPos === 'right';
  const showReloadBtn2FilterLeft = showReloadBtn && reloadBtnPos === 'left';
  const searchPlaceholder = searchParams ? searchParams.placeholder : t('table.search.placeholder');
  const [paginationState, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    ...pageParams,
  });
  const [columnsState, columnsDispatch] = useReducer(columnsReducer, columnsMap);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedQueryFormValues = useDebounce(JSON.stringify(queryFormValues), 300);
  const pageStr = JSON.stringify({
    pageSize: paginationState.pageSize,
    current: paginationState.current,
  });
  const tableStateStr = JSON.stringify({
    ...columnsState,
    ...sorterState,
  });
  // TODO 支持监听 customQuery
  useEffect(() => {
    if (url && isUrlLoad.current !== url) {
      let fetchParams = getAllFetchParams();
      fetchData(fetchParams);

      setTimeout(() => {
        isUrlLoad.current = url;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  useEffect(() => {
    if (!isUrlLoad.current) {
      return;
    }
    let fetchParams = getAllFetchParams();
    fetchParams[paginationState.curPageName] = 1;
    if (searchParams && debouncedSearchQuery && debouncedSearchQuery.trim()) {
      fetchParams[searchParams.apiName] = debouncedSearchQuery.trim();
    }

    if (props.onSearch) {
      // 使用用户自定义的search回调
      props.onSearch(debouncedSearchQuery ? debouncedSearchQuery.trim() : debouncedSearchQuery);
    }

    fetchData(fetchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery]);

  // 监听queryform
  useEffect(() => {
    if (!isUrlLoad.current) {
      return;
    }

    if (!queryFormColumns || (queryFormValues && Object.keys(queryFormValues).length === 0)) {
      return;
    }
    let fetchParams = getAllFetchParams();
    fetchParams[paginationState.curPageName] = 1;

    fetchData(fetchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQueryFormValues]);

  useEffect(() => {
    if (!isUrlLoad.current) {
      return;
    }
    let fetchParams = getAllFetchParams();
    fetchData(fetchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableStateStr]);

  useEffect(() => {
    if (!isUrlLoad.current || !paginationState.pageSize) {
      return;
    }

    if (isPageChangeNoSearch.current) {
      isPageChangeNoSearch.current = false;
      return;
    }
    let fetchParams = getAllFetchParams();
    fetchData(fetchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageStr]);

  async function fetchData(params?: any) {
    let fetchUrl = url;
    let customFetchParams = null as any;
    if (fetchUrl.indexOf('?') !== -1) {
      const fetchArr = fetchUrl.split('?');
      fetchUrl = fetchArr[0];
      customFetchParams = queryString.parse(fetchArr[1], {
        arrayFormat: 'comma',
      });
    }

    let fetchParams = {
      [pageParams.curPageName]: params.current,
      [pageParams.pageSizeName]: params.pageSize,
    };

    if (customFetchParams) {
      fetchParams = {
        ...customFetchParams,
        ...fetchParams,
      };
    }

    // api起始页从0开始，参数需要减1
    if (pageParams.startPage === 0) {
      fetchParams[pageParams.curPageName] -= 1;
    }

    props.columns.forEach((columnItem) => {
      if (columnItem.dataIndex && params[columnItem.dataIndex]) {
        fetchParams[columnItem.dataIndex] = params[columnItem.dataIndex];
      }
      if (columnItem.apiSearch && params[columnItem.apiSearch.name]) {
        fetchParams[columnItem.apiSearch.name] = params[columnItem.apiSearch.name];
      }
      if (columnItem.apiFilter && params[columnItem.apiFilter.name]) {
        fetchParams[columnItem.apiFilter.name] = params[columnItem.apiFilter.name];
      }
      if (columnItem.apiSorter && params[columnItem.apiSorter.name]) {
        fetchParams[columnItem.apiSorter.name] = params[columnItem.apiSorter.name];
      }
    });

    if (searchParams && params[searchParams.apiName]) {
      fetchParams[searchParams.apiName] = params[searchParams.apiName];
    }

    if (!!queryFormColumns && queryFormValues && Object.keys(queryFormValues).length > 0) {
      fetchParams = {
        ...queryFormValues,
        ...fetchParams,
      };
    }

    if (props.customQueryCallback) {
      fetchParams = props.customQueryCallback({
        ...fetchParams,
      });
    }

    fetchUrl = `${fetchUrl}?${queryString.stringify(fetchParams, {
      arrayFormat: 'comma',
    })}`;

    if (props.customFetchUrlCallback) {
      fetchUrl = props.customFetchUrlCallback(fetchUrl);
    }

    setLoading(true);
    let transportOptions = {
      ...fetchOptions,
    };
    if (fetchOptions.method && fetchOptions.method.toLowerCase() === 'post') {
      transportOptions.data = fetchParams;
    }
    const res = request(fetchUrl, transportOptions);
    props.rowSelection && props.rowSelection.onChange && props.rowSelection.onChange([]);
    if ((res.status < 200 || res.status >= 300) && props.apiErrorCallback) {
      props.apiErrorCallback(res);
      setLoading(false);
    } else {
      res
        .then(async (res) => {
          let callbackData = res;
          if (props.apiCallback) {
            callbackData = props.apiCallback(res);
          }
          if (props.apiAsyncCallback) {
            callbackData = await props.apiAsyncCallback(res);
          }
          setDataSource(callbackData.data);
          const tmpPagination = {
            ...paginationState,
            total: callbackData.total,
          };
          setPagination(tmpPagination);
          setLoading(false);
        })
        .catch(() => {
          if (props.apiErrorCallback) {
            props.apiErrorCallback(res);
          }
          setLoading(false);
        });
    }
  }

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    if (!isUrlLoad.current) {
      return;
    }

    if (Object.keys(sorter).length > 0 && sorter.column) {
      sorterDispatch({
        type: 'update',
        value: {
          ...sorter,
          column: {
            apiSorter: sorter.column.apiSorter,
          },
        },
      });
    } else {
      sorterDispatch({
        type: 'update',
        value: {},
      });
    }

    Object.entries(filters).forEach(([filterKey, filterValue]) => {
      if (columnsMap[filterKey].filters) {
        columnsDispatch({
          type: 'update',
          dataIndex: filterKey,
          updateType: 'filter',
          value: filterValue,
        });
      }
    });

    isPageChangeNoSearch.current = false;

    setPagination(pagination);

    checkRightHeader(filters, sorter);
  };

  const handleFilterSearch = useCallback((selectedKeys: React.ReactText[] | undefined, confirm: (() => void) | undefined, dataIndex: string | number) => {
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
  }, []);

  const handleFilterSearchReset = useCallback((clearFilters: ((selectedKeys: string[]) => void) | undefined, dataIndex: string | number | undefined) => {
    if (clearFilters) {
      clearFilters([]);
    }
    if (dataIndex) {
      columnsDispatch({
        type: 'update',
        dataIndex,
      });
    }
  }, []);

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

    if (clearFiltersRef.current[columnValue.dataIndex] && clearFiltersRef.current[columnValue.dataIndex].clearFilters) {
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

  const handleQueryFormInit = (data) => {
    if (!isQueryInit) {
      setQueryFormValues(data);
      setQueryInit(true);
    }
  };

  const handleQueryFormChange = (data) => {
    isPageChangeNoSearch.current = true;
    setPagination({
      ...paginationState,
      current: 1,
    });
    setQueryFormValues(data);
  };

  const handleQueryFormReset = (data) => {
    isPageChangeNoSearch.current = true;
    setPagination({
      ...paginationState,
      current: 1,
    });
    setQueryFormValues(data);
  };

  const handleQuerySearch = (data) => {
    if (paginationState.current > 1) {
      // 这次修改分页参数
      isPageChangeNoSearch.current = true;

      setPagination({
        ...paginationState,
        current: 1,
      });
      setQueryFormValues(data);
    } else {
      setQueryFormValues(data);
      // let fetchParams = getAllFetchParams();
      // fetchData(fetchParams);
    }
  };

  const getAllFetchParams = () => {
    let fetchParams = {
      ...paginationState,
    };

    // columns sort
    if (sorterState && sorterState.order) {
      fetchParams[sorterState.column.apiSorter.name] = sorterState.column.apiSorter[sorterState.order];
    }

    Object.values(columnsState).forEach((column: any) => {
      const filterKey = column.dataIndex;
      const filterVal = column.value;
      // columns filter
      if (column.apiFilter && filterVal) {
        let filterName = columnsMap[filterKey].apiFilter ? columnsMap[filterKey].apiFilter.name : filterKey;
        fetchParams[filterName] = filterVal;
        if (column.apiFilter.callback) {
          fetchParams[filterName] = columnsMap[filterKey].apiFilter.callback(filterVal);
        }
      }
      // columns search
      if (column.apiSearch && filterVal) {
        const filterName = columnsMap[filterKey].apiSearch ? columnsMap[filterKey].apiSearch.name : filterKey;
        fetchParams[filterName] = Array.isArray(filterVal) ? filterVal[0] : filterVal;
      }
    });

    // query search
    if (searchParams && searchQuery) {
      fetchParams[searchParams.apiName] = searchQuery;
    }

    // queryform
    if (queryFormColumns || (queryFormValues && Object.keys(queryFormValues).length > 0)) {
      fetchParams = {
        ...queryFormValues,
        ...fetchParams,
      };
    }

    return fetchParams;
  };

  const handleReload = () => {
    // pages
    let fetchParams = getAllFetchParams();
    fetchData(fetchParams);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    // 使用组件默认的search回调
    setPagination({
      ...paginationState,
      current: 1,
    });
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
        return !!(columnItem.type === 'filter' && columnItem.value && columnItem.value.length > 0);
      });
    }
    const isSorter = !!checkSorter.column;

    const res = isSearch || isFilter || isSorter;
    setShowRightHeader(res);
  };

  const isSearch = Object.values(columnsState).some((columnItem: any) => {
    return !!(columnItem.type === 'search' && columnItem.value);
  });

  const isFilter = Object.values(columnsState).some((columnItem: any) => {
    return !!(columnItem.type === 'filter' && columnItem.value && columnItem.value.length > 0);
  });

  useImperativeHandle(ref, () => ({
    handleReload,
    goToFirstPage: () => {
      setPagination({
        ...paginationState,
        current: 1,
      });
    },
  }));

  const renderColumns = () => {
    return props.columns.map((columnItem) => {
      const currentItem = _.cloneDeep(columnItem);

      // filter
      if (currentItem.apiFilter) {
        currentItem.filterIcon = () => <FilterOutlined />;
        currentItem.filteredValue = columnsState[columnItem.dataIndex as string].value;
      }

      // // sort
      if (currentItem.apiSorter) {
        currentItem.sortOrder = sorterState.columnKey === currentItem.dataIndex && sorterState.order;
      }

      // Search
      if (currentItem.apiSearch) {
        currentItem.filterIcon = () => <SearchOutlined />;

        currentItem.onFilterDropdownVisibleChange = (visible: boolean) => {
          if (visible && filterSearchInputRef.current && filterSearchInputRef.current.select) {
            setTimeout(() => {
              if (filterSearchInputRef.current && filterSearchInputRef.current.select) {
                filterSearchInputRef.current.select();
              }
              return null;
            });
          }
        };

        currentItem.filterDropdown = ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
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
                    return setSelectedKeys(e.target.value ? [e.target.value] : []);
                  }
                  return [];
                }}
                onPressEnter={() => handleFilterSearch(selectedKeys, confirm, currentItem.dataIndex as string)}
                style={{ width: 188, marginBottom: 8, display: 'block' }}
              />
              <Button
                type='primary'
                onClick={() => handleFilterSearch(selectedKeys, confirm, currentItem.dataIndex as string)}
                icon='search'
                size='small'
                data-testid='search-btn-ok'
                style={{ width: 90, marginRight: 8 }}
              >
                {t('table.filter.search.btn.ok')}
              </Button>
              <Button onClick={() => handleFilterSearchReset(clearFilters, currentItem.dataIndex)} size='small' style={{ width: 90 }}>
                {t('table.filter.search.btn.cancel')}
              </Button>
            </div>
          );
        };

        let searchWords: any[] = [];

        const tmpStateValue = columnsState[currentItem.dataIndex as string].value;
        if (typeof tmpStateValue === 'string') {
          searchWords = [tmpStateValue];
        }

        if (Array.isArray(tmpStateValue) && typeof tmpStateValue[0] === 'string') {
          searchWords = [tmpStateValue[0]];
        }

        currentItem.onFilter = (value, record: any) => {
          return record[currentItem.dataIndex as string].toString().toLowerCase().includes(value.toLowerCase());
        };

        if (!currentItem.render) {
          currentItem.render = (value, row, index) => {
            if (currentItem.searchRender) {
              return currentItem.searchRender(
                value,
                row,
                index,
                <Highlighter highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }} searchWords={searchWords} autoEscape textToHighlight={String(value)} />,
              );
            } else {
              return <Highlighter highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }} searchWords={searchWords} autoEscape textToHighlight={String(value)} />;
            }
          };
        }
      }

      return currentItem;
    });
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
              marginTop: 4,
              display: 'inline-block',
            }}
          >
            {t('table.filter.header.title')}
          </b>
        </div>
        {(isSearch || isFilter) &&
          Object.values(columnsState as IColumnsReducerState).map((columnValue) => {
            if (columnValue.type === 'search' && columnValue.value) {
              return (
                <div key={`search-header-${columnValue.dataIndex}`} className={`${params.headerClsPrefix}-item`}>
                  <Tooltip
                    title={
                      <span>
                        {columnValue.title}
                        {':'}&nbsp;
                        {columnValue.value}
                      </span>
                    }
                  >
                    <Button size='small' className='table-header-item-btn' onClick={() => handleFilterSearchClear(columnValue)}>
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

            if (columnValue.type === 'filter' && columnValue.value && columnValue.value.length > 0) {
              const mappings = columnsMap[columnValue.dataIndex] ? columnsMap[columnValue.dataIndex].filters : [];
              const mapping = mappings.reduce((acc, cur) => {
                return {
                  ...acc,
                  [cur.value]: [cur.text],
                };
              }, {});
              const newValues = columnValue.value.map((valItem) => {
                return mapping && mapping[valItem] ? mapping[valItem] : valItem;
              });
              return (
                <div key={`search-header-${columnValue.dataIndex}`} className={`${params.headerClsPrefix}-item`}>
                  <Tooltip
                    title={
                      <span>
                        {columnValue.title}
                        {':'}&nbsp;
                        {newValues.join(',')}
                      </span>
                    }
                  >
                    <Button size='small' className='table-header-item-btn' onClick={() => handleFilterClear(columnValue)}>
                      <span className='table-header-item-btn-content'>
                        {columnValue.title}
                        {':'}&nbsp;
                        {newValues.join(',')}
                      </span>
                      <CloseOutlined />
                    </Button>
                  </Tooltip>
                </div>
              );
            }
            return null;
          })}
        {sorterState.columnKey && sorterState.column && (
          <div className={`${params.headerClsPrefix}-item`}>
            <Tooltip
              title={
                <span>
                  {columnsMap[sorterState.columnKey].title}
                  {`: ${sorterNames[sorterState.order as TSorterNames]}`}
                </span>
              }
            >
              <Button size='small' className='table-header-item-btn' onClick={handleSortClear}>
                <span className='table-header-item-btn-content'>
                  {columnsMap[sorterState.columnKey].title}
                  {`: ${sorterNames[sorterState.order as TSorterNames]}`}
                </span>
                <CloseOutlined />
              </Button>
            </Tooltip>
          </div>
        )}
        <div className={`${params.headerClsPrefix}-item`}>
          <Button size='small' type='link' data-testid='btn-clearall' onClick={handleClearAll}>
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
          prefix={reloadBtnPos === 'right' && <SearchOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
          suffix={reloadBtnPos === 'left' && <SearchOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
          allowClear={true}
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={searchPlaceholder}
          // suffix={<Icon onClick={handleSearchClick} type="search" />}
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
      return <ReloadOutlined onClick={handleReload} spin={loading} className={reloadBtnCls} type='reload' />;
    }

    if (reloadBtnType === 'btn') {
      const reloadBtnCls = classNames({
        [`${prefixCls}-header-loadbtn`]: true,
        [`${prefixCls}-header-loadbtn-btn`]: true,
        [`${prefixCls}-header-loadbtn-right`]: reloadBtnPos === 'right',
        [`${prefixCls}-header-loadbtn-left`]: reloadBtnPos === 'left',
      });
      return <Button className={reloadBtnCls} loading={loading} icon={<ReloadOutlined />} data-testid='reload-btn' onClick={handleReload} />;
    }
  };

  return (
    <ConfigProvider {...props.antConfig}>
      <div className={tableClassName} style={props.style}>
        {queryFormColumns && (
          <div className={tableQueryCls}>
            <QueryForm
              onChange={isQuerySearchOnChange ? handleQueryFormChange : handleQueryFormInit}
              onReset={handleQueryFormReset}
              onSearch={handleQuerySearch}
              columns={queryFormColumns}
              showOptionBtns={showQueryOptionBtns}
              showCollapseButton={showQueryCollapseButton}
              {...queryFormProps}
            />
          </div>
        )}
        <div className={tableBodyCls}>
          {!!props.tableTitle && <h3> {props.tableTitle} </h3>}
          {props.customHeader && (
            <div data-testid='custom-header' className={`${prefixCls}-header-custom`}>
              {props.customHeader}
            </div>
          )}
          {showFullSearch && (
            <Row type='flex' className={`${prefixCls}-header-search`}>
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
              <Col data-testid='left-header' className={classNames(`${prefixCls}-header-filter-left`, props.leftHeader !== undefined && `${prefixCls}-header-filter-left-minh`)}>
                {props.leftHeader}
              </Col>
              {showReloadBtn2FilterRight && renderReloadBtn()}
            </Row>
          )}
          {filterType === 'none' && showSearch && searchPos === 'right' && (
            <Row className={`${prefixCls}-header-filter`}>
              <Col
                data-testid='left-header'
                className={classNames(`${prefixCls}-header-filter-left`, props.leftHeader !== undefined && `${prefixCls}-header-filter-left-minh`)}
                span={14}
              >
                {showReloadBtn2FilterLeft && renderReloadBtn()}
                {props.leftHeader}
              </Col>
              <Col data-testid='right-header' className={`${prefixCls}-header-filter-right`} span={10}>
                {renderSearch()}
              </Col>
              {showReloadBtn2FilterRight && renderReloadBtn()}
            </Row>
          )}
          {filterType === 'line' && (
            <Row className={`${prefixCls}-header-filter`}>
              {showReloadBtn2FilterLeft && renderReloadBtn()}
              <Col data-testid='right-header' className={`${prefixCls}-header-filter-line`} span={24}>
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
                className={classNames(`${prefixCls}-header-filter-left`, props.leftHeader !== undefined && `${prefixCls}-header-filter-left-minh`)}
                span={12}
              >
                {props.leftHeader}
              </Col>
              <Col data-testid='right-header' className={`${prefixCls}-header-filter-right`} span={12}>
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
                onChange={handleTableChange}
                pagination={{
                  showTotal: showTotal,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  pageSizeOptions: pageSizeOptions,
                  ...props.pagination,
                  ...paginationState,
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

export default React.forwardRef(DataTable);
