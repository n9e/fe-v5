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
import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Tag, Form, Input, Alert, Select, Tooltip, message } from 'antd';
import { DatabaseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _, { debounce } from 'lodash';
import { useSelector } from 'react-redux';
import { bindTags, unbindTags, moveTargetBusi, updateTargetNote, deleteTargets, getTargetTags } from '@/services/monObjectManage';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import PageLayout from '@/components/pageLayout';
import LeftTree from '@/components/LeftTree';
import { getBusiGroups } from '@/services/common';
import List from './List';
import './index.less';

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

// 绑定标签弹窗内容
const bindTagDetail = () => {
  // 校验单个标签格式是否正确
  function isTagValid(tag) {
    const contentRegExp = /^[a-zA-Z_][\w]*={1}[^=]+$/;
    return {
      isCorrectFormat: contentRegExp.test(tag.toString()),
      isLengthAllowed: tag.toString().length <= 64,
    };
  }

  // 渲染标签
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
      <Tooltip title={isCorrectFormat ? '标签长度应小于等于 64 位' : '标签格式应为 key=value。且 key 以字母或下划线开头，由字母、数字和下划线组成。'}>
        <Tag color='error' closable={content.closable} onClose={content.onClose} style={{ marginTop: '2px' }}>
          {content.value}
        </Tag>
      </Tooltip>
    );
  }

  // 校验所有标签格式
  function isValidFormat() {
    return {
      validator(_, value) {
        const isInvalid = value.some((tag) => {
          const { isCorrectFormat, isLengthAllowed } = isTagValid(tag);
          if (!isCorrectFormat || !isLengthAllowed) {
            return true;
          }
        });
        return isInvalid ? Promise.reject(new Error('标签格式不正确，请检查！')) : Promise.resolve();
      },
    };
  }

  return {
    operateTitle: '绑定标签',
    requestFunc: bindTags,
    isFormItem: true,
    render() {
      return (
        <Form.Item label='标签' name='tags' rules={[{ required: true, message: '请填写至少一项标签！' }, isValidFormat]}>
          <Select mode='tags' tokenSeparators={[' ']} open={false} placeholder={'标签格式为 key=value ，使用回车或空格分隔'} tagRender={tagRender} />
        </Form.Item>
      );
    },
  };
};

// 解绑标签弹窗内容
const unbindTagDetail = (tagsList) => {
  return {
    operateTitle: '解绑标签',
    requestFunc: unbindTags,
    isFormItem: true,
    render() {
      return (
        <Form.Item label='标签' name='tags' rules={[{ required: true, message: '请选择至少一项标签！' }]}>
          <Select mode='multiple' showArrow={true} placeholder='请选择要解绑的标签' options={tagsList.map((tag) => ({ label: tag, value: tag }))} />
        </Form.Item>
      );
    },
  };
};

// 移出业务组弹窗内容
const removeBusiDetail = () => {
  return {
    operateTitle: '移出业务组',
    requestFunc: moveTargetBusi,
    isFormItem: false,
    render() {
      return <Alert message='提示信息：移出所属业务组，该业务组的管理人员将不再有权限操作这些监控对象！您可能需要提前清空这批监控对象的标签和备注信息！' type='error' />;
    },
  };
};

// 修改备注弹窗内容
const updateNoteDetail = () => {
  return {
    operateTitle: '修改备注',
    requestFunc: updateTargetNote,
    isFormItem: true,
    render() {
      return (
        <Form.Item label='备注信息' name='note'>
          <Input maxLength={64} placeholder='内容如果为空，表示清空备注信息' />
        </Form.Item>
      );
    },
  };
};

// 批量删除弹窗内容
const deleteDetail = () => {
  return {
    operateTitle: '批量删除',
    requestFunc: deleteTargets,
    isFormItem: false,
    render() {
      return <Alert message='提示信息：该操作会把监控对象从系统内中彻底删除，非常危险，慎重操作！' type='error' />;
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

  // 修改业务组弹窗内容
  const updateBusiDetail = (busiGroups) => {
    return {
      operateTitle: '修改业务组',
      requestFunc: moveTargetBusi,
      isFormItem: true,
      render() {
        return (
          <Form.Item label='归属业务组' name='bgid' rules={[{ required: true, message: '请选择归属业务组！' }]}>
            <Select
              showSearch
              style={{ width: '100%' }}
              placeholder='请选择归属业务组'
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
    // 自动格式化表单内容
    if (inputValue !== formattedValue) {
      form.setFieldsValue({
        idents: formattedValue,
      });
    }
    // 当对象标识变更时，更新标识数组
    if (identList.sort().join('\n') !== formattedIdents.sort().join('\n')) {
      setIdentList(formattedIdents);
    }
  }

  // 提交表单
  function submitForm() {
    form.validateFields().then((data) => {
      setConfirmLoading(true);
      data.idents = data.idents.split('\n');
      requestFunc(data)
        .then(() => {
          message.success(`${operateTitle}成功！`);
          setOperateType(OperateType.None);
          reloadList();
          form.resetFields();
          setConfirmLoading(false);
        })
        .catch(() => setConfirmLoading(false));
    });
  }

  // 初始化展示所有业务组
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

  // 点击批量操作时，初始化默认监控对象列表
  useEffect(() => {
    if (operateType !== OperateType.None) {
      setIdentList(idents);
      form.setFieldsValue({
        idents: idents.join('\n'),
      });
    }
  }, [operateType, idents]);

  // 解绑标签时，根据输入框监控对象动态获取标签列表
  useEffect(() => {
    if (operateType === OperateType.UnbindTag && identList.length) {
      getTargetTags({ idents: identList.join(',') }).then(({ dat }) => {
        // 删除多余的选中标签
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
      okText={operateType === OperateType.RemoveBusi ? '移出' : operateType === OperateType.Delete ? '删除' : '确定'}
      onOk={submitForm}
      onCancel={() => {
        setOperateType(OperateType.None);
        form.resetFields();
      }}
    >
      {/* 基础展示表单项 */}
      <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
        <Form.Item label='监控对象' name='idents' rules={[{ required: true, message: '请填写监控对象指标' }]}>
          <TextArea autoSize={{ minRows: 3, maxRows: 10 }} placeholder='请填写监控对象的指标，一行一个' onBlur={formatValue} />
        </Form.Item>
        {isFormItem && render()}
      </Form>
      {!isFormItem && render()}
    </Modal>
  );
};

const MonObjectManage: React.FC = () => {
  const { t } = useTranslation();
  const [operateType, setOperateType] = useState<OperateType>(OperateType.None);
  const [curBusiId, setCurBusiId] = useState<number>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);
  const [selectedIdents, setSelectedIdents] = useState<string[]>([]);
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('refreshFlag_'));

  return (
    <PageLayout icon={<DatabaseOutlined />} title={t('对象列表')} hideCluster>
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
        <div
          className='table-area'
          style={{
            height: '100%',
            overflowY: 'auto',
          }}
        >
          <List
            curBusiId={curBusiId}
            selectedIdents={selectedIdents}
            setSelectedIdents={setSelectedIdents}
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            refreshFlag={refreshFlag}
            setRefreshFlag={setRefreshFlag}
            setOperateType={setOperateType}
          />
        </div>
      </div>
      <OperationModal
        operateType={operateType}
        setOperateType={setOperateType}
        idents={selectedIdents}
        reloadList={() => {
          setRefreshFlag(_.uniqueId('refreshFlag_'));
        }}
      />
    </PageLayout>
  );
};

export default MonObjectManage;
