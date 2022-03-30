import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/pageLayout';
import { Button, Input, Table, message, Modal } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import { getSubscribeList, deleteSubscribes } from '@/services/subscribe';
import { ColumnsType } from 'antd/lib/table';
import { CopyOutlined, ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { subscribeItem } from '@/store/warningInterface/subscribe';
import ColorTag from '@/components/ColorTag';
import LeftTree from '@/components/LeftTree';
import RefreshIcon from '@/components/RefreshIcon';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';
import { pageSizeOptionsDefault } from '../const';
import './index.less';
import { useTranslation } from 'react-i18next';
const { confirm } = Modal;
import ColumnSelect from '@/components/ColumnSelect';
const Shield: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [query, setQuery] = useState<string>('');
  const { curBusiItem } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const [bgid, setBgid] = useState(undefined);
  const [clusters, setClusters] = useState<string[]>([]);
  const [currentShieldDataAll, setCurrentShieldDataAll] = useState<Array<subscribeItem>>([]);
  const [currentShieldData, setCurrentShieldData] = useState<Array<subscribeItem>>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const columns: ColumnsType = [
    {
      title: t('集群'),
      dataIndex: 'cluster',
      render: (data) => {
        return <div>{data}</div>;
      },
    },
    {
      title: t('告警规则'),
      dataIndex: 'rule_name',
      render: (data) => {
        return <div>{data}</div>;
      },
    },
    {
      title: t('订阅标签'),
      dataIndex: 'tags',
      render: (text: any) => {
        return (
          <>
            {text
              ? text.map((tag, index) => {
                  return tag ? <div key={index}>{`${tag.key} ${tag.func} ${tag.func === 'in' ? tag.value.split(' ').join(', ') : tag.value}`}</div> : null;
                })
              : ''}
          </>
        );
      },
    },
    {
      title: t('告警接收组'),
      dataIndex: 'user_groups',
      render: (text: string, record: subscribeItem) => {
        return (
          <>
            {record.user_groups?.map((item) => (
              <ColorTag text={item.name} key={item.id}></ColorTag>
            ))}
          </>
        );
      },
    },

    {
      title: t('编辑人'),
      ellipsis: true,
      dataIndex: 'update_by',
    },
    {
      title: t('操作'),
      width: '128px',
      dataIndex: 'operation',
      render: (text: undefined, record: subscribeItem) => {
        return (
          <>
            <div className='table-operator-area'>
              <div
                className='table-operator-area-normal'
                style={{
                  cursor: 'pointer',
                  display: 'inline-block',
                }}
                onClick={() => {
                  curBusiItem?.id && history.push(`/alert-subscribes/edit/${record.id}`);
                }}
              >
                {t('编辑')}
              </div>
              <div
                className='table-operator-area-normal'
                style={{
                  cursor: 'pointer',
                  display: 'inline-block',
                }}
                onClick={() => {
                  curBusiItem?.id && history.push(`/alert-subscribes/edit/${record.id}?mode=clone`);
                }}
              >
                {t('克隆')}
              </div>
              <div
                className='table-operator-area-warning'
                style={{
                  cursor: 'pointer',
                  display: 'inline-block',
                }}
                onClick={() => {
                  confirm({
                    title: t('确定删除该订阅规则?'),
                    icon: <ExclamationCircleOutlined />,
                    onOk: () => {
                      dismiss(record.id);
                    },

                    onCancel() {},
                  });
                }}
              >
                {t('删除')}
              </div>
            </div>
          </>
        );
      },
    },
  ];

  useEffect(() => {
    getList();
  }, [curBusiItem]);

  useEffect(() => {
    filterData();
  }, [query, clusters, currentShieldDataAll]);

  const dismiss = (id: number) => {
    deleteSubscribes({ ids: [id] }, curBusiItem.id).then((res) => {
      refreshList();
      if (res.err) {
        message.success(res.err);
      } else {
        message.success(t('删除成功'));
      }
    });
  };

  const filterData = () => {
    const data = JSON.parse(JSON.stringify(currentShieldDataAll));
    const res = data.filter((item: subscribeItem) => {
      const tagFind = item?.tags?.find((tag) => {
        return tag.key.indexOf(query) > -1 || tag.value.indexOf(query) > -1 || tag.func.indexOf(query) > -1;
      });
      const groupFind = item?.user_groups?.find((item) => {
        return item?.name?.indexOf(query) > -1;
      });
      return (item?.rule_name?.indexOf(query) > -1 || !!tagFind || !!groupFind) && ((clusters && clusters?.indexOf(item.cluster) > -1) || clusters?.length === 0);
    });
    setCurrentShieldData(res || []);
  };

  const getList = async () => {
    if (curBusiItem.id) {
      setLoading(true);
      const { success, dat } = await getSubscribeList({ id: curBusiItem.id });
      if (success) {
        setCurrentShieldDataAll(dat || []);
        setLoading(false);
      }
    }
  };

  const refreshList = () => {
    getList();
  };

  const onSearchQuery = (e) => {
    let val = e.target.value;
    setQuery(val);
  };

  const clusterChange = (data) => {
    setClusters(data);
  };

  const busiChange = (data) => {
    setBgid(data);
  };

  return (
    <PageLayout title={t('订阅规则')} icon={<CopyOutlined />}>
      <div className='shield-content'>
        <LeftTree
          busiGroup={{
            // showNotGroupItem: true,
            onChange: busiChange,
          }}
        ></LeftTree>
        {curBusiItem?.id ? (
          <div className='shield-index'>
            <div className='header'>
              <div className='header-left'>
                <RefreshIcon
                  className='strategy-table-search-left-refresh'
                  onClick={() => {
                    refreshList();
                  }}
                />
                <ColumnSelect onClusterChange={(e) => setClusters(e)} />
                <Input onPressEnter={onSearchQuery} className={'searchInput'} prefix={<SearchOutlined />} placeholder={t('搜索规则、标签、接收组')} />
              </div>
              <div className='header-right'>
                <Button
                  type='primary'
                  className='add'
                  onClick={() => {
                    history.push('/alert-subscribes/add');
                  }}
                >
                  {t('新增订阅规则')}
                </Button>
              </div>
            </div>
            <Table
              rowKey='id'
              pagination={{
                total: currentShieldData.length,
                showQuickJumper: true,
                showSizeChanger: true,
                showTotal: (total) => {
                  return `共 ${total} 条数据`;
                },
                pageSizeOptions: pageSizeOptionsDefault,
                defaultPageSize: 30,
              }}
              loading={loading}
              dataSource={currentShieldData}
              columns={columns}
            />
          </div>
        ) : (
          <BlankBusinessPlaceholder text='订阅规则' />
        )}
      </div>
    </PageLayout>
  );
};

export default Shield;
