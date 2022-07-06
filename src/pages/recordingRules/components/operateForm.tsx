import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Select, Button, Modal, message, Space, Tooltip, Tag, notification } from 'antd';
import { QuestionCircleFilled, CaretDownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import { prometheusQuery } from '@/services/warning';
import { addOrEditRecordingRule, editRecordingRule, deleteRecordingRule } from '@/services/recording';
import PromQLInput from '@/components/PromQLInput';

const { Option } = Select;
const layout = {
  labelCol: {
    span: 3,
  },
  wrapperCol: {
    span: 21,
  },
};

interface Props {
  detail?: any;
  type?: number; // 1:编辑 2:克隆
}

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

const operateForm: React.FC<Props> = ({ type, detail = {} }) => {
  const { t } = useTranslation();
  const history = useHistory(); // 创建的时候默认选中的值
  const [form] = Form.useForm();
  const { clusters: clusterList } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const [initVal, setInitVal] = useState<any>({});
  const [refresh, setRefresh] = useState(true);
  const [curClusters, setCurClusters] = useState<any>(clusterList[0]);
  const { curBusiItem } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const params: any = useParams();
  const strategyId = useMemo(() => {
    return params.id;
  }, [params]);

  useEffect(() => {
    const data = {
      ...detail,
    };
    setInitVal(data);
  }, [JSON.stringify(detail)]);

  const addSubmit = () => {
    form.validateFields().then(async (values) => {
      const res = await prometheusQuery({ query: values.prom_ql }, values.cluster);
      if (res.error) {
        notification.error({
          message: res.error,
        });
        return false;
      }

      const d = {
        ...values,
      };
      let reqBody,
        method = 'Post';
      if (type === 1) {
        reqBody = d;
        method = 'Put';
        const res = await editRecordingRule(reqBody, curBusiItem.id, strategyId);
        if (res.err) {
          message.error(res.error);
        } else {
          message.success(t('编辑成功！'));
          history.push('/recording-rules');
        }
      } else {
        reqBody = [d];
        const { dat } = await addOrEditRecordingRule(reqBody, curBusiItem.id, method);
        let errorNum = 0;
        const msg = Object.keys(dat).map((key) => {
          dat[key] && errorNum++;
          return dat[key];
        });
        if (!errorNum) {
          message.success(`${type === 2 ? t('记录规则克隆成功') : t('记录规则创建成功')}`);
          history.push('/recording-rules');
        } else {
          message.error(t(msg));
        }
      }
    });
  };

  return (
    <div className='operate_con'>
      <Form
        {...layout}
        form={form}
        className='strategy-form'
        layout={refresh ? 'horizontal' : 'horizontal'}
        initialValues={{
          prom_eval_interval: 30,
          cluster: clusterList[0] || 'Default', // 生效集群
          ...detail,
        }}
      >
        <Space direction='vertical' style={{ width: '100%' }}>
          <Card title={t('基本配置')}>
            <Form.Item required label={t('指标名称：')}>
              <Space>
                <Form.Item
                  style={{ marginBottom: 0, width: 500 }}
                  name='name'
                  rules={[
                    {
                      required: true,
                      message: t('指标名称不能为空'),
                    },
                    { pattern: new RegExp(/^[0-9a-zA-Z_:]{1,}$/, 'g'), message: '指标名称非法' },
                  ]}
                >
                  <Input placeholder={t('请输入指标名称')} />
                </Form.Item>
                <Tooltip title={t('promql周期性计算，会生成新的指标，这里填写新的指标的名字')}>
                  <QuestionCircleFilled />
                </Tooltip>
              </Space>
            </Form.Item>
            <Form.Item
              label={t('规则备注：')}
              name='note'
              rules={[
                {
                  required: false,
                },
              ]}
            >
              <Input placeholder={t('请输入规则备注')} />
            </Form.Item>
            <Form.Item
              label={t('生效集群')}
              name='cluster'
              rules={[
                {
                  required: true,
                  message: t('生效集群不能为空'),
                },
              ]}
            >
              <Select
                suffixIcon={<CaretDownOutlined />}
                onChange={(value) => {
                  setCurClusters(value);
                }}
              >
                {clusterList?.map((item) => (
                  <Option value={item} key={item}>
                    {item}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item noStyle shouldUpdate={(prevValues, curValues) => prevValues.cluster !== curValues.cluster}>
              {({ getFieldValue, validateFields }) => {
                return (
                  <Form.Item label='PromQL' className={'Promeql-content'} required>
                    <Form.Item name='prom_ql' validateTrigger={['onBlur']} trigger='onChange' rules={[{ required: true, message: t('请输入PromQL') }]}>
                      <PromQLInput
                        url='/api/n9e/prometheus'
                        headers={{
                          'X-Cluster': getFieldValue('cluster'),
                          Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
                        }}
                        onChange={(val) => {
                          if (val) {
                            validateFields(['prom_ql']);
                          }
                        }}
                      />
                    </Form.Item>
                  </Form.Item>
                );
              }}
            </Form.Item>

            <Form.Item required label={t('执行频率')}>
              <Space>
                <Form.Item
                  style={{ marginBottom: 0 }}
                  name='prom_eval_interval'
                  initialValue={30}
                  wrapperCol={{ span: 10 }}
                  rules={[
                    {
                      required: true,
                      message: t('执行频率不能为空'),
                    },
                  ]}
                >
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
            <Form.Item label='附加标签' name='append_tags' rules={[{ required: false, message: '请填写至少一项标签！' }, isValidFormat]}>
              <Select mode='tags' tokenSeparators={[' ']} open={false} placeholder={'标签格式为 key=value ，使用回车或空格分隔'} tagRender={tagRender} />
            </Form.Item>
          </Card>
          <Form.Item
            style={{
              marginTop: 20,
            }}
          >
            <Button type='primary' onClick={addSubmit} style={{ marginRight: '8px' }}>
              {type === 1 ? t('编辑') : type === 2 ? t('克隆') : t('创建')}
            </Button>
            {type === 1 && (
              <Button
                danger
                style={{ marginRight: '8px' }}
                onClick={() => {
                  Modal.confirm({
                    title: t('是否删除该记录规则?'),
                    onOk: () => {
                      deleteRecordingRule([detail.id], curBusiItem.id).then(() => {
                        message.success(t('删除成功'));
                        history.push('/recording-rules');
                      });
                    },

                    onCancel() {},
                  });
                }}
              >
                {t('删除')}
              </Button>
            )}

            <Button
              onClick={() => {
                history.push('/recording-rules');
              }}
            >
              {t('取消')}
            </Button>
          </Form.Item>
        </Space>
      </Form>
    </div>
  );
};

export default operateForm;
