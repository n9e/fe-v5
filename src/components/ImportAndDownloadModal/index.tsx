import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import { download, copyToClipBoard } from '@/utils';
import { Button, Modal, Form, Input, message, Table, Select } from 'antd';
const { Option } = Select;
import './index.less';
import { useTranslation } from 'react-i18next';
import { CopyOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
const { TextArea } = Input;
export const enum ModalStatus {
  Import = 'import',
  Export = 'export',
  None = 'hide',
}
interface Props {
  title?: string;
  description?: string;
  status: ModalStatus;
  exportData: string;
  onClose: () => void;
  onSubmit: Function;
}
export default function ImportAndDownloadModal(props: Props) {
  const { t } = useTranslation();
  const exportTextRef = useRef(null as any);
  const { status, title, exportData, description, onClose, onSubmit } = props;
  const [form] = Form.useForm();
  const { clusters: clusterList } = useSelector<RootState, CommonStoreState>(
    (state) => state.common,
  );

  const handleExportTxt = () => {
    download([exportData], 'download.json');
  };

  return (
    <Modal
      title={status === ModalStatus.Export ? t('导出') + title : t('导入') + title}
      destroyOnClose={true}
      footer={
        status === ModalStatus.Import && (
          <>
            <Button key='delete' onClick={() => onClose()}>
              {t('取消')}
            </Button>
            <Button
              key='submit'
              type='primary'
              onClick={async () => {
                await form.validateFields();
                const data = form.getFieldsValue();
                console.log('formdata=', data);
                try {
                  const importData = JSON.parse(data.import);
                  console.log('importData=', importData);
                  if (!Array.isArray(importData)) {
                    message.error('告警规则JSON需要时数组');
                    return;
                  }
                  const requstBody = importData.map(item => {
                    return {
                      ...item,
                      cluster: data.cluster
                    }
                  });
                  const dat = await onSubmit(requstBody);
                  let errNum = 0;
                  const dataSource = Object.keys(dat).map(key => {
                    dat[key] && errNum++;
                    return {
                      name: key,
                      key: key,
                      isTrue: !dat[key],
                      msg: dat[key]
                    }
                  });
                  const columns = [
                    {
                      title: '规则',
                      dataIndex: 'name',
                    },
                    {
                      title: '结果',
                      dataIndex: 'isTrue',
                      render: (data) => {
                        return data ?
                          <CheckCircleOutlined style={{ color: '#389e0d', fontSize: '18px' }} /> :
                          <CloseCircleOutlined style={{ color: '#d4380d', fontSize: '18px' }} />;
                      }
                    },
                    {
                      title: '错误消息',
                      dataIndex: 'msg',
                    }
                  ];
                  Modal.success({
                    title: '导入结果',
                    width: '50%',
                    icon: null,
                    closable: true,
                    maskClosable: true,
                    content: <Table className="samll_table" dataSource={dataSource} columns={columns} pagination={false} size="small" />,
                    onOk: () => {
                      !errNum && onClose();
                    }
                  })
                  // 每个业务各自处理onSubmit
                } catch (error) {
                  message.error(t('数据有误:') + error);
                }
              }}
            >
              {t('确定')}
            </Button>
          </>
        )
      }
      onCancel={() => onClose()}
      visible={status !== 'hide'}
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
              <div contentEditable='true' suppressContentEditableWarning={true} ref={exportTextRef} className='export-dialog'>
                <pre>{exportData}</pre>
              </div>
            );
            break;

          case ModalStatus.Import:
            return (
              <Form form={form} preserve={false} layout="vertical">
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
                <Form.Item
                  label={t('告警规则JSON：')}
                  name='import'
                  rules={[
                    {
                      required: true,
                      message: t('请输入') + title,
                      validateTrigger: 'trigger',
                    },
                  ]}
                >
                  <TextArea placeholder={t('请输入') + title} rows={4}></TextArea>
                </Form.Item>
              </Form>
            );
            break;
        }
      })()}
    </Modal>
  );
}
