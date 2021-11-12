import React, { useEffect, useMemo, useState } from 'react';
import { Checkbox, Empty, Input } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { getBusiGroups } from '@/services/common';
import { CommonStoreState } from '@/store/commonInterface';
import './index.less';

const CheckboxGroup = Checkbox.Group;
const { Search } = Input;

type ChangeFunction = (value: any, item?: any) => void;

interface groupProps {
  isShow?: boolean;
  onChange?: ChangeFunction;
}

interface LeftTreeProps {
  clusterGroup?: groupProps;
  eventLevelGroup?: groupProps;
  eventTypeGroup?: groupProps;
  busiGroup?: {
    showNotGroupItem?: boolean;
    onChange?: ChangeFunction;
  };
}
interface IGroupItemProps {
  title: string | React.ReactNode;
  isShow?: boolean;
  shrink?:
    | boolean
    | {
        style: object;
      };
  render: Function;
}

interface SelectListProps {
  dataSource: object[];
  fieldNames?: {
    key: string;
    label: string;
    value: string;
  };
  defaultSelect?: object | string | number;
  allowNotSelect?: boolean;
  onChange?: ChangeFunction;
}

// 内容可选列表
export const SelectList: React.FC<SelectListProps> = ({
  dataSource,
  fieldNames = {},
  allowNotSelect = true,
  defaultSelect,
  onChange,
}) => {
  const [curSeletedKey, setCurSelectedKey] = useState<string | number>(
    defaultSelect && typeof defaultSelect === 'object'
      ? defaultSelect[fieldNames.key || 'value']
      : defaultSelect,
  );

  return (
    <div className='select-list'>
      {dataSource.map((item) => {
        const key = item[fieldNames.key || 'value'];
        const label = item[fieldNames.label || 'label'];
        const value = item[fieldNames.value || 'value'];
        return (
          <div
            key={key}
            className={`select-list-item ${
              curSeletedKey === key ? 'select-list-item-active' : ''
            }`}
            onClick={(e) => {
              e.preventDefault();
              if (curSeletedKey !== key) {
                setCurSelectedKey(key);
                onChange && onChange(value, item);
              } else if (allowNotSelect) {
                setCurSelectedKey('');
                onChange && onChange('', {});
              }
            }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
};

// 集群渲染内容
const clustersGroupContent = (clusterGroup: groupProps): IGroupItemProps => {
  const { clusters } = useSelector<RootState, CommonStoreState>(
    (state) => state.common,
  );
  const [checkedList, setCheckedList] = useState<string[]>([]);
  const [indeterminate, setIndeterminate] = useState<boolean>(true);
  const [checkAll, setCheckAll] = useState<boolean>(false);
  const onCheckAllChange = (e) => {
    const curCheckedList = e.target.checked ? clusters : [];
    setCheckedList(curCheckedList);
    setIndeterminate(false);
    setCheckAll(e.target.checked);
    clusterGroup.onChange && clusterGroup.onChange(curCheckedList);
  };

  return {
    title: (
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>集群</span>
        <Checkbox
          indeterminate={indeterminate}
          onChange={onCheckAllChange}
          checked={checkAll}
        >
          全选
        </Checkbox>
      </div>
    ),
    isShow: clusterGroup.isShow,
    shrink: {
      style: {
        flex: 'none',
        maxHeight: '200px',
      },
    },
    render() {
      return (
        <CheckboxGroup
          options={clusters}
          value={checkedList}
          style={{
            flexShrink: 1,
            overflow: 'auto',
          }}
          onChange={(list: string[]) => {
            setCheckedList(list);
            setIndeterminate(!!list.length && list.length < clusters.length);
            setCheckAll(list.length === clusters.length);
            clusterGroup.onChange && clusterGroup.onChange(list);
          }}
        ></CheckboxGroup>
      );
    },
  };
};

// 业务组渲染内容
const busiGroupContent = (busiGroupProps: {
  showNotGroupItem?: boolean;
  onChange?: Function;
}): IGroupItemProps => {
  const dispatch = useDispatch();
  const { busiGroups, curBusiItem } = useSelector<RootState, CommonStoreState>(
    (state) => state.common,
  );
  const [filteredBusiGroups, setFilteredBusiGroups] = useState(busiGroups);
  const showNotGroupItem = busiGroupProps.showNotGroupItem;
  // 根据是否有未归组对象选项初始化选中项
  const initCurBusiItem = useMemo(
    () =>
      showNotGroupItem
        ? JSON.parse(localStorage.getItem('objectCurBusiItem') || '{}')
        : curBusiItem.id
        ? curBusiItem
        : busiGroups.length
        ? busiGroups[0]
        : {},
    [],
  );

  // 初始化后抛出默认选择项
  useEffect(() => {
    if (busiGroupProps.onChange) {
      busiGroupProps.onChange(initCurBusiItem.id, initCurBusiItem);
    }
  }, []);

  // 初始化展示所有业务组
  useEffect(() => {
    if (!filteredBusiGroups.length) {
      setFilteredBusiGroups(busiGroups);
    }
  }, [busiGroups]);

  return {
    title: '业务组',
    isShow: true,
    shrink: true,
    render() {
      return (
        <>
          <Search
            className='left-area-group-search'
            placeholder='请输入业务组名称进行筛选'
            onSearch={(value) => {
              if (value) {
                getBusiGroups(value).then((res) => {
                  setFilteredBusiGroups(res.dat || []);
                });
              } else {
                setFilteredBusiGroups(busiGroups);
              }
            }}
          />
          {busiGroups.length !== 0 || showNotGroupItem ? (
            <SelectList
              dataSource={
                showNotGroupItem
                  ? [{ id: 0, name: '未归组对象' }].concat(filteredBusiGroups)
                  : filteredBusiGroups
              }
              fieldNames={{ key: 'id', label: 'name', value: 'id' }}
              allowNotSelect={showNotGroupItem}
              defaultSelect={initCurBusiItem}
              onChange={(value, item) => {
                if (showNotGroupItem) {
                  localStorage.setItem(
                    'objectCurBusiItem',
                    JSON.stringify(item),
                  );
                } else {
                  dispatch({
                    type: 'common/saveData',
                    prop: 'curBusiItem',
                    data: item,
                  });
                  localStorage.setItem('curBusiItem', JSON.stringify(item));
                }
                busiGroupProps.onChange && busiGroupProps.onChange(value, item);
              }}
            />
          ) : (
            <Empty />
          )}
        </>
      );
    },
  };
};

// 左侧栏
const LeftTree: React.FC<LeftTreeProps> = ({
  clusterGroup = {},
  busiGroup = {},
  eventLevelGroup = {},
  eventTypeGroup = {},
}) => {
  const groupItems: IGroupItemProps[] = [
    clustersGroupContent(clusterGroup),
    busiGroupContent(busiGroup),
    {
      title: '事件级别',
      isShow: eventLevelGroup.isShow,
      render() {
        return (
          <SelectList
            dataSource={[
              { label: '一级告警', value: '1' },
              { label: '二级告警', value: '2' },
              { label: '三级告警', value: '3' },
            ]}
            onChange={eventLevelGroup?.onChange}
          />
        );
      },
    },
    {
      title: '事件类别',
      isShow: eventTypeGroup.isShow,
      render() {
        return (
          <SelectList
            dataSource={[
              { label: 'Triggered', value: false },
              { label: 'Recovered', value: true },
            ]}
            onChange={eventTypeGroup?.onChange}
          />
        );
      },
    },
  ];

  return (
    <div className='left-area'>
      {/* 遍历渲染左侧栏内容 */}
      {groupItems.map(
        ({ title, isShow, shrink = false, render }: IGroupItemProps, i) =>
          isShow && (
            <div
              key={i}
              className={`left-area-group ${shrink ? 'group-shrink' : ''}`}
              style={typeof shrink === 'object' ? shrink.style : {}}
            >
              <div className='left-area-group-title'>{title}</div>
              {render()}
            </div>
          ),
      )}
    </div>
  );
};

export default LeftTree;
