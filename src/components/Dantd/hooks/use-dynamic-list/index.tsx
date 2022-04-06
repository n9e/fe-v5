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
import { useState, useRef, useCallback } from 'react';

export default function useDynamicList<T>(initialValue: T[]) {
  const counterRef = useRef(-1);
  // key 存储器
  const keyList = useRef<number[]>([]);

  // 内部方法
  const setKey = useCallback((index: number) => {
    counterRef.current += 1;
    keyList.current.splice(index, 0, counterRef.current);
  }, []);

  const [list, setList] = useState(() => {
    (initialValue || []).forEach((_, index) => {
      setKey(index);
    });
    return initialValue || [];
  });

  const resetList = (newList: T[] = []) => {
    keyList.current = [];
    counterRef.current = -1;
    setList(() => {
      (newList || []).forEach((_, index) => {
        setKey(index);
      });
      return newList || [];
    });
  };

  const insert = (index: number, obj: T) => {
    setList((l) => {
      const temp = [...l];
      temp.splice(index, 0, obj);
      setKey(index);
      return temp;
    });
  };

  const getKey = (index: number) => keyList.current[index];
  const getIndex = (index: number) =>
    keyList.current.findIndex((ele) => ele === index);

  const merge = (index: number, obj: T[]) => {
    setList((l) => {
      const temp = [...l];
      obj.forEach((_, i) => {
        setKey(index + i);
      });
      temp.splice(index, 0, ...obj);
      return temp;
    });
  };

  const replace = (index: number, obj: T) => {
    setList((l) => {
      const temp = [...l];
      temp[index] = obj;
      return temp;
    });
  };

  const remove = (index: number) => {
    setList((l) => {
      const temp = [...l];
      temp.splice(index, 1);

      // remove keys if necessary
      try {
        keyList.current.splice(index, 1);
      } catch (e) {
        console.error(e);
      }
      return temp;
    });
    setTimeout(() => {
      setList(list.filter((lItem, lIdx) => lIdx !== index));
    });
  };

  const move = (oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex) {
      return;
    }
    setList((l) => {
      const newList = [...l];
      const temp = newList.filter((_: {}, index: number) => index !== oldIndex);
      temp.splice(newIndex, 0, newList[oldIndex]);

      // move keys if necessary
      try {
        const keyTemp = keyList.current.filter(
          (_: {}, index: number) => index !== oldIndex,
        );
        keyTemp.splice(newIndex, 0, keyList.current[oldIndex]);
        keyList.current = keyTemp;
      } catch (e) {
        console.error(e);
      }

      return temp;
    });
  };

  const push = (obj: T) => {
    setList((l) => {
      setKey(l.length);
      return l.concat([obj]);
    });
  };

  const pop = () => {
    // remove keys if necessary
    try {
      keyList.current = keyList.current.slice(0, keyList.current.length - 1);
    } catch (e) {
      console.error(e);
    }

    setList((l) => l.slice(0, l.length - 1));
  };

  const unshift = (obj: T) => {
    setList((l) => {
      setKey(0);
      return [obj].concat(l);
    });
  };

  const sortForm = (result: unknown[]) =>
    result
      .map((item, index) => ({ key: index, item })) // add index into obj
      .sort((a, b) => getIndex(a.key) - getIndex(b.key)) // sort based on the index of table
      .filter((item) => !!item.item) // remove undefined(s)
      .map((item) => item.item); // retrive the data

  const shift = () => {
    // remove keys if necessary
    try {
      keyList.current = keyList.current.slice(1, keyList.current.length);
    } catch (e) {
      console.error(e);
    }
    setList((l) => l.slice(1, l.length));
  };

  return {
    list,
    insert,
    merge,
    replace,
    remove,
    getKey,
    getIndex,
    move,
    push,
    pop,
    unshift,
    shift,
    sortForm,
    resetList,
  };
}
