import { resourceGroupItem } from '@/store/businessInterface';
import { favoriteFrom } from '@/store/common';
import React, { createContext } from 'react';
import { TagDataItem } from './definition';

export const CLASS_PATH_VALUE = 'classpath(资源分组)';
export const CLASS_PATH_PREFIX_VALUE = 'classpath(前缀匹配资源分组)';
export const DEFAULT_VALUE = '*';
export const DEFAULT_NAME = 'var';

export const TagFilterStore = createContext<any>({});
export const INIT_DATA = 'init_data';
export const ADD_ITEM = 'add_item';
export const UPDATE_ITEM = 'update_item';
export const DELETE_ITEM = 'delete_item';
export const DEFAULT_CLASSPATH_DATA: resourceGroupItem = {
  path: '*',
  id: -1,
  isFavorite: false,
  create_at: 0,
  create_by: 0,
  update_at: 0,
  update_by: 0,
  isBelongIn: favoriteFrom.Common,
  note: '',
  preset: 0,
};

const filterErrorList = (list: Array<TagDataItem>) => {
  let duplicateList: number[] = [];
  let nonNameList: number[] = [];
  let invalidList: number[] = [];
  let hasClassPath = false;
  const newMap = new Map<string, number[]>();
  list.forEach((filterItem, index) => {
    const { tagName, key } = filterItem;
    const mapData = newMap.get(tagName);
    if (typeof mapData === 'undefined') {
      newMap.set(tagName, [index]);
    } else {
      newMap.set(tagName, [...mapData, index]);
    }
    if (tagName === '') {
      nonNameList.push(index);
    }
    if (key === CLASS_PATH_VALUE || key === CLASS_PATH_PREFIX_VALUE) {
      hasClassPath = true;
    }
    if (!/^\w+$/g.test(tagName)) {
      invalidList.push(index);
    }
  });
  for (let i of newMap.values()) {
    if (Array.isArray(i) && i.length > 1) {
      duplicateList = duplicateList.concat(i);
    }
  }
  return {
    duplicateList,
    nonNameList,
    invalidList,
    hasClassPath,
  };
};

export const TagFilterReducer = function (state, action) {
  switch (action.type) {
    case INIT_DATA: {
      return {
        ...state,
        ...action.data,
        hasInit: true,
      };
    }
    case ADD_ITEM: {
      const newList = [
        ...state.tagList,
        {
          tagName: DEFAULT_NAME,
          key: '',
          value: DEFAULT_VALUE,
          prefix: false,
        },
      ];
      return {
        ...state,
        tagList: newList,
        ...filterErrorList(newList),
      };
    }
    case UPDATE_ITEM: {
      const newList = state.tagList;
      newList[action.index] = action.data;
      return {
        ...state,
        tagList: newList,
        ...filterErrorList(newList),
      };
    }
    case DELETE_ITEM: {
      state.tagList.splice(action.index, 1);
      return {
        ...state,
        tagList: state.tagList,
        ...filterErrorList(state.tagList),
      };
    }
    default: {
      return state;
    }
  }
};
