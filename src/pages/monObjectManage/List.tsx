import React, { useState, useRef } from 'react';
import { Table, Tag, Tooltip, Space, Input, Dropdown, Menu, Button, Modal, message } from 'antd';
import { SearchOutlined, DownOutlined, ReloadOutlined, CopyOutlined } from '@ant-design/icons';
import { useAntdTable } from 'ahooks';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { BusiGroupItem } from '@/store/commonInterface';
import ColumnSelect from '@/components/ColumnSelect';
import { getMonObjectList } from '@/services/monObjectManage';
import { pageSizeOptions } from '@/components/Dantd/components/data-table/config';
import clipboard from './clipboard';

enum OperateType {
  BindTag = 'bindTag',
  UnbindTag = 'unbindTag',
  UpdateBusi = 'updateBusi',
  RemoveBusi = 'removeBusi',
  UpdateNote = 'updateNote',
  Delete = 'delete',
  None = 'none',
}

interface ITargetProps {
  id: number;
  cluster: string;
  group_id: number;
  group_obj: object | null;
  ident: string;
  note: string;
  tags: string[];
  update_at: number;
}

interface IProps {
  curBusiId: number;
  selectedIdents: string[];
  setSelectedIdents: (selectedIdents: string[]) => void;
  selectedRowKeys: any[];
  setSelectedRowKeys: (selectedRowKeys: any[]) => void;
  refreshFlag: string;
  setRefreshFlag: (refreshFlag: string) => void;
  setOperateType: (operateType: OperateType) => void;
}

export default function List(props: IProps) {
  const { t, i18n } = useTranslation();
  const { curBusiId, setSelectedIdents, selectedRowKeys, setSelectedRowKeys, refreshFlag, setRefreshFlag, setOperateType } = props;
  const isAddTagToQueryInput = useRef(false);
  const tableRef = useRef({
    handleReload() {},
  });
  const [tableQueryContent, setTableQueryContent] = useState<string>('');
  const [curClusters, setCurClusters] = useState<string[]>([]);
  const columns = [
    {
      title: '集群',
      dataIndex: 'cluster',
      width: 100,
      fixed: 'left' as const,
    },
    {
      title: (
        <span>
          标识{' '}
          <CopyOutlined
            style={{
              cursor: 'pointer',
            }}
            onClick={() => {
              const tobeCopy = _.map(tableProps.dataSource, (item) => item.ident);
              const tobeCopyStr = _.join(tobeCopy, '\n');
              const copySucceeded = clipboard(tobeCopyStr);

              if (copySucceeded) {
                if (i18n.language === 'zh') {
                  message.success(`复制成功${tobeCopy.length}条记录`);
                } else if (i18n.language === 'en') {
                  message.success(`Successful copy ${tobeCopy.length} items`);
                }
              } else {
                Modal.warning({
                  title: t('host.copy.error'),
                  content: <Input.TextArea defaultValue={tobeCopyStr} />,
                });
              }
            }}
          />
        </span>
      ),
      dataIndex: 'ident',
    },
    {
      title: '标签',
      dataIndex: 'tags',
      ellipsis: {
        showTitle: false,
      },
      render(tagArr) {
        const content =
          tagArr &&
          tagArr.map((item) => (
            <Tag
              color='purple'
              key={item}
              onClick={(e) => {
                if (!tableQueryContent.includes(item)) {
                  isAddTagToQueryInput.current = true;
                  setTableQueryContent(tableQueryContent ? `${tableQueryContent.trim()} ${item}` : item);
                }
              }}
            >
              {item}
            </Tag>
          ));
        return (
          tagArr && (
            <Tooltip title={content} placement='topLeft' getPopupContainer={() => document.body} overlayClassName='mon-manage-table-tooltip'>
              {content}
            </Tooltip>
          )
        );
      },
    },
    {
      title: '业务组',
      dataIndex: 'group_obj',
      render(groupObj: BusiGroupItem | null) {
        return groupObj ? groupObj.name : '未归组';
      },
    },
    {
      title: '备注',
      dataIndex: 'note',
      ellipsis: {
        showTitle: false,
      },
      render(note) {
        return (
          <Tooltip title={note} placement='topLeft' getPopupContainer={() => document.body}>
            {note}
          </Tooltip>
        );
      },
    },
  ];
  const featchData = ({ current, pageSize }): Promise<any> => {
    const query = {
      query: tableQueryContent,
      bgid: curBusiId,
      clusters: _.join(curClusters, ','),
      limit: pageSize,
      p: current,
    };
    return getMonObjectList(query).then((res) => {
      return {
        total: res.dat.total,
        list: res.dat.list,
      };
    });
  };
  const showTotal = (total: number) => {
    return `共 ${total} 条`;
  };
  const { tableProps } = useAntdTable(featchData, {
    refreshDeps: [JSON.stringify(curClusters), tableQueryContent, curBusiId, refreshFlag],
    defaultPageSize: 30,
  });

  return (
    <div>
      <div className='table-operate-box'>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setRefreshFlag(_.uniqueId('refreshFlag_'));
            }}
          />
          <ColumnSelect noLeftPadding onClusterChange={(e) => setCurClusters(e)} />
          <Input
            className='search-input'
            prefix={<SearchOutlined />}
            placeholder='模糊搜索表格内容(多个关键词请用空格分隔)'
            value={tableQueryContent}
            onChange={(e) => setTableQueryContent(e.target.value)}
            onPressEnter={(e) => tableRef.current.handleReload()}
          />
        </Space>
        <Dropdown
          trigger={['click']}
          overlay={
            <Menu
              onClick={({ key }) => {
                setOperateType(key as OperateType);
              }}
            >
              <Menu.Item key={OperateType.BindTag}>绑定标签</Menu.Item>
              <Menu.Item key={OperateType.UnbindTag}>解绑标签</Menu.Item>
              <Menu.Item key={OperateType.UpdateBusi}>修改业务组</Menu.Item>
              <Menu.Item key={OperateType.RemoveBusi}>移出业务组</Menu.Item>
              <Menu.Item key={OperateType.UpdateNote}>修改备注</Menu.Item>
              <Menu.Item key={OperateType.Delete}>批量删除</Menu.Item>
            </Menu>
          }
        >
          <Button>
            批量操作 <DownOutlined />
          </Button>
        </Dropdown>
      </div>
      <Table
        rowKey='id'
        columns={columns}
        {...tableProps}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: selectedRowKeys,
          onChange(selectedRowKeys, selectedRows: ITargetProps[]) {
            setSelectedRowKeys(selectedRowKeys);
            setSelectedIdents(selectedRows ? selectedRows.map(({ ident }) => ident) : []);
          },
        }}
        pagination={{
          ...tableProps.pagination,
          showTotal: showTotal,
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: pageSizeOptions,
        }}
      />
    </div>
  );
}
