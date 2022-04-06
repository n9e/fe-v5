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
import React, { useRef, ReactNode, isValidElement, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import { download, copyToClipBoard } from '@/utils';
import { Button, Modal, Form, Input, message, Table, Select, Divider } from 'antd';

const { Option } = Select;
import './index.less';
import { useTranslation } from 'react-i18next';
import { CopyOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { stringify } from 'querystring';
const { TextArea } = Input;
export const enum ModalStatus {
  Import = 'import',
  Export = 'export',
  BuiltIn = 'builtin',
  None = 'hide',
}
interface Props {
  bgid?: number;
  title: string | ReactNode;
  fetchBuiltinFunc?: Function;
  submitBuiltinFunc?: (name: string, cluster: string, id: number) => Promise<any>;
  label?: string;
  crossCluster?: boolean;
  description?: string;
  status: ModalStatus;
  exportData: string;
  onClose: () => void;
  onSuccess?: () => void;
  onSubmit: Function;
}

const columns = [
  {
    title: '规则',
    dataIndex: 'name',
  },
  {
    title: '导入结果',
    dataIndex: 'isTrue',
    render: (data) => {
      return data ? <CheckCircleOutlined style={{ color: '#389e0d', fontSize: '18px' }} /> : <CloseCircleOutlined style={{ color: '#d4380d', fontSize: '18px' }} />;
    },
  },
  {
    title: '错误消息',
    dataIndex: 'msg',
  },
];

export default function ImportAndDownloadModal(props: Props) {
  const { t } = useTranslation();
  const exportTextRef = useRef(null as any);
  const { status, title, exportData, description, onClose, onSubmit, crossCluster = true, onSuccess, label, fetchBuiltinFunc, submitBuiltinFunc, bgid } = props;
  const [form] = Form.useForm();
  const { clusters: clusterList } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const [buildinList, setBuildinList] = useState<{ name: string }[]>([]);
  const [importResult, setImportResult] = useState<{ name: string; isTrue: boolean; msg: string }[]>();
  const builtinColumn = [
    {
      title: '规则名称',
      dataIndex: 'name',
    },
    {
      title: '操作',
      dataIndex: 'id',
      render(id, record) {
        return (
          <Button
            type='link'
            onClick={() => {
              submitBuiltinFunc &&
                submitBuiltinFunc(record.name, form.getFieldValue('cluster'), bgid!).then(({ dat }) => {
                  setImportResult(
                    Object.keys(dat).map((key) => {
                      return {
                        name: key,
                        key: key,
                        isTrue: !dat[key],
                        msg: dat[key],
                      };
                    }),
                  );
                });
            }}
          >
            导入
          </Button>
        );
      },
    },
  ];
  const handleClose = () => {
    onClose();
    importResult && importResult.some((item) => item.isTrue) && onSuccess && onSuccess();
  };
  useEffect(() => {
    if (status === ModalStatus.BuiltIn || status == ModalStatus.Import) {
      fetchBuiltinFunc &&
        fetchBuiltinFunc().then((res) => {
          setBuildinList(res.dat.map((name) => ({ name })));
        });
    }
    setImportResult(undefined);
  }, [status]);

  const handleExportTxt = () => {
    download([exportData], 'download.json');
  };
  const computeTitle = isValidElement(title) ? title : status === ModalStatus.Export ? t('导出') + title : t('导入') + title;

  return (
    <Modal
      title={computeTitle}
      destroyOnClose={true}
      wrapClassName={isValidElement(title) ? 'import-modal-wrapper' : undefined}
      footer={
        status === ModalStatus.Import && (
          <>
            <Button key='delete' onClick={handleClose}>
              {t('取消')}
            </Button>
            {importResult ? (
              <Button type='primary' onClick={handleClose}>
                {t('关闭')}
              </Button>
            ) : (
              <Button
                key='submit'
                type='primary'
                onClick={async () => {
                  await form.validateFields();
                  const data = form.getFieldsValue();
                  try {
                    const importData = JSON.parse(data.import);
                    if (!Array.isArray(importData)) {
                      message.error(title + 'JSON需要时数组');
                      return;
                    }
                    const requstBody = importData.map((item) => {
                      return {
                        ...item,
                        cluster: crossCluster ? data.cluster : undefined,
                      };
                    });

                    const dat = await onSubmit(requstBody);
                    const dataSource = Object.keys(dat).map((key) => {
                      return {
                        name: key,
                        key: key,
                        isTrue: !dat[key],
                        msg: dat[key],
                      };
                    });
                    setImportResult(dataSource);
                    // 每个业务各自处理onSubmit
                  } catch (error) {
                    message.error(t('数据有误:') + error);
                  }
                }}
              >
                {t('确定')}
              </Button>
            )}
          </>
        )
      }
      onCancel={handleClose}
      afterClose={() => setImportResult(undefined)}
      visible={status !== 'hide'}
      width={600}
    >
      <div
        style={{
          color: '#999',
        }}
      >
        {description && <p>{description}</p>}
        {status === ModalStatus.Export && (
          <p>
            <a onClick={handleExportTxt}>Download.json</a>
            <a style={{ float: 'right' }} onClick={() => copyToClipBoard(exportData, t)}>
              <CopyOutlined />
              复制JSON内容到剪贴板
            </a>
          </p>
        )}
      </div>
      {(() => {
        switch (status) {
          case ModalStatus.Export:
            return (
              <div contentEditable='true' suppressContentEditableWarning={true} ref={exportTextRef} className='export-dialog code-area'>
                <pre>{exportData}</pre>
              </div>
            );
            break;

          case ModalStatus.BuiltIn:
            return (
              <>
                <Form form={form} preserve={false} layout='vertical'>
                  <Form.Item
                    label={t('生效集群：')}
                    name='cluster'
                    initialValue={clusterList[0] || 'Default'}
                    rules={[
                      {
                        required: true,
                        message: t('生效集群不能为空'),
                      },
                    ]}
                  >
                    <Select>
                      {clusterList?.map((item) => (
                        <Option value={item} key={item}>
                          {item}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Form>
                <Table className='samll_table' dataSource={buildinList} columns={builtinColumn} pagination={false} size='small' />
                {importResult && (
                  <>
                    <Divider />
                    <Table className='samll_table' dataSource={importResult} columns={columns} pagination={false} size='small' />
                  </>
                )}
              </>
            );
            break;

          case ModalStatus.Import:
            return (
              <>
                <Form form={form} preserve={false} layout='vertical'>
                  {crossCluster ? (
                    <Form.Item
                      label={t('生效集群：')}
                      name='cluster'
                      initialValue={clusterList[0] || 'Default'}
                      rules={[
                        {
                          required: true,
                          message: t('生效集群不能为空'),
                        },
                      ]}
                    >
                      <Select>
                        {clusterList?.map((item) => (
                          <Option value={item} key={item}>
                            {item}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  ) : null}
                  <Form.Item
                    label={(!isValidElement(title) ? title : label) + t('JSON：')}
                    name='import'
                    rules={[
                      {
                        required: true,
                        message: t('请输入') + title,
                        validateTrigger: 'trigger',
                      },
                    ]}
                  >
                    <TextArea className='code-area' placeholder={t('请输入') + (!isValidElement(title) ? title : label)} rows={4}></TextArea>
                  </Form.Item>
                </Form>
                {importResult && (
                  <>
                    <Divider />
                    <Table className='samll_table' dataSource={importResult} columns={columns} pagination={false} size='small' />
                  </>
                )}
              </>
            );
            break;
        }
      })()}
    </Modal>
  );
}
