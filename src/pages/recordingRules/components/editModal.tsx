import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Form, Input, InputNumber, Select, Tag, Space, Tooltip, Modal, Switch } from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';

const { Option } = Select;
const layout = {
  labelCol: {
    span: 3,
  },
  wrapperCol: {
    span: 20,
  },
};

const fields = [
  {
    id: 2,
    field: 'cluster',
    name: '集群',
  },
  {
    id: 5,
    field: 'prom_eval_interval',
    name: '执行频率',
  },
  {
    id: 4,
    field: 'disabled',
    name: '启用',
  },
  {
    id: 12,
    field: 'append_tags',
    name: '附加标签',
  },
];

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
      const isInvalid =
        value &&
        value.some((tag) => {
          const { isCorrectFormat, isLengthAllowed } = isTagValid(tag);
          if (!isCorrectFormat || !isLengthAllowed) {
            return true;
          }
        });
      return isInvalid ? Promise.reject(new Error('标签格式不正确，请检查！')) : Promise.resolve();
    },
  };
}

interface Props {
  isModalVisible: boolean;
  editModalFinish: Function;
}

const editModal: React.FC<Props> = ({ isModalVisible, editModalFinish }) => {
  const { t } = useTranslation();

  const [form] = Form.useForm();
  const { clusters: clusterList } = useSelector<RootState, CommonStoreState>((state) => state.common);

  const [field, setField] = useState<string>('cluster');
  const [refresh, setRefresh] = useState(true);

  const modelOk = () => {
    form.validateFields().then(async (values) => {
      const data = { ...values };
      delete data.field;
      if (values.field === 'disabled') {
        data.disabled = !values.enable_status ? 1 : 0;
        delete data.enable_status;
      }
      Object.keys(data).forEach((key) => {
        // 因为功能上有清除备注的需求，需要支持传空
        if (data[key] === undefined) {
          data[key] = '';
        }
        if (Array.isArray(data[key])) {
          data[key] = data[key].join(' ');
        }
      });
      editModalFinish(true, data);
    });
  };

  const editModalClose = () => {
    editModalFinish(false);
  };

  const fieldChange = (val) => {
    setField(val);
  };

  return (
    <>
      <Modal
        title={t('批量更新')}
        visible={isModalVisible}
        onOk={modelOk}
        onCancel={() => {
          editModalClose();
        }}
      >
        <Form
          {...layout}
          form={form}
          className='strategy-form'
          layout={refresh ? 'horizontal' : 'horizontal'}
          initialValues={{
            prom_eval_interval: 15,
            cluster: clusterList[0] || 'Default', // 生效集群
            field: 'cluster',
            enable_status: true,
          }}
        >
          <Form.Item
            label={t('字段：')}
            name='field'
            rules={[
              {
                required: false,
              },
            ]}
          >
            <Select style={{ width: '100%' }} onChange={fieldChange}>
              {fields.map((item) => (
                <Option key={item.id} value={item.field}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {(() => {
            switch (field) {
              case 'note':
                return (
                  <>
                    <Form.Item
                      label={t('改为：')}
                      name='note'
                      rules={[
                        {
                          required: false,
                        },
                      ]}
                    >
                      <Input placeholder={t('请输入规则备注')} />
                    </Form.Item>
                  </>
                );
              case 'cluster':
                return (
                  <>
                    <Form.Item
                      label={t('改为：')}
                      name='cluster'
                      rules={[
                        {
                          required: false,
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
                  </>
                );

              case 'prom_eval_interval':
                return (
                  <>
                    <Form.Item
                      label={t('改为：')}
                      rules={[
                        {
                          required: false,
                          message: t('执行频率不能为空'),
                        },
                      ]}
                    >
                      <Space>
                        <Form.Item style={{ marginBottom: 0 }} name='prom_eval_interval' initialValue={15} wrapperCol={{ span: 10 }}>
                          <InputNumber
                            min={1}
                            onChange={() => {
                              setRefresh(!refresh);
                            }}
                          />
                        </Form.Item>
                        秒
                        <Tooltip title={t(`promql 执行频率，每隔 ${form.getFieldValue('prom_eval_interval')} 秒查询时序库，查到的结果重新命名写回时序库`)}>
                          <QuestionCircleFilled />
                        </Tooltip>
                      </Space>
                    </Form.Item>
                  </>
                );
              case 'disabled':
                return (
                  <>
                    <Form.Item label={t('改为：')} name='enable_status' valuePropName='checked'>
                      <Switch />
                    </Form.Item>
                  </>
                );
              case 'append_tags':
                return (
                  <>
                    <Form.Item label='附加标签' name='append_tags' rules={[{ required: false, message: '请填写至少一项标签！' }, isValidFormat]}>
                      <Select mode='tags' tokenSeparators={[' ']} open={false} placeholder={'标签格式为 key=value ，使用回车或空格分隔'} tagRender={tagRender} />
                    </Form.Item>
                  </>
                );
              default:
                return null;
            }
          })()}
        </Form>
      </Modal>
    </>
  );
};

export default editModal;
