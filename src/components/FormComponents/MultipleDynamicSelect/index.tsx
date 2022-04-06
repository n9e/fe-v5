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
import React, { useState, useEffect } from 'react';
import { Select, Tag } from 'antd';
import {
  MultipleDynamicSelectProps,
  KV,
  K,
  SelectEditType,
} from './definition';
import { getTagKey, getTagValue } from '@/services/dashboard';
import { PAGE_SIZE_OPTION } from '@/utils/constant';
import _ from 'lodash';
import { OptionProps } from 'antd/lib/select';
import { useTranslation } from 'react-i18next';
const mockTagOptions: OptionProps[] = [
  {
    label: 'a',
    value: 'a',
    children: null,
  },
  {
    label: 'b',
    value: 'b',
    children: null,
  },
  {
    label: 'c',
    value: 'c',
    children: null,
  },
  {
    label: 'd',
    value: 'd',
    children: null,
  },
];
const mockValueOptions: OptionProps[] = [
  {
    label: 'e',
    value: 'e',
    children: null,
  },
  {
    label: 'f',
    value: 'f',
    children: null,
  },
  {
    label: 'g',
    value: 'g',
    children: null,
  },
  {
    label: 'h',
    value: 'h',
    children: null,
  },
];
const tagColors = ['gold', 'lime', 'green', 'cyan'];

const MultipleDynamicSelect: React.FC<MultipleDynamicSelectProps> = ({
  value,
  handler,
  onChange,
}) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<Array<OptionProps>>([]);
  const [editType, setEditType] = useState<SelectEditType>(
    SelectEditType.SearchTag,
  );
  const [showValue, setShowValue] = useState<string[]>(() => {
    if (value && value?.length) {
      return value.map((item) => `${item.key}=${item.value}`);
    } else {
      return [];
    }
  });
  const [currentTag, setCurrentTag] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = (value: string) => {
    console.log(value, 'search');
    const handler =
      editType === SelectEditType.SearchTag ? getTagKey : getTagValue;
    setLoading(true);
    handler({
      limit: PAGE_SIZE_OPTION,
      tag_key: value,
    })
      .then((data) => {
        const { success, dat } = data;
        console.log(dat);
      })
      .finally(() => {
        setLoading(false);
      });

    if (value) {
      setOptions(
        SelectEditType.SearchTag === editType
          ? mockTagOptions
          : mockValueOptions,
      );
    } else {
      setOptions([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    onChange &&
      onChange(
        showValue.map((valueItem) => {
          const [k, v] = valueItem.split('=');
          return {
            [k]: v,
          };
        }),
      );
  }, [JSON.stringify(options)]);

  const tagRender = (props) => {
    const { label, closable, onClose } = props;

    const onPreventMouseDown = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const sumCharCode: number = Array.from(label).reduce<number>(
      (prev: number, item: string) => {
        return prev + item.charCodeAt(0);
      },
      0,
    );
    return (
      <Tag
        color={tagColors[sumCharCode % 4]}
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{
          marginRight: 3,
        }}
      >
        {label}
      </Tag>
    );
  };

  const handleOnChange = (values: string[], options) => {
    console.log(values, options); // 首先判断 onChange 是选中 还是删除了

    if (values.length) {
      const lastValue = values[values.length - 1];

      if (lastValue.indexOf('=') === -1) {
        // 根据最后一个元素
        if (editType === SelectEditType.SearchTag) {
          setEditType(SelectEditType.SearchValue);
          setShowValue([...showValue, lastValue]);
          setCurrentTag(lastValue);
        } else {
          setEditType(SelectEditType.SearchTag);
          setShowValue(
            Array.from(
              new Set([
                ...showValue.slice(0, -1),
                `${currentTag}=${lastValue}`,
              ]),
            ),
          );
        }
      } else {
        setEditType(SelectEditType.SearchTag);
        setShowValue([...values]);
      }
    } else {
      setEditType(SelectEditType.SearchTag);
      setShowValue([]);
    }

    setOptions([]);
  };

  const handleClear = () => {
    console.log('clear');
  };

  return (
    <Select
      mode='multiple'
      onChange={handleOnChange}
      onSearch={handleSearch}
      style={{
        width: '100%',
      }}
      value={showValue}
      onClear={handleClear}
      tagRender={tagRender}
      loading={loading}
      dropdownStyle={{
        left: 50,
        width: '50%',
        minWidth: 20,
      }}
      dropdownMatchSelectWidth={false}
      options={options}
      filterOption={(data, option) => {
        if (option) {
          return showValue.indexOf(option.value) === -1;
        } else {
          return false;
        }
      }}
    ></Select>
  );
};

export default MultipleDynamicSelect;
