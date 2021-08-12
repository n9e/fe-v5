import React, { useState, useEffect, useImperativeHandle } from 'react';
import { PaginationProps, Table, TableProps } from 'antd';
import { PAGE_SIZE, PAGE_SIZE_MAX } from '@/utils/constant';
import {
  baseFePagingData,
  baseFePagingReq,
  basePagingData,
  basePagingReq,
  IBasePagingParams,
} from '@/store/common';
import { useTranslation } from 'react-i18next';
export type IBaseTableProps<RecordType = any> = TableProps<RecordType> & {
  /**
   * @desc table请求接口
   */
  fetchHandle: (
    data: IBasePagingParams,
  ) => Promise<basePagingReq<RecordType> | baseFePagingReq<RecordType>>;
  /**
   * @desc 请求返回的数据
   */

  onFetchList?: (list: Array<RecordType>) => unknown;
  /**
   * @desc 是否需要分页
   */

  needPagination?: boolean;
  /**
   * @desc 是否前端分页, 前端分页同时也就是前端维护query
   */

  fePaging?: boolean;
  /**
   * @desc 前端搜索关键字: 从fetchParams传入,默认为query
   */

  feQueryKey?: string;
  /**
   * @desc 前端搜索不变的值,如果固定字段改变则重新拉取数据.不填,当为前端搜索时每次都会重新拉取数据
   */

  feFixedKey?: string;
  /**
   * @desc 前端搜索匹配表格字段, 如果为内嵌字段,对象使用.连接, 数组使用[3]连接, 比如data.data.key[3]
   */

  feQueryParams?: Array<string>;
  /**
   * @desc 默认分页大小, 默认15
   */

  pageSize?: number;
  /**
   * @desc 是否自动请求数据
   */

  autoFetch?: boolean;
  /**
   * @desc 初次请求时机, 当第一次initFetch为true时触发, 需要autoFetch为false
   */

  initFetch?: boolean;
  /**
   * @desc 请求查询数据
   */

  fetchParams?: Object;
  /**
   * @desc 分页配置
   */

  paginationProps?: PaginationProps;
};
type refType = {
  refreshList: () => {};
} | null; // type refFunction<T = any> = React.ForwardRefRenderFunction<
//   refType,
//   IBaseTableProps<T>
// >;

export function isBaseReqData(data: any): data is basePagingData {
  return Array.isArray(data.list);
}
export function isBaseFeReqData(data: any): data is baseFePagingData {
  return Array.isArray(data);
}

const BaseTable = function <T extends Object>(
  {
    fetchHandle,
    fetchParams = {},
    needPagination = true,
    pageSize,
    feQueryKey = 'query',
    feFixedKey = 'id',
    feQueryParams = [],
    fePaging = false,
    autoFetch = true,
    initFetch = false,
    onFetchList,
    paginationProps,
    ...tableProps
  }: IBaseTableProps<T>,
  ref: any,
) {
  const { t } = useTranslation();
  const [dataList, setDataList] = useState<T[]>([]);
  const [filterDataList, setFilterDataList] = useState<T[]>([]);
  const [currentDataList, setCurrentDataList] = useState<T[]>([]);
  const [hasInit, setHasInit] = useState<boolean>(false);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [defaultPageSize, setDefaultPageSize] = useState<number>(() => {
    return pageSize || PAGE_SIZE;
  });
  const [lastFetchParams, setLastFetchParams] = useState<Object>({});
  useEffect(() => {
    if (autoFetch) {
      fetchData();
      setHasInit(true);
    }
  }, []);
  useEffect(() => {
    if (!autoFetch && initFetch) {
      fetchData();
      setHasInit(true);
    }
  }, [initFetch]);
  useEffect(() => {
    if (hasInit) {
      if (!fePaging) {
        fetchData();
      } else {
        const targetList = filterDataList.slice(
          (pageNumber - 1) * defaultPageSize,
          pageNumber * defaultPageSize,
        );
        setCurrentDataList(targetList);
        onFetchList && onFetchList(targetList);
      }
    }
  }, [pageNumber, defaultPageSize]);
  useEffect(() => {
    if (!fePaging) {
      if (pageNumber === 1) {
        if (hasInit) {
          fetchData();
        }
      } else {
        setPageNumber(1);
      }
    } else {
      if (
        lastFetchParams[feFixedKey] &&
        lastFetchParams[feFixedKey] === fetchParams[feFixedKey]
      ) {
        feResetByQuery(dataList);
        setPageNumber(1);
      } else {
        if (pageNumber === 1) {
          if (hasInit) {
            fetchData();
          }
        } else {
          setPageNumber(1);
        }
      }

      setLastFetchParams(fetchParams);
    }
  }, [JSON.stringify(fetchParams)]);

  const packagingFetchParams = () => {
    return { ...fetchParams, p: pageNumber, limit: defaultPageSize };
  };

  const fetchData = async () => {
    setLoading(true);
    const { success, dat } = await fetchHandle(packagingFetchParams());

    if (success) {
      if (!fePaging && isBaseReqData(dat)) {
        setDataList(dat.list || []);
        setTotal(dat.total);
        onFetchList && onFetchList(dat.list || []);
      } else {
        setDataList(dat || []); // 因为接口直接返回数组,这里先处理这一种情况, 后期有其他接口情况再封装

        feResetByQuery(dat || []);
      }
    }

    setLoading(false);
  };

  const feResetByQuery = (data: T[]) => {
    if (Array.isArray(data)) {
      const query = fetchParams[feQueryKey] || '';
      const filteredData = data.filter((dataItem) => {
        let flag = false;

        if (
          query === '' ||
          !Array.isArray(feQueryParams) ||
          feQueryParams.length === 0
        ) {
          flag = true;
          return flag;
        } else {
          feQueryParams.forEach((paramItem: string) => {
            const stringData = getRealData(paramItem, dataItem);

            if (typeof stringData === 'string') {
              flag = flag || stringData.indexOf(query) !== -1;
            }
          });
        }

        return flag;
      });
      setFilterDataList(filteredData);
      setTotal(filteredData.length);
      const targetList = filteredData.slice(
        (pageNumber - 1) * defaultPageSize,
        pageNumber * defaultPageSize,
      );
      setCurrentDataList(targetList);
      onFetchList && onFetchList(targetList);
    } else {
      setFilterDataList([]);
      setTotal(0);
      setCurrentDataList([]);
      onFetchList && onFetchList([]);
    }
  };
  /**
   * 找到最终匹配的数据, 匹配失败返回
   * @param keyString eg: data.data.key[2]
   * @param data
   */

  const getRealData = (keyString, data) => {
    const curObject = () => {
      const index = keyString.indexOf('.');
      const key = keyString.slice(0, index);

      if (data[key]) {
        return getRealData(
          keyString.slice(index + 1, keyString.length),
          data[key],
        );
      } else {
        return '';
      }
    };

    const curArray = () => {
      let leftIndex = keyString.indexOf('[');
      if (leftIndex <= 0) return '';
      let rightIndex = keyString.indexOf(']');
      const dataKey = keyString.slice(0, leftIndex);
      const targetData = data[dataKey];

      if (Array.isArray(targetData) && targetData.length) {
        if (rightIndex !== -1) {
          const matchArray = keyString.match(/\[(\w+)\]/);

          if (matchArray.length < 2) {
            return '';
          } else {
            const key = matchArray[1];

            if (targetData[key]) {
              if (rightIndex === keyString.length - 1) {
                return targetData[key];
              } else {
                return getRealData(
                  keyString.slice(rightIndex + 1, keyString.length),
                  data[key],
                );
              }
            } else {
              return '';
            }
          }
        } else {
          return '';
        }
      } else {
        return '';
      }
    };

    if (keyString.indexOf('.') !== -1 && keyString.indexOf('[') !== -1) {
      return keyString.indexOf('.') < keyString.indexOf('[')
        ? curObject()
        : curArray();
    } else if (keyString.indexOf('.') !== -1) {
      return curObject();
    } else if (keyString.indexOf('[') !== -1) {
      return curArray();
    } else {
      return data[keyString] || '';
    }
  };

  const refreshList = () => {
    fetchData();
  };

  const handleSizeChange = (current: number, pageSize: number) => {
    setDefaultPageSize(pageSize);
    setPageNumber(1);
  };

  useImperativeHandle(ref, () => ({
    refreshList,
  }));
  return (
    <Table<T>
      dataSource={!fePaging ? dataList : currentDataList}
      pagination={{
        showTotal: (total) => `Total ${total} items`,
        current: pageNumber,
        pageSize: defaultPageSize,
        onChange: setPageNumber,
        total: total,
        showSizeChanger: true,
        onShowSizeChange: handleSizeChange,
        ...paginationProps,
      }}
      loading={loading}
      {...tableProps}
    ></Table>
  );
};

export default React.forwardRef(BaseTable);
