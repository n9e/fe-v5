import React, { useEffect, useMemo, useState } from 'react';
import { Checkbox, Empty, Input } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { getBusiGroups } from '@/services/common';
import { CommonStoreState } from '@/store/commonInterface';
import './index.less';

const CheckboxGroup = Checkbox.Group;
const { Search } = Input;

interface LeftTreeProps {
  additionGroupItems?: IGroupItemProps[];
  showClusterGroup?: boolean;
  showNotGroupBusiItem?: boolean;
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
  onChange?: Function;
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
      ? defaultSelect[fieldNames.key || 'value'] || ''
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
const clustersGroupContent = (showClusterGroup: boolean): IGroupItemProps => {
  const dispatch = useDispatch();
  const { clusters, selectedClusters } = useSelector<
    RootState,
    CommonStoreState
  >((state) => state.common);
  const [checkedList, setCheckedList] = useState(selectedClusters);
  const [indeterminate, setIndeterminate] = useState(true);
  const [checkAll, setCheckAll] = useState(false);
  const onCheckAllChange = (e) => {
    setCheckedList(e.target.checked ? clusters : []);
    setIndeterminate(false);
    setCheckAll(e.target.checked);
    localStorage.setItem(
      'selectedClusters',
      JSON.stringify(e.target.checked ? clusters : []),
    );
  };

  useEffect(() => {
    if (!checkedList.length) {
      setCheckedList(selectedClusters.length ? selectedClusters : clusters);
    }
  }, [clusters]);

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
    isShow: showClusterGroup,
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
            dispatch({
              type: 'common/saveData',
              prop: 'selectedClusters',
              data: list,
            });
            localStorage.setItem('selectedClusters', JSON.stringify(list));
          }}
        ></CheckboxGroup>
      );
    },
  };
};

// 业务组渲染内容
const busiGroupContent = (showNotGroupBusiItem: boolean): IGroupItemProps => {
  const dispatch = useDispatch();
  const { busiGroups, curBusiItem } = useSelector<RootState, CommonStoreState>(
    (state) => state.common,
  );
  const [filteredBusiGroups, setFilteredBusiGroups] = useState(busiGroups);
  // 根据是否有未归组对象选项初始化选中项
  const initCurBusiItem = useMemo(
    () =>
      showNotGroupBusiItem
        ? JSON.parse(localStorage.getItem('objectCurBusiItem') || '{}')
        : curBusiItem.id
        ? curBusiItem
        : busiGroups.length
        ? busiGroups[0]
        : {},
    [],
  );
  console.log('filteredBusiGroups===', filteredBusiGroups);

  useEffect(() => {
    if (!filteredBusiGroups.length) {
      setFilteredBusiGroups(busiGroups);
    }
  }, [busiGroups]);

  return {
    title: '业务组',
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
          {busiGroups.length !== 0 || showNotGroupBusiItem ? (
            <SelectList
              dataSource={
                showNotGroupBusiItem
                  ? [{ id: -1, name: '未归组对象' }].concat(filteredBusiGroups)
                  : filteredBusiGroups
              }
              fieldNames={{ key: 'id', label: 'name', value: 'id' }}
              allowNotSelect={false}
              defaultSelect={initCurBusiItem}
              onChange={(value, item) => {
                if (showNotGroupBusiItem) {
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
  additionGroupItems,
  showClusterGroup = true,
  showNotGroupBusiItem = false,
}) => {
  const initGroupItems: IGroupItemProps[] = [
    clustersGroupContent(showClusterGroup),
    busiGroupContent(showNotGroupBusiItem),
    // 活跃告警和预警告警相应内容，放到对应的页面
    // {
    //   title: '事件级别',
    //   render() {
    //     return (
    //       <SelectList
    //         dataSource={[
    //           { label: '一级告警', value: '1' },
    //           { label: '二级告警', value: '2' },
    //           { label: '三级告警', value: '3' },
    //         ]}
    //         onChange={(value) => {
    //           console.log(value);
    //         }}
    //       />
    //     );
    //   },
    // },
    // {
    //   title: '事件类别',
    //   render() {
    //     return (
    //       <SelectList
    //         dataSource={[
    //           { label: 'Triggered', value: false },
    //           { label: 'Recovered', value: true },
    //         ]}
    //         onChange={(value) => {
    //           console.log(value);
    //         }}
    //       />
    //     );
    //   },
    // },
  ];
  const groupItems = initGroupItems.concat(additionGroupItems || []);

  return (
    <div className='left-area'>
      {/* 遍历渲染左侧栏内容 */}
      {groupItems.map(({ title, isShow = true, shrink = false, render }, i) =>
        isShow ? (
          <div
            key={i}
            className={`left-area-group ${shrink ? 'group-shrink' : ''}`}
            style={typeof shrink === 'object' ? shrink.style : {}}
          >
            <div className='left-area-group-title'>{title}</div>
            {render()}
          </div>
        ) : (
          <></>
        ),
      )}
    </div>
  );
};

export default LeftTree;
