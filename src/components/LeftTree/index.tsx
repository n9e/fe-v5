import React, { useEffect, useMemo, useState } from 'react';
import { Checkbox, Input } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import './index.less';

const CheckboxGroup = Checkbox.Group;
const { Search } = Input;

interface LeftTreeProps {
  additionGroupItems?: IGroupItemProps[];
  isShowClusterGroup?: boolean;
}
interface IGroupItemProps {
  title: string | React.ReactNode;
  isShow?: boolean;
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
    <div className='left-area-group-list'>
      {dataSource.map((item) => {
        const key = item[fieldNames.key || 'value'];
        const label = item[fieldNames.label || 'label'];
        const value = item[fieldNames.value || 'value'];
        return (
          <div
            key={key}
            className={`left-area-group-list-item ${
              curSeletedKey === key ? 'left-area-item-list-item-active' : ''
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

// 侧栏分组
const GroupItem: React.FC<IGroupItemProps> = ({
  title,
  isShow = true,
  render,
}) => {
  return isShow ? (
    <div className='left-area-group'>
      <div className='left-area-group-title'>{title}</div>
      {render()}
    </div>
  ) : (
    <></>
  );
};

// 左侧栏
const LeftTree: React.FC<LeftTreeProps> = ({
  additionGroupItems,
  isShowClusterGroup = true,
}) => {
  const dispatch = useDispatch();
  const { clusters, selectedClusters, busiGroups, curBusiItem } = useSelector<
    RootState,
    CommonStoreState
  >((state) => state.common);

  // 集群全选相关状态和方法
  const [checkedList, setCheckedList] = React.useState(selectedClusters);
  const [indeterminate, setIndeterminate] = React.useState(true);
  const [checkAll, setCheckAll] = React.useState(false);
  const onCheckAllChange = (e) => {
    setCheckedList(e.target.checked ? clusters : []);
    setIndeterminate(false);
    setCheckAll(e.target.checked);
    localStorage.setItem(
      'selectedClusters',
      JSON.stringify(e.target.checked ? clusters : []),
    );
  };

  const initGroupItems: IGroupItemProps[] = [
    {
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
      isShow: isShowClusterGroup,
      render() {
        return (
          <CheckboxGroup
            options={clusters}
            value={checkedList}
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
    },
    {
      title: '业务组',
      render() {
        return (
          <>
            <Search
              className='left-area-group-search'
              placeholder='请输入业务组筛选'
              onSearch={(value) => {
                dispatch({ type: 'common/getBusiGroups', query: value });
              }}
            />
            <SelectList
              dataSource={busiGroups}
              fieldNames={{ key: 'id', label: 'name', value: 'id' }}
              allowNotSelect={false}
              defaultSelect={curBusiItem}
              onChange={(value, item) => {
                dispatch({
                  type: 'common/saveData',
                  prop: 'curBusiItem',
                  data: item,
                });
                localStorage.setItem('curBusiItem', JSON.stringify(item));
              }}
            />
          </>
        );
      },
    },
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

  useEffect(() => {
    dispatch({ type: 'common/getClusters' });
    dispatch({ type: 'common/getBusiGroups' });
  }, []);

  return (
    <div className='left-area'>
      {groupItems.map((config) => (
        <GroupItem {...config} />
      ))}
    </div>
  );
};

export default LeftTree;
