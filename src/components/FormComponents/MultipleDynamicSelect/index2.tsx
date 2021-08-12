import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useLayoutEffect,
} from 'react';
import { Input, Dropdown, Tag, Menu, Spin } from 'antd';
import { OptionProps } from 'antd/lib/select';
import { getTagKey, getTagValue } from '@/services/dashboard';
import { PAGE_SIZE_OPTION } from '@/utils/constant';
import {
  MultipleDynamicSelectProps,
  KV,
  K,
  SelectEditType,
} from './definition';
import { time } from 'echarts';
import { useTranslation } from 'react-i18next';
const tagColors = ['gold', 'lime', 'green', 'cyan'];
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

const Index2: React.FC<MultipleDynamicSelectProps> = ({
  value,
  handler,
  onChange,
}) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<Array<OptionProps>>(() => {
    return mockTagOptions;
  });
  const [editType, setEditType] = useState<SelectEditType>(
    SelectEditType.SearchTag,
  );
  const tagWrapperRef = useRef({} as any);
  const inputRef = useRef({} as any);
  const [inputValue, setInputValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [dropdownLeft, setDropdownLeft] = useState<number>(12);
  const [inputWidth, setInputWidth] = useState<number>(0);
  const [showValue, setShowValue] = useState<string[]>(() => {
    if (value && value?.length) {
      return value.map((item) => `${item.key}=${item.value}`);
    } else {
      return [];
    }
  });
  useEffect(() => {
    console.log(
      'alert change',
      showValue
        .filter((item) => item.indexOf('=') !== -1)
        .map((valueItem) => {
          const [k, v] = valueItem.split('=');
          return {
            [k]: v,
          };
        }),
    );
    onChange &&
      onChange(
        showValue
          .filter((item) => item.indexOf('=') !== -1)
          .map((valueItem) => {
            const [k, v] = valueItem.split('=');
            return {
              [k]: v,
            };
          }),
      );
  }, [JSON.stringify(showValue)]);
  useLayoutEffect(() => {
    console.log(t('useLayoutEffect 执行...'));

    if (tagWrapperRef) {
      setDropdownLeft(tagWrapperRef.current.offsetWidth + 12);
    }

    if (inputRef) {
      setInputWidth(inputRef.current.offsetWidth);
    }

    return () => {
      console.log(t('useLayoutEffect 销毁...'));
    };
  });

  const TagRender = (props) => {
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

  const prefix = useMemo(() => {
    return (
      <div>
        <div ref={tagWrapperRef}>
          {showValue.map((tagItem) => (
            <TagRender
              closable
              onClose={() => handleCloseTag(tagItem)}
              label={tagItem}
              key={tagItem}
            ></TagRender>
          ))}
        </div>
      </div>
    );
  }, [JSON.stringify(showValue)]);

  const handleCloseTag = (value: string) => {
    setShowValue(showValue.filter((item) => item !== value));
    setEditType(SelectEditType.SearchTag);
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
    const handler =
      editType === SelectEditType.SearchTag ? getTagKey : getTagValue;
    const handlerKey =
      editType === SelectEditType.SearchValue ? 'tagKey' : 'tagValue';
    handler({
      limit: PAGE_SIZE_OPTION,
      [handlerKey]: e.target.value,
    })
      .then((data) => {
        const { success, dat } = data;
        setOptions(
          dat.keys.map((item) => {
            return {
              label: item,
              value: item,
              component: null,
            };
          }),
        );
        console.log(dat);
      })
      .finally(() => {
        setLoading(false);
      });
    setDropdownVisible(true);
    setLoading(true); // setOptions(
    //   SelectEditType.SearchTag === editType ? mockTagOptions : mockValueOptions,
    // );
  };

  const handleChooseOption = (value: string) => {
    console.log('handle');
    setDropdownVisible(false);

    if (editType === SelectEditType.SearchTag) {
      setEditType(SelectEditType.SearchValue);
      setShowValue([...showValue, value]);
    } else {
      if (showValue.length) {
        const lastValue = showValue[showValue.length - 1];
        setEditType(SelectEditType.SearchTag);
        setShowValue(
          Array.from(
            new Set([...showValue.slice(0, -1), `${lastValue}=${value}`]),
          ),
        );
      }
    }

    setInputValue('');
  };

  const dropdownView = (
    <Menu>
      {options.map((optionItem) => (
        <Menu.Item
          style={{
            lineHeight: '20px',
          }}
          key={optionItem.value}
          onClick={() => handleChooseOption(optionItem.value as string)}
        >
          {optionItem.value}
        </Menu.Item>
      ))}
    </Menu>
  );
  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      <Input
        ref={inputRef}
        prefix={prefix}
        value={inputValue}
        onChange={handleChange}
        allowClear
      ></Input>
      <Dropdown
        trigger={['click']}
        overlay={dropdownView}
        visible={dropdownVisible}
        placement={'bottomLeft'}
      >
        <div
          style={{
            position: 'absolute',
            left: dropdownLeft,
            width: 300,
          }}
        ></div>
      </Dropdown>
    </div>
  );
};

export default Index2;
