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
import React, { useState, useRef, useLayoutEffect } from 'react';
import { Button, Input, Modal, Popconfirm, Form, message } from 'antd';
import PageLayout from '@/components/pageLayout';
import { MoreOptions, InterfaceItem } from './interface';
import {
  getIndicatorList,
  editIndicator,
  deleteIndicator,
  addIndicator,
} from '@/services/indicator';
import {
  SettingOutlined,
  SearchOutlined,
  UploadOutlined,
  DownloadOutlined,
  BulbOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import BaseTable from '@/components/BaseTable';
const { confirm } = Modal;
const { TextArea } = Input;
import './index.less';
import { download } from '@/utils';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

const Indicator: React.FC = () => {
  const { t } = useTranslation();
  // 数据定义
  const [form] = Form.useForm();
  const tableRef = useRef(null as any);
  const exportTextRef = useRef(null as any);
  const [modal, setModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState('create');
  const [exportList, setExportList] = useState([] as string[]);
  const [editingKey, setEditingKey] = useState<Partial<InterfaceItem>>({});
  const [query, setQuery] = useState<string>('');
  const history = useHistory();
  const moreOperations: MoreOptions = {
    导入指标: 'import',
    导出指标: 'export',
  };
  const optMap = {
    import: t('导入'),
    edit: t('编辑'),
    export: t('导出'),
    create: t('创建'),
  }; // 弹窗操作

  const handleOpen = (type: string = 'create') => {
    setModalType(type);
    setModal(true);
  };

  const handleCancel = () => {
    setModal(false);
  }; // 接口操作

  const handleEdit = (item: InterfaceItem) => {
    setEditingKey(item);
  };

  const handleDelete = (item) => {
    deleteIndicator([item.id]).then(async (res) => {
      await tableRef.current.refreshList();
      message.success(t('删除指标成功'));
    });
  };

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      addIndicator(values.metrics || '').then(async (res) => {
        if (res && res.success) {
          await tableRef.current.refreshList();
          setModal(false);
          message.success(t('创建指标成功'));
        }
      });
    } catch (e) {}
  }; // 更多操作

  const [oType, setOType] = useState<string>(t('更多操作'));

  const onSelect = (val: string): void => {
    switch (val) {
      case 'import':
        setModal(true);
        setModalType('import');
        break;

      case 'export':
        if (exportList.length <= 0) {
          message.warning(t('请勾选需要导出的指标'));
        } else {
          setModal(true);
          setModalType('export');
          setTimeout(() => {
            exportTextRef.current && exportTextRef.current.focus();
          });
        }

        break;

      default:
        break;
    }

    setOType(val);
  }; // table

  const handleEditChange = (e, record, index, field) => {
    let targetCol = Object.assign({}, record);
    targetCol[field] = e.target.value;
    setEditingKey(targetCol);
  };

  const renderInput = (text, record, index, field) => {
    if (record.id === editingKey.id) {
      return (
        <Input
          defaultValue={text}
          onPressEnter={() => handleEditOption('save')}
          onChange={(e) => handleEditChange(e, record, index, field)}
        />
      );
    } else {
      return <span>{text}</span>;
    }
  };

  const handleEditOption = async (type = '') => {
    if (type === 'save') {
      let id = editingKey.id || -1;
      await editIndicator(id, {
        description: editingKey.description,
        metric: editingKey.metric,
      });
      message.success(t('编辑成功'));
      tableRef.current.refreshList();
    }

    setEditingKey({} as any);
  };

  const columns = [
    {
      title: t('指标名称'),
      dataIndex: 'metric',
      key: 'metric',
      render: (text: string, record: InterfaceItem) => {
        return (
          <a
            onClick={() => {
              let path = {
                pathname: import.meta.env.VITE_PREFIX + `/metric/explorer`,
                state: { name: text, description: record.description },
              };
              history.push(path);
            }}
          >
            {text}
          </a>
        );
      },
    },
    {
      title: t('释义'),
      dataIndex: 'description',
      width: '40%',
      key: 'description',
      render: (text: string, record: InterfaceItem, index: number) => {
        return renderInput(text, record, index, 'description');
      },
    },
    {
      title: t('操作'),
      dataIndex: '',
      key: 'operations',
      width: '15%',
      render: (_: any, item: any) => {
        return (
          <div className='operations'>
            {item.id !== editingKey.id ? (
              <div>
                <span
                  className='operation-item edit'
                  onClick={() => handleEdit(item)}
                >
                  {t('编辑')}
                </span>
                {/* <Popconfirm
             title='确定删除该指标?'
             onConfirm={() => handleDelete(item)}
             okText='确定'
             cancelText='取消'
            >
             <span className='operation-item delete'>删除</span>
            </Popconfirm> */}
                <div
                  className='table-operator-area-warning'
                  style={{
                    display: 'inline-block',
                    marginLeft: 10,
                  }}
                  onClick={() => {
                    confirm({
                      title: t('确定删除该指标?'),
                      icon: <ExclamationCircleOutlined />,
                      onOk: () => {
                        handleDelete(item);
                      },
                    });
                  }}
                >
                  {t('删除')}
                </div>
              </div>
            ) : (
              <div>
                <span
                  className='operation-item edit-save'
                  onClick={() => handleEditOption('save')}
                >
                  {t('保存')}
                </span>
                <span
                  className='operation-item edit-cancel'
                  onClick={() => handleEditOption('cancel')}
                >
                  {t('取消')}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  const onSearchQuery = (e) => {
    let val = e.target.value;
    setQuery(val);
  };

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      let list: string[] = [];
      selectedRows.map((item) => {
        list.push(`${item.metric}:${item.description}`);
      });
      setExportList(list);
    },
  };

  const handleExportTxt = () => {
    download(exportList);
  };

  return (
    <PageLayout title={t('指标释义')} icon={<BulbOutlined />}>
      <div className='indicator-index'>
        <div className='indicator-operations'>
          <Input
            className={'searchInput'}
            onPressEnter={onSearchQuery}
            prefix={<SearchOutlined />}
            placeholder={t('指标名称或释义')}
          />
          <div className='operations'>
            <Button.Group>
              <Button
                size='middle'
                type='default'
                icon={<DownloadOutlined />}
                onClick={() => onSelect('import')}
              >
                {t('导入')}
              </Button>
              <Button
                size='middle'
                type='default'
                icon={<UploadOutlined />}
                onClick={() => onSelect('export')}
              >
                {t('导出')}
              </Button>
            </Button.Group>
          </div>
        </div>
        <div className='indicator-main'>
          <BaseTable
            fetchHandle={getIndicatorList}
            ref={tableRef}
            fetchParams={{
              query: query,
            }}
            rowSelection={{ ...rowSelection }}
            rowKey={(record: { id: number }) => {
              return record.id;
            }}
            columns={columns}
          />
        </div>
      </div>
      <Modal
        title={optMap[modalType]}
        destroyOnClose={true}
        footer={
          modalType !== 'export' && [
            <Button key='delete' onClick={handleCancel}>
              {t('取消')}
            </Button>,
            <Button key='submit' type='primary' onClick={handleAdd}>
              {t('确定')}
            </Button>,
          ]
        }
        onCancel={handleCancel}
        visible={modal}
      >
        <p
          style={{
            color: '#999',
          }}
        >
          {modalType === 'export' ? (
            <a onClick={handleExportTxt}>Download.txt</a>
          ) : (
            <span>{t('一行一个')}</span>
          )}
        </p>
        {(() => {
          switch (modalType) {
            case 'export':
              return (
                <div
                  contentEditable='true'
                  suppressContentEditableWarning={true}
                  ref={exportTextRef}
                  style={{
                    height: '200px',
                    border: '1px solid #d9d9d9',
                    overflow: 'auto',
                    padding: '10px',
                  }}
                >
                  {exportList.map((item, index) => {
                    return <div key={index}>{item}</div>;
                  })}
                </div>
              );
              break;

            case 'import':
            case 'create':
              return (
                <Form name={modalType + '-dialog'} form={form} preserve={false}>
                  <Form.Item
                    name={'metrics'}
                    key={'metrics'}
                    rules={[
                      {
                        required: true,
                        message: t('不能为空'),
                        validateTrigger: 'trigger',
                      },
                    ]}
                  >
                    <TextArea
                      placeholder={'name:description'}
                      rows={4}
                    ></TextArea>
                  </Form.Item>
                </Form>
              );
              break;
          }
        })()}
      </Modal>
    </PageLayout>
  );
};

export default Indicator;
