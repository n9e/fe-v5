import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button, Input, Table, Switch, Tag, Select, Modal } from 'antd';
const { Option } = Select;
import {
  SearchOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ColumnType } from 'antd/lib/table';
import {
  strategyItem,
  strategyStatus,
} from '@/store/warningInterface';
import { CommonStoreState } from '@/store/commonInterface';
import { RootState } from '@/store/common';
import {
  getStrategyGroupSubList,
  updateAlertRules
} from '@/services/warning';
import { priorityColor } from '@/utils/constant';
import ColorTag from '@/components/ColorTag';
import { pageSizeOptionsDefault } from '@/pages/warning/const';
import dayjs from 'dayjs';

interface props {
  visible: boolean;
  ruleModalClose: Function;
  subscribe: Function;
}

const ruleModal: React.FC<props> = ({
  visible,
  ruleModalClose,
  subscribe
}) => {
  const { t } = useTranslation();
  const { curBusiItem } = useSelector<RootState, CommonStoreState>(state => state.common);
  const { busiGroups } = useSelector<RootState, CommonStoreState>(
    (state) => state.common,
  );
  const [currentStrategyDataAll, setCurrentStrategyDataAll] = useState([]);
  const [currentStrategyData, setCurrentStrategyData] = useState([]);
  const [bgid, setBgid] = useState(curBusiItem.id);
  const [query, setQuery] = useState<string>('');

  useEffect(() => {
    setBgid(curBusiItem.id);
  }, [curBusiItem]);

  useEffect(() => {
    getAlertRules();
  }, [bgid]);

  useEffect(() => {
    filterData();
  }, [query, currentStrategyDataAll])

  const getAlertRules = async () => {
    const { success, dat } = await getStrategyGroupSubList({ id: bgid });
    if (success) {
      setCurrentStrategyDataAll(dat || []);
    }

  }

  const bgidChange = (val) => {
    setBgid(val);
  }

  const filterData = () => {
    const data = JSON.parse(JSON.stringify(currentStrategyDataAll));
    const res = data.filter(item => {
      return (item.name.indexOf(query) > -1 || item.append_tags.join(' ').indexOf(query) > -1)
    });
    setCurrentStrategyData(res || []);
  }

  const onSearchQuery = (e) => {
    let val = e.target.value;
    setQuery(val);
  };

  const columns: ColumnType<strategyItem>[] = [
    {
      title: t('集群'),
      dataIndex: 'cluster',
      render: (data) => {
        return <div>{data}</div>;
      },
    },
    {
      title: t('级别'),
      dataIndex: 'severity',
      render: (data) => {
        return <Tag color={priorityColor[data - 1]}>S{data}</Tag>;
      },
    },
    {
      title: t('名称'),
      dataIndex: 'name',
      render: (data, record) => {
        return (
          <div
            className='table-active-text'
            onClick={() => {
              // handleClickEdit(record.id);
            }}
          >
            {data}
          </div>
        );
      },
    },
    {
      title: t('告警接收者'),
      dataIndex: 'notify_groups_obj',
      render: (data, record) => {

        return (
          (data.length &&
            data.map(
              (
                user: {
                  nickname: string;
                  username: string;
                } & { name: string },
                index: number,
              ) => {
                return (
                  <ColorTag
                    text={user.nickname || user.username || user.name}
                    key={index}
                  ></ColorTag>
                );
              },
            )) || <div></div>
        );
      },
    },
    {
      title: t('附加标签'),
      dataIndex: 'append_tags',
      render: (data) => {
        const array = data || [];
        return (
          (array.length &&
            array.map((tag: string, index: number) => {
              return <ColorTag text={tag} key={index}></ColorTag>;
            })) || <div></div>
        );
      },
    },
    {
      title: t('更新时间'),
      dataIndex: 'update_at',
      render: (text: string) =>
        dayjs(Number(text) * 1000).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: t('启用'),
      dataIndex: 'disabled',
      render: (disabled, record) => (
        <Switch
          checked={disabled === strategyStatus.Enable}
          disabled
          size='small'
          onChange={() => {
            const { id, disabled } = record;
            // updateAlertRules({
            //   ids: [id],
            //   fields: {
            //     disabled: !disabled ? 1 : 0
            //   }
            // }, curBusiItem.id
            // ).then(() => {
            //   refreshList();
            // });
          }}
        />
      ),
    },
    {
      title: t('操作'),
      dataIndex: 'operator',
      fixed: 'right',
      width: 100,
      render: (data, record) => {
        return (
          <div className='table-operator-area'>
            <div
              className='table-operator-area-normal'
              onClick={() => {
                handleSubscribe(record);
              }}
            >
              {t('订阅')}
            </div>

          </div>
        );
      },
    },
  ];

  const handleSubscribe = (record) => {
    subscribe(record);
  }

  const modalClose = () => {
    ruleModalClose();
  }

  return (
    <>
      <Modal
        title={t('订阅告警规则')}
        footer=''
        forceRender
        visible={visible}
        onCancel={() => {
          modalClose();
        }}
        width={'80%'}
      >
        <div>
          <Select 
            style={{width: '280px'}}
            value={bgid}
            onChange={bgidChange}>
            {busiGroups.map(item => (
              <Option value={item.id}>{item.name}</Option>
            ))}
          </Select>
          <Input
            style={{float: 'right', width: '280px'}}
            onPressEnter={onSearchQuery}
            prefix={<SearchOutlined />}
            placeholder={t('搜索标签、屏蔽原因')}
          />
        </div>
        <div className='rule_modal_table'>
          <Table
            rowKey="id"
            pagination={{
              total: currentStrategyData.length,
              showQuickJumper: true,
              showSizeChanger: true,
              showTotal: (total) => {
                return `共 ${total} 条数据`;
              },
              pageSizeOptions: pageSizeOptionsDefault,
              defaultPageSize: 30
            }}
            dataSource={currentStrategyData}
            columns={columns}
          />
        </div>

      </Modal>
    </>
  )
}

export default ruleModal;
