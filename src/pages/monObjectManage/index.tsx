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
import React, { useEffect, useRef, useState, useCallback } from 'react';
import PageLayout from '@/components/pageLayout';
import LeftTree from '@/components/LeftTree';
import { DatabaseOutlined, DownOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './index.less';
import { bindTags, unbindTags, moveTargetBusi, updateTargetNote, deleteTargets, getTargetTags } from '@/services/monObjectManage';
import { RootState } from '@/store/common';
import DataTable from '@/components/Dantd/components/data-table';
import { Button, Dropdown, Menu, Modal, Tag, Form, Input, Alert, Select, Tooltip, message, Space } from 'antd';
import { BusiGroupItem, CommonStoreState } from '@/store/commonInterface';
import { useSelector } from 'react-redux';
import { getBusiGroups } from '@/services/common';
import { debounce } from 'lodash';
import ColumnSelect from '@/components/ColumnSelect';

enum OperateType {
  BindTag = 'bindTag',
  UnbindTag = 'unbindTag',
  UpdateBusi = 'updateBusi',
  RemoveBusi = 'removeBusi',
  UpdateNote = 'updateNote',
  Delete = 'delete',
  None = 'none',
}

interface targetProps {
  id: number;
  cluster: string;
  group_id: number;
  group_obj: object | null;
  ident: string;
  note: string;
  tags: string[];
  update_at: number;
}

interface OperateionModalProps {
  operateType: OperateType;
  setOperateType: any;
  idents: string[];
  reloadList: () => void;
}

const { TextArea } = Input;

// ????????????????????????
const bindTagDetail = () => {
  // ????????????????????????????????????
  function isTagValid(tag) {
    const contentRegExp = /^[a-zA-Z_][\w]*={1}[^=]+$/;
    return {
      isCorrectFormat: contentRegExp.test(tag.toString()),
      isLengthAllowed: tag.toString().length <= 64,
    };
  }

  // ????????????
  function tagRender(content) {
    const { isCorrectFormat, isLengthAllowed } = isTagValid(content.value);
    return isCorrectFormat && isLengthAllowed ? (
      <Tag
        closable={content.closable}
        onClose={content.onClose}
        // style={{ marginTop: '2px' }}
      >
        {content.value}
      </Tag>
    ) : (
      <Tooltip title={isCorrectFormat ? '??????????????????????????? 64 ???' : '?????????????????? key=value?????? key ?????????????????????????????????????????????????????????????????????'}>
        <Tag color='error' closable={content.closable} onClose={content.onClose} style={{ marginTop: '2px' }}>
          {content.value}
        </Tag>
      </Tooltip>
    );
  }

  // ????????????????????????
  function isValidFormat() {
    return {
      validator(_, value) {
        const isInvalid = value.some((tag) => {
          const { isCorrectFormat, isLengthAllowed } = isTagValid(tag);
          if (!isCorrectFormat || !isLengthAllowed) {
            return true;
          }
        });
        return isInvalid ? Promise.reject(new Error('????????????????????????????????????')) : Promise.resolve();
      },
    };
  }

  return {
    operateTitle: '????????????',
    requestFunc: bindTags,
    isFormItem: true,
    render() {
      return (
        <Form.Item label='??????' name='tags' rules={[{ required: true, message: '??????????????????????????????' }, isValidFormat]}>
          <Select mode='tags' tokenSeparators={[' ']} open={false} placeholder={'??????????????? key=value ??????????????????????????????'} tagRender={tagRender} />
        </Form.Item>
      );
    },
  };
};

// ????????????????????????
const unbindTagDetail = (tagsList) => {
  return {
    operateTitle: '????????????',
    requestFunc: unbindTags,
    isFormItem: true,
    render() {
      return (
        <Form.Item label='??????' name='tags' rules={[{ required: true, message: '??????????????????????????????' }]}>
          <Select mode='multiple' showArrow={true} placeholder='???????????????????????????' options={tagsList.map((tag) => ({ label: tag, value: tag }))} />
        </Form.Item>
      );
    },
  };
};

// ???????????????????????????
const removeBusiDetail = () => {
  return {
    operateTitle: '???????????????',
    requestFunc: moveTargetBusi,
    isFormItem: false,
    render() {
      return <Alert message='???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????' type='error' />;
    },
  };
};

// ????????????????????????
const updateNoteDetail = () => {
  return {
    operateTitle: '????????????',
    requestFunc: updateTargetNote,
    isFormItem: true,
    render() {
      return (
        <Form.Item label='????????????' name='note'>
          <Input maxLength={64} placeholder='?????????????????????????????????????????????' />
        </Form.Item>
      );
    },
  };
};

// ????????????????????????
const deleteDetail = () => {
  return {
    operateTitle: '????????????',
    requestFunc: deleteTargets,
    isFormItem: false,
    render() {
      return <Alert message='??????????????????????????????????????????????????????????????????????????????????????????????????????' type='error' />;
    },
  };
};

const OperationModal: React.FC<OperateionModalProps> = ({ operateType, setOperateType, idents, reloadList }) => {
  const { busiGroups } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [identList, setIdentList] = useState<string[]>(idents);
  const [tagsList, setTagsList] = useState<string[]>([]);
  const detailProp = operateType === OperateType.UnbindTag ? tagsList : busiGroups;

  // ???????????????????????????
  const updateBusiDetail = (busiGroups) => {
    return {
      operateTitle: '???????????????',
      requestFunc: moveTargetBusi,
      isFormItem: true,
      render() {
        return (
          <Form.Item label='???????????????' name='bgid' rules={[{ required: true, message: '???????????????????????????' }]}>
            <Select
              showSearch
              style={{ width: '100%' }}
              placeholder='????????????????????????'
              options={filteredBusiGroups.map(({ id, name }) => ({
                label: name,
                value: id,
              }))}
              optionFilterProp='label'
              filterOption={false}
              onSearch={handleSearch}
              onFocus={() => {
                getBusiGroups('').then((res) => {
                  setFilteredBusiGroups(res.dat || []);
                });
              }}
              onClear={() => {
                getBusiGroups('').then((res) => {
                  setFilteredBusiGroups(res.dat || []);
                });
              }}
            />
          </Form.Item>
        );
      },
    };
  };

  const operateDetail = {
    bindTagDetail,
    unbindTagDetail,
    updateBusiDetail,
    removeBusiDetail,
    updateNoteDetail,
    deleteDetail,
    noneDetail: () => ({
      operateTitle: '',
      requestFunc() {
        return Promise.resolve();
      },
      isFormItem: false,
      render() {},
    }),
  };
  const { operateTitle, requestFunc, isFormItem, render } = operateDetail[`${operateType}Detail`](detailProp);
  const [filteredBusiGroups, setFilteredBusiGroups] = useState(busiGroups);
  function formatValue() {
    const inputValue = form.getFieldValue('idents');
    const formattedIdents = inputValue.split(/[ ,\n]+/).filter((value) => value);
    const formattedValue = formattedIdents.join('\n');
    // ???????????????????????????
    if (inputValue !== formattedValue) {
      form.setFieldsValue({
        idents: formattedValue,
      });
    }
    // ?????????????????????????????????????????????
    if (identList.sort().join('\n') !== formattedIdents.sort().join('\n')) {
      setIdentList(formattedIdents);
    }
  }

  // ????????????
  function submitForm() {
    form.validateFields().then((data) => {
      setConfirmLoading(true);
      data.idents = data.idents.split('\n');
      requestFunc(data)
        .then(() => {
          message.success(`${operateTitle}?????????`);
          setOperateType(OperateType.None);
          reloadList();
          form.resetFields();
          setConfirmLoading(false);
        })
        .catch(() => setConfirmLoading(false));
    });
  }

  // ??????????????????????????????
  useEffect(() => {
    if (!filteredBusiGroups.length) {
      setFilteredBusiGroups(busiGroups);
    }
  }, [busiGroups]);

  const fetchBusiGroup = (e) => {
    getBusiGroups(e).then((res) => {
      setFilteredBusiGroups(res.dat || []);
    });
  };
  const handleSearch = useCallback(debounce(fetchBusiGroup, 800), []);

  // ?????????????????????????????????????????????????????????
  useEffect(() => {
    if (operateType !== OperateType.None) {
      setIdentList(idents);
      form.setFieldsValue({
        idents: idents.join('\n'),
      });
    }
  }, [operateType, idents]);

  // ?????????????????????????????????????????????????????????????????????
  useEffect(() => {
    if (operateType === OperateType.UnbindTag && identList.length) {
      getTargetTags({ idents: identList.join(',') }).then(({ dat }) => {
        // ???????????????????????????
        const curSelectedTags = form.getFieldValue('tags') || [];
        form.setFieldsValue({
          tags: curSelectedTags.filter((tag) => dat.includes(tag)),
        });

        setTagsList(dat);
      });
    }
  }, [operateType, identList]);

  return (
    <Modal
      visible={operateType !== 'none'}
      title={operateTitle}
      confirmLoading={confirmLoading}
      okButtonProps={{
        danger: operateType === OperateType.RemoveBusi || operateType === OperateType.Delete,
      }}
      okText={operateType === OperateType.RemoveBusi ? '??????' : operateType === OperateType.Delete ? '??????' : '??????'}
      onOk={submitForm}
      onCancel={() => {
        setOperateType(OperateType.None);
        form.resetFields();
      }}
    >
      {/* ????????????????????? */}
      <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
        <Form.Item label='????????????' name='idents' rules={[{ required: true, message: '???????????????????????????' }]}>
          <TextArea autoSize={{ minRows: 3, maxRows: 10 }} placeholder='?????????????????????????????????????????????' onBlur={formatValue} />
        </Form.Item>
        {isFormItem && render()}
      </Form>
      {!isFormItem && render()}
    </Modal>
  );
};

const MonObjectManage: React.FC = () => {
  const { t } = useTranslation();
  const tableRef = useRef({
    handleReload() {},
  });
  const isAddTagToQueryInput = useRef(false);
  const [tableQueryContent, setTableQueryContent] = useState<string>('');
  const [operateType, setOperateType] = useState<OperateType>(OperateType.None);
  const [curClusters, setCurClusters] = useState<string[]>([]);
  const [curBusiId, setCurBusiId] = useState<number>(-2);
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);
  const [selectedIdents, setSelectedIdents] = useState<string[]>([]);

  const columns = [
    {
      title: '??????',
      dataIndex: 'cluster',
      width: 100,
      fixed: 'left' as const,
    },
    {
      title: '??????',
      dataIndex: 'ident',
      width: 140,
    },
    {
      title: '??????',
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
      title: '?????????',
      dataIndex: 'group_obj',
      render(groupObj: BusiGroupItem | null) {
        return groupObj ? groupObj.name : '?????????';
      },
    },
    {
      title: '??????',
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

  function renderLeftHeader() {
    return (
      <div className='table-operate-box'>
        <Space>
          <ColumnSelect noLeftPadding onClusterChange={(e) => setCurClusters(e)} />
          <Input
            className='search-input'
            prefix={<SearchOutlined />}
            placeholder='????????????????????????(?????????????????????????????????)'
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
                showOperationModal(key as OperateType);
              }}
            >
              <Menu.Item key={OperateType.BindTag}>????????????</Menu.Item>
              <Menu.Item key={OperateType.UnbindTag}>????????????</Menu.Item>
              <Menu.Item key={OperateType.UpdateBusi}>???????????????</Menu.Item>
              <Menu.Item key={OperateType.RemoveBusi}>???????????????</Menu.Item>
              <Menu.Item key={OperateType.UpdateNote}>????????????</Menu.Item>
              <Menu.Item key={OperateType.Delete}>????????????</Menu.Item>
            </Menu>
          }
        >
          <Button>
            ???????????? <DownOutlined />
          </Button>
        </Dropdown>
      </div>
    );
  }

  function showOperationModal(curOperateType: OperateType) {
    setOperateType(curOperateType);
  }

  useEffect(() => {
    tableRef.current.handleReload();
  }, [curBusiId, curClusters]);

  useEffect(() => {
    if (isAddTagToQueryInput.current) {
      tableRef.current.handleReload();
      isAddTagToQueryInput.current = false;
    }
  }, [tableQueryContent]);

  return (
    <PageLayout icon={<DatabaseOutlined />} title={t('????????????')} hideCluster>
      <div className='object-manage-page-content'>
        <LeftTree
          busiGroup={{
            showNotGroupItem: true,
            onChange(value) {
              setCurBusiId(typeof value === 'number' ? value : -1);
              setSelectedRowKeys([]);
              setSelectedIdents([]);
            },
          }}
        />
        <div className='table-area'>
          {curBusiId !== -2 && (
            <DataTable
              ref={tableRef}
              antProps={{
                rowKey: 'id',
                rowSelection: {
                  selectedRowKeys: selectedRowKeys,
                  onChange(selectedRowKeys, selectedRows: targetProps[]) {
                    setSelectedRowKeys(selectedRowKeys);
                    setSelectedIdents(selectedRows ? selectedRows.map(({ ident }) => ident) : []);
                  },
                },
                // scroll: { x: 800, y: 'calc(100vh - 252px)' },
              }}
              url='/api/n9e/targets'
              customQueryCallback={(data) =>
                Object.assign(
                  data,
                  tableQueryContent ? { query: tableQueryContent } : {},
                  curBusiId !== -1 ? { bgid: curBusiId } : {},
                  curClusters.length ? { clusters: curClusters.join(',') } : {},
                )
              }
              pageParams={{
                curPageName: 'p',
                pageSizeName: 'limit',
                pageSize: 30,
                pageSizeOptions: ['30', '100', '200', '500'],
              }}
              apiCallback={({ dat: { list: data, total } }) => ({
                data,
                total,
              })}
              columns={columns}
              reloadBtnType='btn'
              reloadBtnPos='left'
              filterType='flex'
              leftHeader={renderLeftHeader()}
            />
          )}
        </div>
      </div>

      <OperationModal operateType={operateType} setOperateType={setOperateType} idents={selectedIdents} reloadList={tableRef.current.handleReload} />
    </PageLayout>
  );
};

export default MonObjectManage;
