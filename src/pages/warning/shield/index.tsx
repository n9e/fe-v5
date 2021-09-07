import React, { useRef, useState } from 'react';
import PageLayout from '@/components/pageLayout';
import { Button, Input, Popconfirm, Tooltip, Tag, message, Modal } from 'antd';
import BaseTable from '@/components/BaseTable';
import { getShieldList } from '@/services/shield';
import { ColumnsType } from 'antd/lib/table';
import dayjs from 'dayjs';
import {
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { deleteShields } from '@/services/shield';
import { shieldItem } from '@/store/warningInterface';
import ColorTag from '@/components/ColorTag';
import './index.less';
import { useTranslation } from 'react-i18next';
const { confirm } = Modal;

const Shield: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const tableRef = useRef(null as any);
  const [query, setQuery] = useState<string>('');

  const dismiss = (id: number) => {
    deleteShields(id).then((res) => {
      tableRef.current.refreshList();
      message.success(t('解除成功'));
    });
  };

  const column: ColumnsType = [
    {
      title: t('指标名称'),
      width: '15%',
      dataIndex: 'metric',
      render: (text: string) => {
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
          </>
        );
      },
    },
    {
      title: t('资源分组前缀'),
      width: '15%',
      dataIndex: 'classpath_prefix',
      render: (text: string) => {
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
          </>
        );
      },
    },
    {
      title: t('资源标识'),
      width: '20%',
      dataIndex: 'res_filters',
      render: (text: string) => {
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
          </>
        );
      },
    },
    {
      title: t('标签'),
      width: '15%',
      dataIndex: 'tags_filters',
      render: (text: string) => {
        return (
          <>
            {text
              ? text.split(' ').map((tag, index) => {
                  return tag ? (
                    <ColorTag text={tag} key={index}>
                      {tag}
                    </ColorTag>
                  ) : null;
                })
              : ''}
          </>
        );
      },
    },
    {
      title: t('屏蔽原因'),
      width: '15%',
      dataIndex: 'cause',
      render: (text: string) => {
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
          </>
        );
      },
    },
    {
      title: t('屏蔽时间'),
      width: '20%',
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
    {
      title: t('创建人'),
      width: '7%',
      ellipsis: true,
      dataIndex: 'create_by',
    },
    {
      title: t('操作'),
      width: '8%',
      dataIndex: 'operation',
      render: (text: undefined, record: shieldItem) => {
        return (
          <>
            {/*<a onClick={() => history.push(`/shield/detail/${record.id}`)}>*/}
            {/*详情*/}
            {/*</a>*/}
            {/* <Popconfirm
           className='dismiss-confirm'
           title='确定解除该告警屏蔽?'
           onConfirm={() => dismiss(record.id)}
           okText='确定'
           cancelText='取消'
          >
           <a className='dismiss' style={{ color: '#f53146' }}>
             解除
           </a>
          </Popconfirm> */}
            <div
              className='table-operator-area-warning'
              style={{
                cursor: 'pointer',
              }}
              onClick={() => {
                confirm({
                  title: t('确定解除该告警屏蔽?'),
                  icon: <ExclamationCircleOutlined />,
                  onOk: () => {
                    dismiss(record.id);
                  },

                  onCancel() {},
                });
              }}
            >
              {t('解除')}
            </div>
          </>
        );
      },
    },
  ];

  const onSearchQuery = (e) => {
    let val = e.target.value;
    setQuery(val);
  };

  return (
    <PageLayout title={t('告警屏蔽')} icon={<CloseCircleOutlined />}>
      <div className='shield-index'>
        <div className='header'>
          <div className='header-left'>
            <Input
              onPressEnter={onSearchQuery}
              className={'searchInput'}
              prefix={<SearchOutlined />}
              placeholder={t('指标名称、资源标识、标签、屏蔽原因')}
            />
          </div>
          <div className='header-right'>
            <Button
              type='primary'
              className='add'
              onClick={() => {
                history.push('/shield/add');
              }}
            >
              {t('新建告警屏蔽')}
            </Button>
          </div>
        </div>
        <BaseTable
          ref={tableRef}
          fetchParams={{
            query,
          }}
          fetchHandle={getShieldList}
          rowKey='id'
          columns={column}
        />
      </div>
    </PageLayout>
  );
};

export default Shield;
