import React, { useState, useEffect, useRef } from 'react';
import { useHistory, Link } from 'react-router-dom';
import PageLayout from '@/components/pageLayout';
import BaseTable, { IBaseTableProps } from '@/components/BaseTable';
import { ColumnsType } from 'antd/lib/table';
import {
  getDashboard,
  createDashboard,
  cloneDashboard,
  removeDashboard,
  exportDashboard,
  importDashboard,
  updateSingleDashboard,
} from '@/services/dashboard';
import {
  SearchOutlined,
  DownOutlined,
  FundOutlined,
  FundViewOutlined,
  DownloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  Button,
  Modal,
  Form,
  Input,
  Tag,
  message,
  Dropdown,
  notification,
  Select,
} from 'antd';
import dayjs from 'dayjs';
import { Dashboard as DashboardType } from '@/store/dashboardInterface';
import ImportAndDownloadModal, {
  ModalStatus,
} from '@/components/ImportAndDownloadModal';
import LeftTree from '@/components/LeftTree';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';
import './index.less';
import { useTranslation } from 'react-i18next';
const { confirm } = Modal;
const type = 'dashboard';
export default function Dashboard() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const ref = useRef(null);
  const history = useHistory();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalStatus>(ModalStatus.None);
  const [selectRowKeys, setSelectRowKeys] = useState<number[]>([]);
  const [exportData, setExportData] = useState<string>('');
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState<string>('');
  const [searchVal, setsearchVal] = useState<string>('');

  const [busiId, setBusiId] = useState<number>();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    await form.validateFields();

    if (editing) {
      await edit();
      message.success(t('编辑大盘成功'));
    } else {
      await create();
      message.success(t('新建大盘成功'));
    }

    (ref?.current as any)?.refreshList();
    setIsModalVisible(false);
    setEditing(false);
  };

  useEffect(() => {
    (ref?.current as any)?.refreshList();
  }, [busiId]);

  const create = async () => {
    let { name, tags } = form.getFieldsValue();
    return (
      busiId &&
      createDashboard(busiId, {
        name,
        tags,
      })
    );
  };

  const edit = async () => {
    let { name, tags, id } = form.getFieldsValue();
    console.log(name, tags, id);
    return (
      busiId &&
      updateSingleDashboard(busiId, id, {
        name,
        tags,
        pure: true,
      })
    );
  };

  const handleEdit = (record: DashboardType) => {
    const { id, name, tags } = record;
    form.setFieldsValue({
      name,
      tags,
      id,
    });
    setIsModalVisible(true);
    setEditing(true);
  };

  const handleTagClick = (tag) => {
    const queryItem = query.length > 0 ? query.split(' ') : [];
    if (queryItem.includes(tag)) return;
    setQuery((query) => query + ' ' + tag);
    setsearchVal((searchVal) => searchVal + ' ' + tag);
  };

  const layout = {
    labelCol: {
      span: 4,
    },
    wrapperCol: {
      span: 16,
    },
  };
  const dashboardColumn: ColumnsType = [
    {
      title: t('大盘名称'),
      dataIndex: 'name',
      render: (text: string, record: DashboardType) => {
        const { t } = useTranslation();
        return (
          <div
            className='table-active-text'
            onClick={() => history.push('/dashboard/' + record.id)}
          >
            {text}
          </div>
        );
      },
    },
    {
      title: t('分类标签'),
      dataIndex: 'tags',
      render: (text: string[]) => (
        <>
          {text.map((tag, index) => {
            return tag ? (
              <Tag
                color='blue'
                key={index}
                style={{
                  cursor: 'pointer',
                }}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </Tag>
            ) : null;
          })}
        </>
      ),
    },
    {
      title: t('更新时间'),
      dataIndex: 'update_at',
      render: (text: number) =>
        dayjs(text * 1000).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: t('发布人'),
      dataIndex: 'create_by',
    },
    {
      title: t('操作'),
      width: '240px',
      render: (text: string, record: DashboardType) => (
        <div className='table-operator-area'>
          <div
            className='table-operator-area-normal'
            onClick={() => handleEdit(record)}
          >
            {t('编辑')}
          </div>
          <div
            className='table-operator-area-normal'
            onClick={async () => {
              confirm({
                title: `${t('是否克隆大盘')}${record.name}?`,
                onOk: async () => {
                  await cloneDashboard(busiId as number, record.id);
                  message.success(t('克隆大盘成功'));
                  (ref?.current as any)?.refreshList();
                },

                onCancel() {},
              });
            }}
          >
            {t('克隆')}
          </div>
          <div
            className='table-operator-area-warning'
            onClick={async () => {
              confirm({
                title: `${t('是否删除大盘')}${record.name}?`,
                onOk: async () => {
                  await removeDashboard(busiId as number, record.id);
                  message.success(t('删除大盘成功'));
                  (ref?.current as any)?.refreshList();
                },

                onCancel() {},
              });
            }}
          >
            {t('删除')}
          </div>
        </div>
      ),
    },
  ];

  const onSearchQuery = (e) => {
    let val = e.target.value;
    setsearchVal(val);
  };

  const handleImportDashboard = (data) => {
    try {
      let importData = JSON.parse(data);
      return importDashboard(busiId as number, importData).then(() =>
        (ref?.current as any)?.refreshList(),
      );
    } catch (err: any) {
      notification.error({
        message: err?.message,
      });
      return Promise.reject(err);
    }
  };

  return (
    <PageLayout title={t('监控大盘')} icon={<FundViewOutlined />}>
      <div style={{ display: 'flex' }}>
        <LeftTree busiGroup={{ onChange: (id) => setBusiId(id) }}></LeftTree>
        <div className='dashboard' style={{ flex: 1 }}>
          <div className='table-handle'>
            <div className='table-handle-search'>
              <Input
                onPressEnter={onSearchQuery}
                className={'searchInput'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                prefix={<SearchOutlined />}
                placeholder={t('大盘名称')}
              />
            </div>
            <div className='table-handle-buttons'>
              <Button type='primary' onClick={showModal}>
                {t('新建大盘')}
              </Button>
              <div className={'table-more-options'}>
                <Button.Group>
                  <Button
                    size='middle'
                    type='default'
                    icon={<DownloadOutlined />}
                    onClick={() => setModalType(ModalStatus.Import)}
                  >
                    {t('导入')}
                  </Button>
                  <Button
                    size='middle'
                    type='default'
                    icon={<UploadOutlined />}
                    onClick={async () => {
                      if (selectRowKeys.length) {
                        let exportData = await exportDashboard(
                          busiId as number,
                          selectRowKeys,
                        );
                        setExportData(JSON.stringify(exportData.dat, null, 2));
                        setModalType(ModalStatus.Export);
                      } else {
                        message.warning(t('未选择任何大盘'));
                      }
                    }}
                  >
                    {t('导出')}
                  </Button>
                </Button.Group>
              </div>
            </div>
          </div>

          {busiId ? (
            <BaseTable
              ref={ref}
              fetchHandle={() => getDashboard(busiId)}
              fetchParams={{
                query: searchVal,
              }}
              className='dashboard-table'
              columns={dashboardColumn}
              rowKey='id'
              rowSelection={{
                selectedRowKeys: selectRowKeys,
                onChange: (selectedRowKeys: number[]) => {
                  setSelectRowKeys(selectedRowKeys);
                },
              }}
            ></BaseTable>
          ) : (
            <BlankBusinessPlaceholder text='监控大盘' />
          )}
        </div>
      </div>
      <Modal
        title={editing ? t('编辑监控大盘') : t('创建新监控大盘')}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => {
          setIsModalVisible(false);
        }}
      >
        <Form {...layout} form={form}>
          <Form.Item
            label={t('大盘名称')}
            name='name'
            wrapperCol={{
              span: 24,
            }}
            rules={[
              {
                required: true,
                message: t('请输入大盘名称'),
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            wrapperCol={{
              span: 24,
            }}
            label={t('分类标签')}
            name='tags'
          >
            <Select
              mode='tags'
              dropdownStyle={{
                display: 'none',
              }}
              placeholder={t('请输入分类标签(请用回车分割)')}
            ></Select>
          </Form.Item>
          <Form.Item name='id' hidden>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <ImportAndDownloadModal
        status={modalType}
        onClose={() => setModalType(ModalStatus.None)}
        onSubmit={handleImportDashboard}
        title={t('大盘')}
        exportData={exportData}
      />
    </PageLayout>
  );
}
