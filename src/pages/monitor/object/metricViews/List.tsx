import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { Input, message, Modal } from 'antd';
import { PlusSquareOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getList, deleteMetricView } from '@/services/metricViews';
import { Range } from '@/components/DateRangePicker';
import { IMatch } from '../types';
import Form from './Form';

interface IProps {
  range: Range;
  onSelect: (item: IMatch) => void;
}

const defaultMetricViewId = localStorage.getItem('metric-view-id') !== null ? Number(localStorage.getItem('metric-view-id')) : null;

export default function List(props: IProps) {
  const [list, setList] = useState([]);
  const [active, setActive] = useState<number>();
  const [search, setSearch] = useState('');
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('refreshFlag_'));
  useEffect(() => {
    getList(props.range).then((res) => {
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
        <div className='page-title'>快捷视图列表</div>
        <a>
          <PlusSquareOutlined
            onClick={() => {
              Form({
                action: 'add',
                visible: true,
                range: props.range,
                onOk: () => {
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
                  return item.name.indexOf(search) > 0;
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
                    }}
                  >
                    <span className='name'>{item.name}</span>
                    <span>
                      <EditOutlined
                        onClick={(e) => {
                          e.stopPropagation();
                          let configs = {} as IMatch;
                          try {
                            configs = JSON.parse(item.configs);
                            configs.dynamicLabels = _.map(configs.dynamicLabels, 'label');
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
                  </div>
                );
              },
            )}
      </div>
    </div>
  );
}
