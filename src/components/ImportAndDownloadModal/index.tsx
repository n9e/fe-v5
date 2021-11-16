import React, { useRef } from 'react';
import { download, copyToClipBoard } from '@/utils';
import { Button, Modal, Form, Input, message, notification, Alert } from 'antd';
import './index.less';
import { useTranslation } from 'react-i18next';
import { CopyOutlined } from '@ant-design/icons';
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
                try {
                  JSON.parse(JSON.stringify(data));
                  await onSubmit(data.import);
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
              <Form form={form} preserve={false}>
                <Form.Item
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
