import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
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
} from '@/services/dashboard';
import {
  SearchOutlined,
  DownOutlined,
  FundOutlined,
  FundViewOutlined,
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
import {
  getTemplate,
  getTemplateContent,
  getSingleDashboard,
} from '@/services/dashboard';
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
  const [defaultOptions, setDefaultOptions] = useState<string[]>([]);
  const [searchVal, setsearchVal] = useState<string>('');
  const [cloneId, setCloneId] =
    useState<{
      id: number;
    }>();

  const showModal = () => {
    setIsModalVisible(true);
  };

  useEffect(() => {
    getTemplate(type).then((res) => {
      setDefaultOptions(res.dat);
    });
  }, []);

  const handleOk = async () => {
    await form.validateFields();

    if (editing) {
      await clone();
      message.success(t('克隆大盘成功'));
    } else {
      await create();
      message.success(t('新建大盘成功'));
    }

    (ref?.current as any)?.refreshList();
    setIsModalVisible(false);
    setEditing(false);
  };

  const create = async () => {
    let { name, tags } = form.getFieldsValue();
    return createDashboard({
      name,
      tags: tags && tags.length > 0 ? tags.join(' ') : '',
    });
  };

  const clone = async () => {
    if (cloneId?.id) {
      const { dat } = await getSingleDashboard(cloneId?.id);
      let { name, tags } = form.getFieldsValue();
      return cloneDashboard(
        Object.assign(
          cloneId,
          {
            name,
            tags: tags && tags.length > 0 ? tags.join(' ') : '',
          },
          {
            configs: dat.configs,
          },
        ),
      );
    } else {
      throw new Error('没有选择大盘');
    }
  };

  const handleClone = (record: DashboardType) => {
    const { id, name, tags } = record;
    const cloneName = 'Copy of ' + name;
    form.setFieldsValue({
      name: cloneName,
      tags: tags.length > 0 ? tags.split(' ') : [],
    });
    setCloneId({
      id,
    });
    setIsModalVisible(true);
    setEditing(true);
  };

  const handleTagClick = (tag) => {
    const queryItem = query.length > 0 ? query.split(' ') : [];
    if (queryItem.includes(tag)) return;
    setQuery((query) => query + ' ' + tag);
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
      render: (text: string) => (
        <>
          {text.split(' ').map((tag, index) => {
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
            onClick={() => handleClone(record)}
          >
            {t('克隆')}
          </div>
          <div
            className='table-operator-area-warning'
            onClick={async () => {
              confirm({
                title: `${t('是否删除大盘')}?${record.name}`,
                onOk: async () => {
                  await removeDashboard(record.id);
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
    setQuery(val);
  };

  const handleImportDashboard = (data) => {
    try {
      let importData = JSON.parse(data);
      return importDashboard(importData).then(() =>
        (ref?.current as any)?.refreshList(),
      );
    } catch (err) {
      notification.error({
        message: err?.message || t('您的网络发生异常，无法连接服务器'),
      });
      return Promise.reject(err);
    }
  };

  const handleImportDefault = async (name) => {
    let { dat: content } = await getTemplateContent(type, name);
    await importDashboard(content);
    (ref?.current as any)?.refreshList();
  };

  const menu = (
    <ul className='ant-dropdown-menu'>
      <li
        className='ant-dropdown-menu-item'
        onClick={() => setModalType(ModalStatus.Import)}
      >
        <span>{t('导入')}</span>
      </li>
      <li
        className='ant-dropdown-menu-item'
        onClick={async () => {
          if (selectRowKeys.length) {
            let exportData = await exportDashboard(selectRowKeys);
            setExportData(JSON.stringify(exportData.dat, null, 2));
            setModalType(ModalStatus.Export);
          } else {
            message.warning(t('未选择任何大盘'));
          }
        }}
      >
        <span>{t('导出')}</span>
      </li>
    </ul>
  );
  const defaultDashboardMenu = (
    <ul className='ant-dropdown-menu'>
      {defaultOptions.map((item, index) => (
        <li className='ant-dropdown-menu-item' key={index}>
          <span onClick={() => handleImportDefault(item)}>{item}</span>
        </li>
      ))}
    </ul>
  );
  return (
    <PageLayout title={t('监控大盘')} icon={<FundViewOutlined />}>
      <div className='dashboard'>
        <div className='table-handle'>
          <div className='table-handle-search'>
            <Input
              onPressEnter={onSearchQuery}
              className={'searchInput'}
              value={query} // onChange={(e) => setQuery(e.target.value)}
              prefix={<SearchOutlined />}
              placeholder={t('大盘名称')}
            />
          </div>
          <div className='table-handle-buttons'>
            <Button type='primary' onClick={showModal}>
              {t('新建大盘')}
            </Button>
            <div className={'table-more-options'}>
              <Dropdown overlay={defaultDashboardMenu} trigger={['click']}>
                <Button onClick={(e) => e.stopPropagation()}>
                  {t('导入内置大盘')}
                  <DownOutlined
                    style={{
                      marginLeft: 2,
                    }}
                  />
                </Button>
              </Dropdown>
              <Dropdown overlay={menu} trigger={['click']}>
                <Button onClick={(e) => e.stopPropagation()}>
                  {t('更多操作')}
                  <DownOutlined
                    style={{
                      marginLeft: 2,
                    }}
                  />
                </Button>
              </Dropdown>
            </div>
          </div>
        </div>

        <BaseTable
          ref={ref}
          fetchHandle={getDashboard}
          fetchParams={{
            query: query,
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
      </div>
      <Modal
        title={editing ? t('克隆监控大盘') : t('创建新监控大盘')}
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
