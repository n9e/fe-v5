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
import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Checkbox, Col, Input, Radio, Row, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { getBusiGroups } from '@/services/common';
import { CommonStoreState } from '@/store/commonInterface';
import _ from 'lodash';
import './index.less';
import { SearchOutlined, SettingOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { eventStoreState } from '@/store/eventInterface';
import classNames from 'classnames';

const CheckboxGroup = Checkbox.Group;
type ChangeFunction = (value: any, item?: any) => void;

interface groupProps {
  isShow?: boolean;
  onChange?: ChangeFunction;
}

interface BusiGroupProps {
  showNotGroupItem?: boolean;
  showAlertings?: boolean;
  onChange?: ChangeFunction;
}

interface LeftTreeProps {
  clusterGroup?: groupProps;
  eventLevelGroup?: groupProps & { defaultSelect?: number | undefined };
  eventTypeGroup?: groupProps & { defaultSelect?: number | undefined };
  busiGroup?: BusiGroupProps;
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
  showBadge?: boolean;
  badgeInfo?: { ['index']?: number };
  onChange?: ChangeFunction;
}

// 内容可选列表
export const SelectList: React.FC<SelectListProps> = ({ dataSource, fieldNames = {}, allowNotSelect = false, defaultSelect, showBadge = true, badgeInfo = {}, onChange }) => {
  const [curSeletedKey, setCurSelectedKey] = useState<string | number>(
    defaultSelect && typeof defaultSelect === 'object' ? defaultSelect[fieldNames.key || 'value'] : defaultSelect,
  );
  const [active, setActive] = useState();

  return (
    <div className='radio-list'>
      {dataSource.map((item: any) => {
        return (
          <Row key={item.id}>
            <Col span={showBadge ? 20 : 24}>
              <div
                className={classNames({
                  'n9e-metric-views-list-content-item': true,
                  active: item.id === active,
                })}
                key={item.id}
                onClick={(e) => {
                  if (item.id !== active) {
                    setActive(item.id);
                    localStorage.setItem('metric-view-id', item.id);
                    onChange && onChange(item.id, item);
                  }
                }}
              >
                <span className='name'>{item.name}</span>
              </div>
            </Col>
            {showBadge && (
              <Col span={4}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Badge count={badgeInfo[item.id] || 0} />
                </div>
              </Col>
            )}
          </Row>
        );
      })}
    </div>
  );
};

// 集群渲染内容
const clustersGroupContent = (clusterGroup: groupProps): IGroupItemProps => {
  const dispatch = useDispatch();
  const { clusters, curClusterItems } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const [indeterminate, setIndeterminate] = useState<boolean>(false);
  const [checkAll, setCheckAll] = useState<boolean>(false);

  const setClusterItems = (curClusterItems) => {
    dispatch({
      type: 'common/saveData',
      prop: 'curClusterItems',
      data: curClusterItems,
    });
    localStorage.setItem('curClusterItems', JSON.stringify(curClusterItems));
    clusterGroup.onChange && clusterGroup.onChange(curClusterItems);
  };
  const onCheckAllChange = (e) => {
    const curCheckedList = e.target.checked ? clusters : [];
    setClusterItems(curCheckedList);
    setIndeterminate(false);
    setCheckAll(e.target.checked);
  };

  // 获取到集群列表数据后抛出默认选择项并同步全选状态
  useEffect(() => {
    setCheckAll(clusters.length === curClusterItems.length);
    setIndeterminate(!!curClusterItems.length && curClusterItems.length < clusters.length);

    if (clusters.length && clusterGroup.onChange) {
      clusterGroup.onChange(curClusterItems);
    }
  }, [clusters]);

  return {
    title: (
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>集群</span>
        {/* <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
          全选
        </Checkbox> */}
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
          value={curClusterItems}
          style={{
            flexShrink: 1,
            overflow: 'auto',
          }}
          onChange={(list: string[]) => {
            setClusterItems(list);
            setIndeterminate(!!list.length && list.length < clusters.length);
            setCheckAll(list.length === clusters.length);
          }}
        ></CheckboxGroup>
      );
    },
  };
};

// 业务组渲染内容
const busiGroupContent = (busiGroupProps: BusiGroupProps): IGroupItemProps => {
  const dispatch = useDispatch();
  const { busiGroups, curBusiItem } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const { alertings } = useSelector<RootState, eventStoreState>((state) => state.event);
  const [filteredBusiGroups, setFilteredBusiGroups] = useState(busiGroups);
  const showNotGroupItem = busiGroupProps.showNotGroupItem;
  // 初始化，当不展示 [未归组对象] 时，选中第一条业务组
  if (!localStorage.getItem('curBusiItem') && !showNotGroupItem && busiGroups.length > 0) {
    localStorage.setItem('curBusiItem', JSON.stringify(busiGroups[0]));
    dispatch({
      type: 'common/saveData',
      prop: 'curBusiItem',
      data: busiGroups[0],
    });
  }
  // 初始化选中项
  const initCurBusiItem = useMemo(() => (curBusiItem.id ? curBusiItem : { id: undefined }), [curBusiItem]);

  // 初始化展示所有业务组
  useEffect(() => {
    if (!filteredBusiGroups.length) {
      setFilteredBusiGroups(busiGroups);
    }
  }, [busiGroups]);

  // 初始化抛出默认选择项
  useEffect(() => {
    if (busiGroups.length && busiGroupProps.onChange && (showNotGroupItem || (!showNotGroupItem && initCurBusiItem.id))) {
      busiGroupProps.onChange(initCurBusiItem.id, initCurBusiItem);
    }
  }, [busiGroups, initCurBusiItem]);

  return {
    title: '业务组',
    isShow: true,
    shrink: true,
    render() {
      return (
        <>
          <Input
            className='left-area-group-search'
            prefix={<SearchOutlined />}
            onPressEnter={(e) => {
              e.preventDefault();
              const value = e.currentTarget.value;
              if (value) {
                getBusiGroups(value).then((res) => {
                  setFilteredBusiGroups(res.dat || []);
                });
              } else {
                getBusiGroups('').then((res) => {
                  const data = res.dat || [];
                  setFilteredBusiGroups(data);
                  dispatch({
                    type: 'common/saveData',
                    prop: 'busiGroups',
                    data,
                  });
                });
              }
            }}
            placeholder={'请输入业务组名称进行筛选'}
          />
          {(!showNotGroupItem && curBusiItem.id && filteredBusiGroups.length !== 0) || showNotGroupItem ? (
            <SelectList
              dataSource={showNotGroupItem ? [{ id: 0, name: '未归组对象' }].concat(filteredBusiGroups) : filteredBusiGroups}
              fieldNames={{ key: 'id', label: 'name', value: 'id' }}
              allowNotSelect={showNotGroupItem}
              defaultSelect={initCurBusiItem}
              showBadge={busiGroupProps.showAlertings}
              badgeInfo={alertings}
              onChange={(value, item) => {
                if (value) {
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
            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', padding: 20, marginLeft: -20 }}>
              <img src='/image/empty.png' width='64' />
              <div className='ant-empty-description'>{'暂无数据'}</div>
            </div>
          )}
        </>
      );
    },
  };
};

// 左侧栏
const LeftTree: React.FC<LeftTreeProps> = ({ clusterGroup = {}, busiGroup = {}, eventLevelGroup = {}, eventTypeGroup = {} }) => {
  const history = useHistory();
  const [collapse, setCollapse] = useState(localStorage.getItem('leftlist') === '1');
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
              { label: '一级告警', value: 1 },
              { label: '二级告警', value: 2 },
              { label: '三级告警', value: 3 },
            ]}
            defaultSelect={eventLevelGroup.defaultSelect}
            allowNotSelect={true}
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
              { label: 'Triggered', value: 0 },
              { label: 'Recovered', value: 1 },
            ]}
            defaultSelect={eventTypeGroup.defaultSelect}
            allowNotSelect={true}
            onChange={eventTypeGroup?.onChange}
          />
        );
      },
    },
  ];

  return (
    <div className={collapse ? 'left-area collapse' : 'left-area'}>
      <div
        className='collapse-btn'
        onClick={() => {
          localStorage.setItem('leftlist', !collapse ? '1' : '0');
          setCollapse(!collapse);
        }}
      >
        {!collapse ? <LeftOutlined /> : <RightOutlined />}
      </div>
      {/* 遍历渲染左侧栏内容 */}
      {groupItems.map(
        ({ title, isShow, shrink = false, render }: IGroupItemProps, i) =>
          isShow && (
            <div key={i} className={`left-area-group ${shrink ? 'group-shrink' : ''}`} style={typeof shrink === 'object' ? shrink.style : {}}>
              <div className='left-area-group-title'>
                {title}
                {title === '业务组' && <SettingOutlined onClick={() => history.push(`/busi-groups`)} />}
              </div>
              {render()}
            </div>
          ),
      )}
    </div>
  );
};

export default LeftTree;
