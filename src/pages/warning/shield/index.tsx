import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/pageLayout';
import { Button, Input, Table, Tooltip, Tag, message, Modal } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/common';
import { getShieldList, deleteShields } from '@/services/shield';
import { CloseCircleOutlined, ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { CommonStoreState } from '@/store/commonInterface';
import { shieldItem } from '@/store/warningInterface';
import { ColumnsType } from 'antd/lib/table';
import dayjs from 'dayjs';
import LeftTree from '@/components/LeftTree';
import RefreshIcon from '@/components/RefreshIcon';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';
import { pageSizeOptionsDefault } from '../const';
import './index.less';
import { useTranslation } from 'react-i18next';
const { confirm } = Modal;

const Shield: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();
  const [query, setQuery] = useState<string>('');
  const { curBusiItem } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const [bgid, setBgid] = useState(undefined);
  const [clusters, setClusters] = useState<string[]>([]);
  const [currentShieldDataAll, setCurrentShieldDataAll] = useState<Array<shieldItem>>([]);
  const [currentShieldData, setCurrentShieldData] = useState<Array<shieldItem>>([]);
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
      title: t('标签'),
      dataIndex: 'tags',
      render: (text: any) => {
        return (
          <>
            {text
              ? text.map((tag, index) => {
                  return tag ? (
                    // <ColorTag text={`${tag.key} ${tag.func} ${tag.func === 'in' ? tag.value.split(' ').join(', ') : tag.value}`} key={index}>
                    // </ColorTag>
                    <div key={index}>{`${tag.key} ${tag.func} ${tag.func === 'in' ? tag.value.split(' ').join(', ') : tag.value}`}</div>
                  ) : null;
                })
              : ''}
          </>
        );
      },
    },
    {
      title: t('屏蔽原因'),
      dataIndex: 'cause',
      render: (text: string, record: shieldItem) => {
        return (
          <>
            <Tooltip placement='topLeft' title={text}>
              <div
                style={{
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {text}
              </div>
            </Tooltip>
            by {record.create_by}
          </>
        );
      },
    },
    {
      title: t('屏蔽时间'),
      dataIndex: 'btime',
      render: (text: number, record: shieldItem) => {
        return (
          <div className='shield-time'>
            <div>
              {t('开始:')}
              {dayjs(record?.btime * 1000).format('YYYY-MM-DD HH:mm:ss')}
            </div>
            <div>
              {t('结束:')}
              {dayjs(record?.etime * 1000).format('YYYY-MM-DD HH:mm:ss')}
            </div>
          </div>
        );
      },
    },
    // {
    //   title: t('创建人'),
    //   ellipsis: true,
    //   dataIndex: 'create_by',
    // },
    {
      title: t('操作'),
      width: '98px',
      dataIndex: 'operation',
      render: (text: undefined, record: shieldItem) => {
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
                  dispatch({
                    type: 'shield/setCurShieldData',
                    data: record,
                  });
                  curBusiItem?.id && history.push(`/alert-mutes/edit/${record.id}?mode=clone`);
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
                    title: t('确定删除该告警屏蔽?'),
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
    deleteShields({ ids: [id] }, curBusiItem.id).then((res) => {
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
    const res = data.filter((item: shieldItem) => {
      const tagFind = item.tags.find((tag) => {
        return tag.key.indexOf(query) > -1 || tag.value.indexOf(query) > -1 || tag.func.indexOf(query) > -1;
      });
      return (item.cause.indexOf(query) > -1 || !!tagFind) && ((clusters && clusters?.indexOf(item.cluster) > -1) || clusters?.length === 0);
    });
    setCurrentShieldData(res || []);
  };

  const getList = async () => {
    setLoading(true);
    const { success, dat } = await getShieldList({ id: curBusiItem.id });
    if (success) {
      setCurrentShieldDataAll(dat || []);
      setLoading(false);
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
    <PageLayout title={t('屏蔽规则')} icon={<CloseCircleOutlined />} hideCluster>
      <div className='shield-content'>
        <LeftTree
          clusterGroup={{
            isShow: true,
            onChange: clusterChange,
          }}
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
                <Input onPressEnter={onSearchQuery} className={'searchInput'} prefix={<SearchOutlined />} placeholder={t('搜索标签、屏蔽原因')} />
              </div>
              <div className='header-right'>
                <Button
                  type='primary'
                  className='add'
                  onClick={() => {
                    history.push('/alert-mutes/add');
                  }}
                >
                  {t('新增屏蔽规则')}
                </Button>
              </div>
            </div>
            <Table
              rowKey='id'
              // sticky
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
          <BlankBusinessPlaceholder text='屏蔽规则' />
        )}
      </div>
    </PageLayout>
  );
};

export default Shield;
