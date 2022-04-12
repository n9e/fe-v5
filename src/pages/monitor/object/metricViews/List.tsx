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
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { Input, message, Modal, Tag } from 'antd';
import { PlusSquareOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getList, deleteMetricView } from '@/services/metricViews';
import { Range } from '@/components/DateRangePicker';
import { IMatch } from '../types';
import Form from './Form';

interface IProps {
  range: Range;
  onSelect: (item: IMatch) => void;
}

export default function List(props: IProps) {
  const [list, setList] = useState([]);
  const [active, setActive] = useState<number>();
  const [search, setSearch] = useState('');
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('refreshFlag_'));
  useEffect(() => {
    const defaultMetricViewId = localStorage.getItem('metric-view-id') !== null ? Number(localStorage.getItem('metric-view-id')) : null;
    getList().then((res) => {
      setList(res);
      let curId;
      if (!defaultMetricViewId || !_.find(res, { id: defaultMetricViewId })) {
        curId = _.get(_.head(res), 'id');
      } else {
        curId = defaultMetricViewId;
      }
      if (curId) {
        setActive(curId);
        const curItem = _.find(res, { id: curId });
        let configs = {} as IMatch;
        try {
          configs = JSON.parse(curItem.configs);
          configs.id = curId;
          configs.refreshFlag = refreshFlag;
        } catch (e) {
          console.error(e);
        }
        props.onSelect({
          ...configs,
        });
      }
    });
  }, [refreshFlag]);

  return (
    <div className='n9e-metric-views-list'>
      <div className='n9e-metric-views-list-header'>
        <div className='metric-page-title'>快捷视图列表</div>
        <a>
          <PlusSquareOutlined
            onClick={() => {
              Form({
                action: 'add',
                visible: true,
                range: props.range,
                onOk: (record) => {
                  localStorage.setItem('metric-view-id', record.id);
                  setRefreshFlag(_.uniqueId('refreshFlag_'));
                },
              });
            }}
          />
        </a>
      </div>
      <Input
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />
      <div className='n9e-metric-views-list-content'>
        {_.isEmpty(list)
          ? '暂无数据'
          : _.map(
              _.filter(list, (item) => {
                if (search) {
                  let result = true;
                  try {
                    const reg = new RegExp(search, 'gi');
                    result = reg.test(item.name);
                  } catch (e) {
                    console.log(e);
                  }
                  return result;
                }
                return true;
              }),
              (item) => {
                return (
                  <div
                    className={classNames({
                      'n9e-metric-views-list-content-item': true,
                      active: item.id === active,
                    })}
                    key={item.id}
                    onClick={() => {
                      setActive(item.id);
                      localStorage.setItem('metric-view-id', item.id);
                      const curItem = _.find(list, { id: item.id });
                      let configs = {} as IMatch;
                      try {
                        configs = JSON.parse(curItem.configs);
                        configs.id = item.id;
                      } catch (e) {
                        console.error(e);
                      }
                      props.onSelect({
                        ...configs,
                      });
                    }}
                  >
                    <span className='name'>{item.name}</span>
                    {item.cate === 1 ? (
                      <span>
                        <EditOutlined
                          onClick={(e) => {
                            e.stopPropagation();
                            let configs = {} as any;
                            try {
                              configs = JSON.parse(item.configs);
                              configs.dynamicLabels = _.map(configs.dynamicLabels, 'label');
                              configs.dimensionLabels = _.map(configs.dimensionLabels, 'label');
                            } catch (e) {
                              console.error(e);
                            }
                            const initialValues = {
                              id: item.id,
                              name: item.name,
                              ...configs,
                            };
                            Form({
                              action: 'edit',
                              visible: true,
                              range: props.range,
                              initialValues,
                              onOk: () => {
                                localStorage.setItem('metric-view-id', item.id);
                                setRefreshFlag(_.uniqueId('refreshFlag_'));
                              },
                            });
                          }}
                        />
                        <DeleteOutlined
                          onClick={(e) => {
                            e.stopPropagation();
                            Modal.confirm({
                              title: '是否要删除？',
                              onOk: () => {
                                deleteMetricView({
                                  ids: [item.id],
                                }).then(() => {
                                  message.success('删除成功');
                                  setRefreshFlag(_.uniqueId('refreshFlag_'));
                                });
                              },
                            });
                          }}
                        />
                      </span>
                    ) : (
                      <span style={{ color: '#ccc' }}>内置</span>
                    )}
                  </div>
                );
              },
            )}
      </div>
    </div>
  );
}
